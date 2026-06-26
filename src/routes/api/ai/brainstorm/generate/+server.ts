import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	buildBrainstormPrompt,
	buildContext,
	getBrainstormResponseFormat,
	parseBrainstormOutput,
	resolveTask,
	selectModel,
} from '$lib/ai/index.js';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';
import {
	AiProviderError,
	createOllamaProvider,
	createOpenRouterProvider,
	OLLAMA_DEFAULT_BASE_URL,
} from '$lib/ai/providers/index.js';
import type { AiProvider } from '$lib/ai/providers/types.js';
import { getPreference } from '$lib/server/preferences/preferences-service.js';
import {
	ACTIVE_PROVIDER_KEY,
	OLLAMA_BASE_URL_KEY,
	OLLAMA_MODEL_KEY,
	type ActiveProvider,
} from '$lib/ai/provider-config.js';
import { ensureOllamaRunning } from '$lib/server/ai/ollama-launcher.js';
import { validateModelForTask } from '$lib/ai/model-capabilities.js';
import { auditControllerEntrypointSafely } from '$lib/server/ai/controller/index.js';
import {
	BRAINSTORM_AGENT_SCHEMA_VERSION,
	BRAINSTORM_PROPOSAL_CATEGORIES,
	type AiContext,
	type BrainstormAgentContextConstraints,
	type BrainstormAgentRequest,
	type BrainstormProposalCategory,
} from '$lib/ai/types.js';

const credentialService = createCredentialService();
const openRouterProvider = createOpenRouterProvider();

const MAX_OUTPUT_TOKENS = 4_000;
const DEFAULT_TEMPERATURE = 0.7;
const TIMEOUT_MS = 60_000;
const MAX_SEED_IDEA_LENGTH = 2_000;
const MAX_CONTEXT_FIELD_LENGTH = 500;
const MAX_CONTEXT_LIST_ITEMS = 8;

interface BodyShape {
	seedIdea?: unknown;
	projectId?: unknown;
	activeSceneId?: unknown;
	activeChapterId?: unknown;
	context?: unknown;
	requestedCategories?: unknown;
	maxProposalsPerCategory?: unknown;
}

interface ResolvedProvider {
	provider: AiProvider;
	apiKey: string;
	modelOverride?: string;
}

