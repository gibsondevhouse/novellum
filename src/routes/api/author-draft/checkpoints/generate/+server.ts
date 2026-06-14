import { json, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { getPreference } from '$lib/server/preferences/preferences-service.js';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';
import {
	AiProviderError,
	createOllamaProvider,
	createOpenRouterProvider,
	OLLAMA_DEFAULT_BASE_URL,
} from '$lib/ai/providers/index.js';
import { ensureOllamaRunning } from '$lib/server/ai/ollama-launcher.js';
import type { AiProvider } from '$lib/ai/providers/types.js';
import {
	ACTIVE_PROVIDER_KEY,
	OLLAMA_BASE_URL_KEY,
	OLLAMA_MODEL_KEY,
	type ActiveProvider,
} from '$lib/ai/provider-config.js';
import { selectModel } from '$lib/ai/model-router.js';
import { buildSceneDraftContext } from '$lib/ai/pipeline/author-draft-context.js';
import { buildAuthorSceneDraftPrompt } from '$lib/ai/pipeline/author-draft-prompt.js';
import { createAuthorArtifactFromModelOutput } from '$lib/ai/pipeline/author-agent.js';
import {
	createAuthorDraftCheckpoint,
	getSceneDraftBaseGuard,
	listAuthorDraftCheckpoints,
	rejectAuthorDraftCheckpoint,
} from '$lib/ai/pipeline/author-draft-checkpoint-service.js';
import {
	AUTHOR_DRAFT_TASK_KEY,
	AUTHOR_DRAFT_ARTIFACT_TYPE,
	AUTHOR_DRAFT_ARTIFACT_VERSION,
} from '$lib/ai/pipeline/author-draft-contract.js';
import { getPipelineTaskDefinition } from '$lib/ai/pipeline/task-catalog.js';
import {
	KNOWN_AGENT_JOB_TYPES,
	enqueueKnownAgentJob,
	isQueuedExecutionRequest,
} from '$lib/server/agent-runtime/index.js';

const credentialService = createCredentialService();
const openRouterProvider = createOpenRouterProvider();

const MAX_OUTPUT_TOKENS = 2000;
const DEFAULT_TEMPERATURE = 0.6;
const TIMEOUT_MS = 60_000;

interface BodyShape {
	projectId?: unknown;
	sceneId?: unknown;
	forceRegenerate?: unknown;
	defer?: unknown;
	executionMode?: unknown;
}

interface ResolvedProvider {
	provider: AiProvider;
	apiKey: string;
	modelOverride?: string;
}

type LoadResult = { kind: 'ok'; resolved: ResolvedProvider } | { kind: 'mock' } | { kind: 'no_creds' };

async function loadProviderOrRespond(): Promise<LoadResult> {
	const activeProvider: ActiveProvider = getPreference<ActiveProvider>(ACTIVE_PROVIDER_KEY) ?? 'openrouter';

	if (activeProvider === 'ollama') {
		const baseUrl = getPreference<string>(OLLAMA_BASE_URL_KEY) ?? OLLAMA_DEFAULT_BASE_URL;
		const modelOverride = getPreference<string>(OLLAMA_MODEL_KEY) ?? undefined;
		const launchResult = await ensureOllamaRunning(baseUrl);
		if (!launchResult.ok) {
			console.warn(`[author-draft] ollama launch failed: ${launchResult.message}`);
		}
		return {
			kind: 'ok',
			resolved: { provider: createOllamaProvider({ baseUrl }), apiKey: '', modelOverride },
		};
	}

	const key = await credentialService.loadProviderKey('openrouter');
	if (key) {
		return { kind: 'ok', resolved: { provider: openRouterProvider, apiKey: key } };
	}

	if (process.env.NOVELLUM_AI_MOCK === '1') {
		console.warn('[author-draft] NOVELLUM_AI_MOCK=1 — returning mock responses');
		return { kind: 'mock' };
	}

	return { kind: 'no_creds' };
}

function withTimeoutSignal(signal: AbortSignal): AbortSignal {
	const timeoutSignal =
		typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
			? AbortSignal.timeout(TIMEOUT_MS)
			: null;
	if (!timeoutSignal) return signal;
	if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any === 'function') {
		return AbortSignal.any([signal, timeoutSignal]);
	}
	return signal;
}

