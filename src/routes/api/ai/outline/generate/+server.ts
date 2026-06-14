import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { getPreference } from '$lib/server/preferences/preferences-service.js';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';
import {
	AiProviderError,
	createOllamaProvider,
	createOpenRouterProvider,
	OLLAMA_DEFAULT_BASE_URL,
} from '$lib/ai/providers/index.js';
import type { AiProvider } from '$lib/ai/providers/types.js';
import { ensureOllamaRunning } from '$lib/server/ai/ollama-launcher.js';
import {
	ACTIVE_PROVIDER_KEY,
	OLLAMA_BASE_URL_KEY,
	OLLAMA_MODEL_KEY,
	type ActiveProvider,
} from '$lib/ai/provider-config.js';
import { selectOutlineGenerationModel } from '$lib/ai/model-router.js';
import { WORLDBUILD_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';
import { OUTLINE_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/outline-checkpoint-contract.js';
import {
	OUTLINE_DRAFT_SCHEMA_VERSION,
	type OutlineDraft,
	type OutlineDraftValidationIssue,
	validateOutlineDraft,
} from '$lib/ai/pipeline/outline-draft-contract.js';
import {
	buildOutlineContextPacket,
	type OutlineContextPacket,
} from '$lib/ai/pipeline/outline-context-builder.js';
import {
	buildOutlineGenerationPrompt,
	buildOutlineGenerationRepairPrompt,
} from '$lib/ai/pipeline/outline-generation-prompt.js';
import {
	reviewOutlineDraftCheckpoint,
	upsertOutlineDraftCheckpoint,
} from '$lib/ai/pipeline/outline-checkpoint-service.js';
import { getOutlineConflictPreflight } from '$lib/server/outline/outline-conflict-preflight.js';
import {
	KNOWN_AGENT_JOB_TYPES,
	enqueueKnownAgentJob,
	isQueuedExecutionRequest,
} from '$lib/server/agent-runtime/index.js';

const credentialService = createCredentialService();
const openRouterProvider = createOpenRouterProvider();

const MAX_OUTPUT_TOKENS = 6000;
const DEFAULT_TEMPERATURE = 0.35;
const TIMEOUT_MS = 90_000;
const MAX_INSTRUCTION_LENGTH = 1_000;

interface BodyShape {
	projectId?: unknown;
	instruction?: unknown;
	confirmContextReady?: unknown;
	defer?: unknown;
	executionMode?: unknown;
}

interface ResolvedProvider {
	provider: AiProvider;
	apiKey: string;
	modelOverride?: string;
}

type LoadResult = { kind: 'ok'; resolved: ResolvedProvider } | { kind: 'mock' } | { kind: 'no_creds' };

type JsonRecord = Record<string, unknown>;
type ContextTable =
	| 'storyFrames'
	| 'characters'
	| 'plotThreads'
	| 'locations'
	| 'factions'
	| 'loreEntries'
	| 'timelineEvents'
	| 'themes';

const CONTEXT_TABLE_QUERIES: Record<ContextTable, string> = {
	storyFrames: 'SELECT * FROM story_frames WHERE projectId = ?',
	characters: 'SELECT * FROM characters WHERE projectId = ?',
	plotThreads: 'SELECT * FROM plot_threads WHERE projectId = ?',
	locations: 'SELECT * FROM locations WHERE projectId = ?',
	factions: 'SELECT * FROM factions WHERE projectId = ?',
	loreEntries: 'SELECT * FROM lore_entries WHERE projectId = ?',
	timelineEvents: 'SELECT * FROM timeline_events WHERE projectId = ?',
	themes: 'SELECT * FROM themes WHERE projectId = ?',
};

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown, maxLength = Number.MAX_SAFE_INTEGER): string {
	return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

async function loadProviderOrRespond(): Promise<LoadResult> {
	const activeProvider: ActiveProvider = getPreference<ActiveProvider>(ACTIVE_PROVIDER_KEY) ?? 'openrouter';

	if (activeProvider === 'ollama') {
		const baseUrl = getPreference<string>(OLLAMA_BASE_URL_KEY) ?? OLLAMA_DEFAULT_BASE_URL;
		const modelOverride = getPreference<string>(OLLAMA_MODEL_KEY) ?? undefined;
		const launchResult = await ensureOllamaRunning(baseUrl);
		if (!launchResult.ok) {
			console.warn(`[outline-generation] ollama launch failed: ${launchResult.message}`);
		}
		return {
			kind: 'ok',
			resolved: { provider: createOllamaProvider({ baseUrl }), apiKey: '', modelOverride },
		};
	}

	const key = await credentialService.loadProviderKey('openrouter');
	if (key) return { kind: 'ok', resolved: { provider: openRouterProvider, apiKey: key } };
	if (process.env.NOVELLUM_AI_MOCK === '1') return { kind: 'mock' };
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

function loadProject(projectId: string): JsonRecord | null {
	const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as JsonRecord | undefined;
	return row ?? null;
}

function loadRows(table: ContextTable, projectId: string): JsonRecord[] {
	return db.prepare(CONTEXT_TABLE_QUERIES[table]).all(projectId) as JsonRecord[];
}

function loadAcceptedWorldbuildCheckpoints(projectId: string): unknown[] {
	const rows = db
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ?',
		)
		.all(projectId, 'pipeline', WORLDBUILD_CHECKPOINT_OWNER_ID) as Array<{ value: string }>;
	return rows
		.map((row) => {
			try {
				return JSON.parse(row.value) as unknown;
			} catch {
				return row.value;
			}
		})
		.filter((value) => isRecord(value) && value.lifecycle === 'accepted');
}

function buildPacket(projectId: string): OutlineContextPacket | null {
	const project = loadProject(projectId);
	if (!project) return null;
	return buildOutlineContextPacket({
		project,
		storyFrames: loadRows('storyFrames', projectId),
		worldbuilding: {
			characters: loadRows('characters', projectId),
			plotThreads: loadRows('plotThreads', projectId),
			locations: loadRows('locations', projectId),
			factions: loadRows('factions', projectId),
			loreEntries: loadRows('loreEntries', projectId),
			timelineEvents: loadRows('timelineEvents', projectId),
			themes: loadRows('themes', projectId),
			acceptedCheckpoints: loadAcceptedWorldbuildCheckpoints(projectId),
		},
	});
}

function validateGeneratedDraft(raw: string, projectId: string): { ok: true; draft: OutlineDraft } | { ok: false; issues: OutlineDraftValidationIssue[] } {
	const result = validateOutlineDraft(raw);
	if (!result.ok) return result;
	if (result.data.projectId !== projectId) {
		return {
			ok: false,
			issues: [
				{
					path: '$.projectId',
					message: `Outline draft projectId must match ${projectId}.`,
					code: 'project_mismatch',
				},
			],
		};
	}
	return { ok: true, draft: result.data };
}

function normalizeDraft(
	draft: OutlineDraft,
	packet: OutlineContextPacket,
	promptVersion: string,
): OutlineDraft {
	return {
		...draft,
		sourceContext: {
			...draft.sourceContext,
			contextHash: packet.contextHash,
			promptVersion,
		},
	};
}

function safeIssues(issues: OutlineDraftValidationIssue[]): OutlineDraftValidationIssue[] {
	return issues.slice(0, 12);
}

function providerErrorResponse(err: AiProviderError): Response {
	const status = err.code === 'invalid_key' ? 401 : err.code === 'rate_limit' ? 429 : 502;
	return json({ error: { code: err.code, message: err.message } }, { status });
}

function isAbortError(err: unknown): boolean {
	return err instanceof DOMException && err.name === 'AbortError';
}

function createCheckpointId(projectId: string): string {
	const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	return `outline-draft-${projectId}-${suffix}`;
}

export const POST: RequestHandler = async ({ request }) => {
	let body: BodyShape;
	try {
		body = (await request.json()) as BodyShape;
	} catch {
		return json({ error: { code: 'invalid_json', message: 'Invalid JSON body.' } }, { status: 400 });
	}

	const projectId = asTrimmedString(body.projectId, 128);
	const instruction = asTrimmedString(body.instruction, MAX_INSTRUCTION_LENGTH);
	const confirmContextReady = body.confirmContextReady === true;

	if (!projectId) {
		return json({ error: { code: 'invalid_request', message: 'projectId is required.' } }, { status: 400 });
	}

	const packet = buildPacket(projectId);
	if (!packet) {
		return json({ error: { code: 'not_found', message: 'Project was not found.' } }, { status: 404 });
	}

	if (!packet.readiness.ok) {
		return json(
			{
				error: {
					code: 'context_not_ready',
					message: 'Outline generation needs more project context before it can run.',
					missing: packet.readiness.missing,
					warnings: packet.readiness.warnings,
				},
			},
			{ status: 422 },
		);
	}

	if (isQueuedExecutionRequest(body)) {
		return json(
			enqueueKnownAgentJob({
				jobType: KNOWN_AGENT_JOB_TYPES.outlineGenerate,
				projectId,
				family: 'outline',
				entrypoint: 'outline.generate',
				targetKind: 'project',
				targetId: projectId,
				targetJson: { projectId, contextHash: packet.contextHash },
				payloadRedactedJson: {
					projectId,
					instruction,
					confirmContextReady,
					contextHash: packet.contextHash,
				},
				priority: 20,
				maxAttempts: 2,
			}),
			{ status: 202 },
		);
	}

	const providerResult = await loadProviderOrRespond();
	if (providerResult.kind === 'no_creds') {
		return json(
			{ error: { code: 'no_credentials', message: 'No AI provider credentials configured.' } },
			{ status: 401 },
		);
	}

	const promptBundle = buildOutlineGenerationPrompt(packet);
	const selectedModel = getPreference<string>('app.selectedModel') ?? selectOutlineGenerationModel();

	if (providerResult.kind === 'mock') {
		return json(
			{
				error: {
					code: 'mock_not_supported',
					message: 'Outline generation mock output is not implemented for this route.',
				},
			},
			{ status: 501 },
		);
	}

	const { provider, apiKey, modelOverride } = providerResult.resolved;
	const model = modelOverride ?? selectedModel;
	const signal = withTimeoutSignal(request.signal);
	const messages = [
		{
			role: 'user' as const,
			content: instruction
				? `${promptBundle.prompt}\n\n## AUTHOR INSTRUCTION\n${instruction}`
				: promptBundle.prompt,
		},
	];

	let validation: ReturnType<typeof validateGeneratedDraft> | null = null;
	let completedAttempts = 0;

	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const content =
				attempt === 0
					? messages[0].content
					: buildOutlineGenerationRepairPrompt({
							contextHash: packet.contextHash,
							validationIssues: validation && !validation.ok ? validation.issues : [],
						});
			const response = await provider.complete(apiKey, {
				model,
				messages: [{ role: 'user', content }],
				temperature: DEFAULT_TEMPERATURE,
				maxTokens: MAX_OUTPUT_TOKENS,
				responseFormat: promptBundle.responseFormat,
				signal,
			});
			completedAttempts += 1;
			validation = validateGeneratedDraft(response.content ?? '', projectId);
			if (validation.ok) break;
		} catch (err) {
			if (err instanceof AiProviderError) return providerErrorResponse(err);
			if (isAbortError(err)) {
				return json({ error: { code: 'aborted', message: 'Outline generation was cancelled.' } }, { status: 499 });
			}
			const message = err instanceof Error ? err.message : 'Provider request failed.';
			return json({ error: { code: 'provider_error', message } }, { status: 502 });
		}
	}

	if (!validation || !validation.ok) {
		return json(
			{
				error: {
					code: 'schema_validation_failed',
					message: 'Outline generation response did not match the required schema.',
					issues: validation ? safeIssues(validation.issues) : [],
				},
			},
			{ status: 422 },
		);
	}

	if (!loadProject(projectId)) {
		return json({ error: { code: 'not_found', message: 'Project was not found.' } }, { status: 404 });
	}

	const draft = normalizeDraft(validation.draft, packet, promptBundle.promptVersion);
	const outlineConflict = getOutlineConflictPreflight(projectId);
	const checkpointId = createCheckpointId(projectId);
	upsertOutlineDraftCheckpoint(projectId, OUTLINE_CHECKPOINT_OWNER_ID, checkpointId, {
		draft,
		version: OUTLINE_DRAFT_SCHEMA_VERSION,
	});
	const checkpoint = reviewOutlineDraftCheckpoint(projectId, OUTLINE_CHECKPOINT_OWNER_ID, checkpointId, {
		reviewer: 'outline-generation-route',
		note: `Generated from context ${packet.contextHash}.`,
	});

	return json({
		checkpoint,
		contextHash: packet.contextHash,
		attempts: completedAttempts,
		confirmContextReady,
		outlineConflict: outlineConflict.hasConflict ? outlineConflict : null,
	});
};