type LoadResult = { kind: 'ok'; resolved: ResolvedProvider } | { kind: 'mock' } | { kind: 'no_creds' };
type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown, maxLength = Number.MAX_SAFE_INTEGER): string {
	return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function sanitizeStringList(value: unknown): string[] | undefined {
	if (!Array.isArray(value)) return undefined;
	const result = value
		.map((item) => asTrimmedString(item, MAX_CONTEXT_FIELD_LENGTH))
		.filter(Boolean)
		.slice(0, MAX_CONTEXT_LIST_ITEMS);
	return result.length > 0 ? result : undefined;
}

function sanitizeRequestedCategories(value: unknown): BrainstormProposalCategory[] | undefined {
	if (!Array.isArray(value)) return undefined;
	const categories = value.filter((item): item is BrainstormProposalCategory =>
		(BRAINSTORM_PROPOSAL_CATEGORIES as readonly string[]).includes(String(item)),
	);
	return categories.length > 0 ? [...new Set(categories)] : undefined;
}

function sanitizeMaxProposals(value: unknown): number | undefined {
	if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
	const normalized = Math.trunc(value);
	return Math.max(1, Math.min(4, normalized));
}

function sanitizeContext(value: unknown): BrainstormAgentContextConstraints {
	if (!isRecord(value)) return {};
	return {
		projectId: asTrimmedString(value.projectId, 128) || undefined,
		projectTitle: asTrimmedString(value.projectTitle, MAX_CONTEXT_FIELD_LENGTH) || undefined,
		genre: asTrimmedString(value.genre, MAX_CONTEXT_FIELD_LENGTH) || undefined,
		intendedAudience: asTrimmedString(value.intendedAudience, MAX_CONTEXT_FIELD_LENGTH) || undefined,
		tone: asTrimmedString(value.tone, MAX_CONTEXT_FIELD_LENGTH) || undefined,
		existingPremise: asTrimmedString(value.existingPremise, MAX_CONTEXT_FIELD_LENGTH) || undefined,
		comparableTitles: sanitizeStringList(value.comparableTitles),
		mustInclude: sanitizeStringList(value.mustInclude),
		avoid: sanitizeStringList(value.avoid),
		contentWarningsToAvoid: sanitizeStringList(value.contentWarningsToAvoid),
	};
}

function deriveContextConstraints(
	projectId: string,
	ctx: AiContext | undefined,
	bodyContext: BrainstormAgentContextConstraints,
): BrainstormAgentContextConstraints {
	const frame = ctx?.storyFrames?.[0];
	return {
		projectId,
		projectTitle: ctx?.project?.title,
		genre: ctx?.project?.genre,
		existingPremise: ctx?.project?.logline || frame?.premise,
		tone: frame?.toneNotes,
		...bodyContext,
	};
}

function countContextItems(ctx: AiContext | undefined): number {
	if (!ctx) return 0;
	return (
		(ctx.project ? 1 : 0) +
		(ctx.storyFrames?.length ?? 0) +
		ctx.characters.length +
		ctx.locations.length +
		ctx.loreEntries.length +
		ctx.plotThreads.length +
		(ctx.timelineEvents?.length ?? 0) +
		(ctx.factions?.length ?? 0) +
		(ctx.themes?.length ?? 0)
	);
}

async function loadProviderOrRespond(): Promise<LoadResult> {
	const activeProvider: ActiveProvider = getPreference<ActiveProvider>(ACTIVE_PROVIDER_KEY) ?? 'openrouter';

	if (activeProvider === 'ollama') {
		const baseUrl = getPreference<string>(OLLAMA_BASE_URL_KEY) ?? OLLAMA_DEFAULT_BASE_URL;
		const modelOverride = getPreference<string>(OLLAMA_MODEL_KEY) ?? undefined;
		const launchResult = await ensureOllamaRunning(baseUrl);
		if (!launchResult.ok) {
			console.warn(`[brainstorm-generation] ollama launch failed: ${launchResult.message}`);
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

function providerErrorResponse(err: AiProviderError): Response {
	const status = err.code === 'invalid_key' ? 401 : err.code === 'rate_limit' ? 429 : 502;
	return json({ error: { code: err.code, message: err.message } }, { status });
}

function isAbortError(err: unknown): boolean {
	return err instanceof DOMException && err.name === 'AbortError';
}

function createMockSession(seedIdea: string) {
	return {
		schemaVersion: BRAINSTORM_AGENT_SCHEMA_VERSION,
		seedIdea,
		proposals: {
			premiseVariants: [
				{
					id: 'mock-premise-1',
					category: 'premise_variant',
					title: 'Pressure Map',
					description: `A story premise that turns "${seedIdea}" into a visible conflict the protagonist can investigate.`,
					rationale: 'Keeps the seed concrete while preserving author review.',
					confidence: 'medium',
					worldbuildSeedTarget: 'premise_note',
					tags: ['mock', 'premise'],
				},
			],
			thematicThreads: [
				{
					id: 'mock-theme-1',
					category: 'thematic_thread',
					title: 'Truth Under Strain',
					description: 'The core idea tests what people protect when facts become costly.',
					rationale: 'Gives later worldbuilding a durable thematic axis.',
					confidence: 'medium',
					worldbuildSeedTarget: 'theme_seed',
				},
			],
			genreHooks: [
				{
					id: 'mock-hook-1',
					category: 'genre_hook',
					title: 'Mystery With Consequences',
					description: 'Each clue changes the social or physical rules of the setting.',
					rationale: 'Creates a repeatable hook without writing manuscript prose.',
				},
			],
			protagonistSketches: [
				{
					id: 'mock-protagonist-1',
					category: 'protagonist_sketch',
					title: 'Reluctant Pattern-Finder',
					description: 'A careful observer notices the seed idea before anyone in power wants it named.',
					rationale: 'Supplies a character seed rather than a canonical character.',
					worldbuildSeedTarget: 'character_seed',
					storyQuestion: 'What did they gain by ignoring the pattern once before?',
				},
			],
		},
	};
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	let body: BodyShape;
	try {
		body = (await request.json()) as BodyShape;
	} catch {
		return json({ error: { code: 'invalid_json', message: 'Invalid JSON body.' } }, { status: 400 });
	}

	const seedIdea = asTrimmedString(body.seedIdea, MAX_SEED_IDEA_LENGTH);
	const projectId = asTrimmedString(body.projectId, 128);
	const activeSceneId = asTrimmedString(body.activeSceneId, 128);
	const activeChapterId = asTrimmedString(body.activeChapterId, 128);

	if (!seedIdea) {
		return json({ error: { code: 'invalid_request', message: 'seedIdea is required.' } }, { status: 400 });
	}

	auditControllerEntrypointSafely({
		route: '/api/ai/brainstorm/generate',
		requestId: `brainstorm-generate:${projectId || 'no-project'}:${Date.now()}`,
		projectId: projectId || undefined,
		workflowId: 'brainstorm.generate',
		intent: 'brainstorm.generate',
		metadata: { seedLength: seedIdea.length, activeSceneId, activeChapterId },
	});

	let aiContext: AiContext | undefined;
	const warnings: string[] = [];
	if (projectId) {
		const task = resolveTask('brainstorm', {
			activeProjectId: projectId,
			activeSceneId: activeSceneId || null,
			activeChapterId: activeChapterId || null,
			activeBeatId: null,
			instruction: seedIdea,
		});
		try {
			aiContext = await buildContext(task, projectId, { fetch });
		} catch {
			warnings.push('Project context could not be loaded; generated from the seed idea only.');
		}
	}

	const bodyContext = sanitizeContext(body.context);
	const brainstormRequest: BrainstormAgentRequest = {
		seedIdea,
		context: projectId ? deriveContextConstraints(projectId, aiContext, bodyContext) : bodyContext,
		requestedCategories: sanitizeRequestedCategories(body.requestedCategories),
		maxProposalsPerCategory: sanitizeMaxProposals(body.maxProposalsPerCategory),
	};

	const selectedModel = getPreference<string>('app.selectedModel') ?? selectModel('brainstorm');
	const capabilityCheck = validateModelForTask(selectedModel, 'brainstorm');
	if (!capabilityCheck.ok) {
		return json(
			{
				error: {
					code: 'model_not_supported',
					message: 'Selected model does not support BrainstormAgent structured output.',
					reasons: capabilityCheck.reasons,
				},
			},
			{ status: 422 },
		);
	}

	const providerResult = await loadProviderOrRespond();
	if (providerResult.kind === 'no_creds') {
		return json(
			{ error: { code: 'no_credentials', message: 'No AI provider credentials configured.' } },
			{ status: 401 },
		);
	}

	if (providerResult.kind === 'mock') {
		return json({
			session: createMockSession(seedIdea),
			model: 'mock',
			tokensUsed: 0,
			includedScopes: projectId ? ['project', 'worldbuilding'] : ['seed'],
			warnings,
			contextItemCount: countContextItems(aiContext),
		});
	}

	const { provider, apiKey, modelOverride } = providerResult.resolved;
	const model = modelOverride ?? selectedModel;
	const prompt = buildBrainstormPrompt(brainstormRequest, aiContext);
	const signal = withTimeoutSignal(request.signal);

	try {
		const response = await provider.complete(apiKey, {
			model,
			messages: [{ role: 'user', content: prompt }],
			temperature: DEFAULT_TEMPERATURE,
			maxTokens: MAX_OUTPUT_TOKENS,
			responseFormat: getBrainstormResponseFormat(),
			signal,
		});
		const session = parseBrainstormOutput(response.content ?? '');
		return json({
			session,
			model: response.model,
			tokensUsed: response.usage?.totalTokens ?? 0,
			includedScopes: projectId ? ['project', 'worldbuilding'] : ['seed'],
			warnings,
			contextItemCount: countContextItems(aiContext),
		});
	} catch (err) {
		if (err instanceof AiProviderError) return providerErrorResponse(err);
		if (isAbortError(err)) {
			return json({ error: { code: 'aborted', message: 'Brainstorm generation was cancelled.' } }, { status: 499 });
		}
		const message = err instanceof Error ? err.message : 'Brainstorm generation failed.';
		return json({ error: { code: 'brainstorm_generation_failed', message } }, { status: 502 });
	}
};