export const POST: RequestHandler = async ({ request }) => {
	let body: BodyShape;
	try {
		body = (await request.json()) as BodyShape;
	} catch {
		error(400, 'Invalid JSON body');
	}

	const projectId = typeof body.projectId === 'string' ? body.projectId : '';
	const sceneId = typeof body.sceneId === 'string' ? body.sceneId : '';
	const forceRegenerate = body.forceRegenerate === true;

	if (!projectId || !sceneId) {
		return json({ error: 'missing projectId or sceneId' }, { status: 400 });
	}

	const existingActive =
		listAuthorDraftCheckpoints(projectId)
			.filter((checkpoint) => checkpoint.sceneId === sceneId)
			.filter((checkpoint) => checkpoint.lifecycle === 'review')
			.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;

	if (existingActive && !forceRegenerate) {
		return json({ checkpoint: existingActive, reused: true });
	}

	const context = buildSceneDraftContext(projectId, sceneId);
	if (!context) return json({ error: 'not found' }, { status: 404 });
	const draftContext = context;

	const baseGuard = getSceneDraftBaseGuard(projectId, sceneId);

	if (isQueuedExecutionRequest(body)) {
		return json(
			enqueueKnownAgentJob({
				jobType: KNOWN_AGENT_JOB_TYPES.authorDraftGenerate,
				projectId,
				family: 'author-draft',
				entrypoint: 'author-draft.generate',
				targetKind: 'scene',
				targetId: sceneId,
				targetJson: { projectId, sceneId, chapterId: baseGuard.chapterId },
				payloadRedactedJson: {
					projectId,
					sceneId,
					chapterId: baseGuard.chapterId,
					forceRegenerate,
					baseSceneUpdatedAt: baseGuard.baseSceneUpdatedAt,
					baseSceneContentHash: baseGuard.baseSceneContentHash,
				},
				priority: 30,
				maxAttempts: 2,
			}),
			{ status: 202 },
		);
	}

	function persistGenerationFailure(reason: string): void {
		// Keep existing active checkpoints intact (especially for regeneration attempts).
		if (existingActive) return;
		try {
			const checkpoint = createAuthorDraftCheckpoint({
				projectId,
				sceneId,
				chapterId: baseGuard.chapterId,
				artifact: {
					type: AUTHOR_DRAFT_ARTIFACT_TYPE,
					version: AUTHOR_DRAFT_ARTIFACT_VERSION,
					projectId,
					chapterId: baseGuard.chapterId,
					sceneId,
					title: draftContext.scene.title,
					prose: '',
					sidecar: {
						sceneId,
						chapterId: baseGuard.chapterId,
						povCharacterId: draftContext.scene.povCharacterId ?? null,
						wordCount: 0,
						usedCanonRefs: [],
						uncertainties: [],
						continuityRisks: [],
					},
				},
				baseSceneUpdatedAt: baseGuard.baseSceneUpdatedAt,
				baseSceneContentHash: baseGuard.baseSceneContentHash,
			});
			rejectAuthorDraftCheckpoint({
				projectId,
				checkpointId: checkpoint.id,
				reason: `Generation failed: ${reason}`,
			});
		} catch (err) {
			console.warn('[author-draft] failed to persist generation failure checkpoint', err);
		}
	}

	const keyResult = await loadProviderOrRespond();
	if (keyResult.kind === 'no_creds') {
		return json(
			{ error: { code: 'no_credentials', message: 'No AI provider credentials configured.' } },
			{ status: 401 },
		);
	}

	const prompt = buildAuthorSceneDraftPrompt(context);
	const selectedModel = getPreference<string>('app.selectedModel') ?? selectModel('pipeline');

	if (keyResult.kind === 'mock') {
		const checkpoint = createAuthorDraftCheckpoint({
			projectId,
			sceneId,
			chapterId: baseGuard.chapterId,
			artifact: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId,
				chapterId: baseGuard.chapterId,
				sceneId,
				title: context.scene.title,
				prose: `[Mock draft] Scene ${sceneId}`,
				sidecar: {
					sceneId,
					chapterId: baseGuard.chapterId,
					povCharacterId: context.scene.povCharacterId ?? null,
					wordCount: 0,
					usedCanonRefs: [],
					uncertainties: [],
					continuityRisks: [],
				},
			},
			baseSceneUpdatedAt: baseGuard.baseSceneUpdatedAt,
			baseSceneContentHash: baseGuard.baseSceneContentHash,
			forceRegenerate,
		});
		return json({ checkpoint });
	}

	const { provider, apiKey, modelOverride } = keyResult.resolved;
	const model = modelOverride ?? selectedModel;

	const taskDef = getPipelineTaskDefinition(AUTHOR_DRAFT_TASK_KEY);
	if (!taskDef) return json({ error: 'missing pipeline task definition' }, { status: 500 });

	const signal = withTimeoutSignal(request.signal);

	let rawOutput = '';
	let parseResult: ReturnType<typeof createAuthorArtifactFromModelOutput> | null = null;
	let lastParseFailure: string | null = null;

	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const result = await provider.complete(apiKey, {
				model,
				messages: [{ role: 'user', content: attempt === 0 ? prompt : buildRepairPrompt(prompt, lastParseFailure) }],
				temperature: DEFAULT_TEMPERATURE,
				maxTokens: MAX_OUTPUT_TOKENS,
				signal,
			});
			rawOutput = result.content ?? '';
		} catch (err) {
			if (err instanceof AiProviderError) {
				const status = err.code === 'invalid_key' ? 401 : err.code === 'rate_limit' ? 429 : 502;
				persistGenerationFailure(`${err.code}: ${err.message}`);
				return json({ error: { code: err.code, message: err.message } }, { status });
			}
			const message = err instanceof Error ? err.message : 'provider error';
			persistGenerationFailure(message);
			return json({ error: { code: 'provider_error', message } }, { status: 502 });
		}

		parseResult = createAuthorArtifactFromModelOutput({
			task: {
				key: taskDef.key,
				family: taskDef.family,
				stage: taskDef.stage,
				outputFormat: taskDef.outputFormat,
				role: taskDef.role,
				contextPolicy: taskDef.contextPolicy,
			},
			rawOutput,
			model,
		});

		if (!parseResult.ok) {
			lastParseFailure = parseResult.parse.fallbackMessage;
			continue;
		}

		const payload = parseResult.artifact.payload;
		if (taskDef.key === AUTHOR_DRAFT_TASK_KEY) {
			const sidecar = (payload as { sidecar?: { sceneId?: string; chapterId?: string } }).sidecar;
			if (!sidecar || sidecar.sceneId !== sceneId || sidecar.chapterId !== baseGuard.chapterId) {
				lastParseFailure =
					'Sidecar identifiers did not match the requested sceneId/chapterId. Regenerate with the correct IDs.';
				parseResult = null;
				continue;
			}
		}

		break;
	}

	if (!parseResult || !parseResult.ok) {
		persistGenerationFailure(lastParseFailure ?? 'Scene draft parse failed.');
		return json(
			{
				error: {
					code: 'parse_failed',
					message: lastParseFailure ?? 'Scene draft parse failed.',
				},
			},
			{ status: 422 },
		);
	}

	const payload = parseResult.artifact.payload as { prose: string; sidecar: Record<string, unknown> };
	const checkpoint = createAuthorDraftCheckpoint({
		projectId,
		sceneId,
		chapterId: baseGuard.chapterId,
		artifact: {
			type: AUTHOR_DRAFT_ARTIFACT_TYPE,
			version: AUTHOR_DRAFT_ARTIFACT_VERSION,
			projectId,
			chapterId: baseGuard.chapterId,
			sceneId,
			title: context.scene.title,
			prose: payload.prose,
			sidecar: payload.sidecar as unknown as {
				sceneId: string;
				chapterId: string;
				povCharacterId?: string;
				wordCount?: number;
				usedCanonRefs?: unknown;
				uncertainties?: unknown;
				continuityRisks?: unknown;
			},
		},
		baseSceneUpdatedAt: baseGuard.baseSceneUpdatedAt,
		baseSceneContentHash: baseGuard.baseSceneContentHash,
		forceRegenerate,
	});

	return json(dev ? { checkpoint, rawOutput } : { checkpoint });
};

function buildRepairPrompt(prompt: string, failure: string | null): string {
	return [
		prompt,
		'',
		'## REPAIR REQUEST',
		`The previous output failed validation: ${failure ?? 'unknown parse failure'}`,
		'Re-generate the ENTIRE response and follow OUTPUT FORMAT exactly.',
	].join('\n');
}
