/**
 * POST /api/worldbuilding/scan
 *
 * Agentic worldbuild scan endpoint (plan-037).
 *
 * Accepts a scan request, validates the context envelope, and returns
 * non-canonical proposal suggestions for author review.
 *
 * Scan results are NEVER auto-applied to canon. Every proposal requires
 * explicit author accept before any canon write occurs.
 *
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';
import {
	AiProviderError,
	createOllamaProvider,
	createOpenRouterProvider,
	OLLAMA_DEFAULT_BASE_URL,
} from '$lib/ai/providers/index.js';
import type { AiProviderErrorCode } from '$lib/ai/providers/index.js';
import { getPreference } from '$lib/server/preferences/preferences-service.js';
import {
	ACTIVE_PROVIDER_KEY,
	OLLAMA_BASE_URL_KEY,
	OLLAMA_MODEL_KEY,
	type ActiveProvider,
} from '$lib/ai/provider-config.js';
import { ensureOllamaRunning } from '$lib/server/ai/ollama-launcher.js';
import { WORLDBUILD_PROPOSAL_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';
import {
	MAX_PROPOSALS_PER_SCAN,
	MIN_PROPOSAL_CONFIDENCE,
	buildProposalDedupeKey,
	clampConfidence,
	isDuplicateProposalKey,
	type WorldbuildProposalRecord,
} from '$lib/ai/pipeline/worldbuild-proposal-schema.js';
import { persistWorldbuildProposal } from '$lib/ai/pipeline/checkpoint-service.js';
import type { WorldbuildingDomainId } from '$modules/world-building/worldbuilding-workflow.js';
import {
	SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS,
	checkScanContextSufficiency,
	type WorldbuildScanRequest,
	type WorldbuildScanCanonContext,
	type WorldbuildScanProjectContext,
} from '$modules/world-building/services/worldbuild-scan-contract.js';

// ---------------------------------------------------------------------------
// Error codes — stable and typed for client branching
// ---------------------------------------------------------------------------

export type ScanErrorCode =
	| 'invalid_request'
	| 'no_credentials'
	| 'invalid_key'
	| 'rate_limit'
	| 'context_insufficient'
	| 'schema_validation_failed'
	| 'provider_error';

/**
 * User-safe copy for each error code.
 *
 * These strings are safe to surface directly in the UI. They must never
 * contain provider keys, internal stack traces, or raw model output.
 */
const SCAN_ERROR_USER_COPY: Record<ScanErrorCode, string> = {
	invalid_request: 'Invalid scan request.',
	no_credentials: 'No AI provider credentials configured.',
	invalid_key: 'Invalid API key. Check your provider settings.',
	rate_limit: 'AI provider rate limit reached. Try again shortly.',
	context_insufficient:
		'Project context is incomplete. Add a title, logline, and synopsis before scanning.',
	schema_validation_failed: 'The scan response was not in the expected format. Try again.',
	provider_error: 'AI provider error. Try again or check your provider settings.',
};

// ---------------------------------------------------------------------------
// Typed error response shape
// ---------------------------------------------------------------------------

export interface ScanErrorResponse {
	error: {
		/** Stable error code — safe for client branching logic. */
		code: ScanErrorCode;
		/** User-safe message — safe to display in UI. */
		message: string;
		/**
		 * Developer diagnostics — structured details for debugging.
		 * Must never be shown raw in production UI.
		 */
		details?: Record<string, unknown>;
	};
}

export interface ScanSuccessResponse {
	ok: true;
	proposals: WorldbuildProposalRecord[];
}

function scanError(
	code: ScanErrorCode,
	status: number,
	details?: Record<string, unknown>,
): Response {
	const body: ScanErrorResponse = {
		error: {
			code,
			message: SCAN_ERROR_USER_COPY[code],
			...(details ? { details } : {}),
		},
	};
	return json(body, { status });
}

// ---------------------------------------------------------------------------
// HTTP status mapping for scan error codes
// ---------------------------------------------------------------------------

function statusForScanCode(code: ScanErrorCode): number {
	switch (code) {
		case 'invalid_request':
			return 400;
		case 'no_credentials':
			return 401;
		case 'invalid_key':
			return 401;
		case 'rate_limit':
			return 429;
		case 'context_insufficient':
			return 422;
		case 'schema_validation_failed':
			return 422;
		case 'provider_error':
			return 502;
	}
}

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const VALID_DOMAIN_SCOPES = new Set(['personae', 'atlas', 'archive', 'threads', 'chronicles']);
const VALID_MAX_PROPOSALS = new Set([1, 3, 5]);
const SCAN_MODEL = 'openai/gpt-4o-mini';
const MAX_OUTPUT_TOKENS = 3500;
const MOCK_ENABLED = () => process.env.NOVELLUM_AI_MOCK === '1';

type ProposalDraftConfig = {
	entityKind: string;
	label: string;
	identifierField: 'name' | 'title';
	canonField: keyof WorldbuildScanCanonContext;
	payloadSchema: string;
};

const DOMAIN_CONFIG: Record<WorldbuildingDomainId, ProposalDraftConfig> = {
	personae: {
		entityKind: 'character',
		label: 'character',
		identifierField: 'name',
		canonField: 'characterNames',
		payloadSchema:
			'{"name":"string","role":"string","bio":"string","faction":"string","traits":["string"],"goals":["string"],"flaws":["string"],"tags":["string"],"notes":"string"}',
	},
	atlas: {
		entityKind: 'location',
		label: 'location',
		identifierField: 'name',
		canonField: 'locationNames',
		payloadSchema: '{"name":"string","description":"string","tags":["string"]}',
	},
	archive: {
		entityKind: 'lore_entry',
		label: 'lore entry',
		identifierField: 'title',
		canonField: 'loreEntryTitles',
		payloadSchema: '{"title":"string","category":"string","content":"string","tags":["string"]}',
	},
	threads: {
		entityKind: 'plot_thread',
		label: 'plot thread',
		identifierField: 'title',
		canonField: 'plotThreadTitles',
		payloadSchema: '{"title":"string","description":"string","status":"string"}',
	},
	chronicles: {
		entityKind: 'timeline_event',
		label: 'timeline event',
		identifierField: 'title',
		canonField: 'timelineEventTitles',
		payloadSchema: '{"title":"string","description":"string","date":"string"}',
	},
};

type ProviderLoadResult =
	| {
			kind: 'ok';
			provider: ReturnType<typeof createOpenRouterProvider>;
			apiKey: string;
			modelOverride?: string;
	  }
	| { kind: 'mock' }
	| { kind: 'no_creds' };

const credentialService = createCredentialService();
const openRouterProvider = createOpenRouterProvider();

function parseScanRequest(body: unknown): WorldbuildScanRequest | null {
	if (typeof body !== 'object' || body === null) return null;
	const b = body as Record<string, unknown>;
	if (typeof b.projectId !== 'string') return null;
	if (typeof b.domainScope !== 'string' || !VALID_DOMAIN_SCOPES.has(b.domainScope)) return null;
	if (
		b.maxProposals !== undefined &&
		(typeof b.maxProposals !== 'number' || !VALID_MAX_PROPOSALS.has(b.maxProposals))
	) {
		return null;
	}
	if (typeof b.context !== 'object' || b.context === null) return null;
	const context = b.context as Record<string, unknown>;
	if (typeof context.project !== 'object' || context.project === null) return null;
	if (typeof context.canon !== 'object' || context.canon === null) return null;
	const project = context.project as Record<string, unknown>;
	if (project.projectId !== b.projectId) return null;
	for (const key of ['projectId', 'title', 'genre', 'logline', 'synopsis']) {
		if (typeof project[key] !== 'string') return null;
	}
	if (SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS.some((key) => key in project)) return null;
	const canon = context.canon as Record<string, unknown>;
	for (const key of [
		'characterNames',
		'factionNames',
		'locationNames',
		'loreEntryTitles',
		'plotThreadTitles',
		'timelineEventTitles',
	]) {
		if (!Array.isArray(canon[key])) return null;
	}
	return b as unknown as WorldbuildScanRequest;
}

async function loadProvider(): Promise<ProviderLoadResult> {
	const activeProvider: ActiveProvider =
		getPreference<ActiveProvider>(ACTIVE_PROVIDER_KEY) ?? 'openrouter';

	if (activeProvider === 'ollama') {
		const baseUrl = getPreference<string>(OLLAMA_BASE_URL_KEY) ?? OLLAMA_DEFAULT_BASE_URL;
		const modelOverride = getPreference<string>(OLLAMA_MODEL_KEY) ?? undefined;
		await ensureOllamaRunning(baseUrl);
		return {
			kind: 'ok',
			provider: createOllamaProvider({ baseUrl }) as ReturnType<typeof createOpenRouterProvider>,
			apiKey: '',
			modelOverride,
		};
	}

	const key = await credentialService.loadProviderKey('openrouter');
	if (key) return { kind: 'ok', provider: openRouterProvider, apiKey: key };
	if (MOCK_ENABLED()) return { kind: 'mock' };
	return { kind: 'no_creds' };
}

function statusForProviderCode(code: AiProviderErrorCode, fallback?: number): number {
	if (code === 'invalid_key') return statusForScanCode('invalid_key');
	if (code === 'rate_limit') return statusForScanCode('rate_limit');
	return fallback && fallback >= 400 ? fallback : statusForScanCode('provider_error');
}

function compactList(values: string[], limit = 20): string {
	return values
		.map((value) => value.trim())
		.filter(Boolean)
		.slice(0, limit)
		.join(', ');
}

function synopsisHash(synopsis: string): string {
	let hash = 2166136261;
	for (let i = 0; i < synopsis.length; i += 1) {
		hash ^= synopsis.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 8);
}

function buildSourceContext(project: WorldbuildScanProjectContext) {
	return {
		title: project.title,
		genre: project.genre,
		logline: project.logline,
		synopsisHash: synopsisHash(project.synopsis),
	};
}

function buildScanPrompt(scanRequest: WorldbuildScanRequest): string {
	const config = DOMAIN_CONFIG[scanRequest.domainScope];
	const canonNames = compactList(scanRequest.context.canon[config.canonField]);
	const allCanon = [
		...scanRequest.context.canon.characterNames,
		...scanRequest.context.canon.factionNames,
		...scanRequest.context.canon.locationNames,
		...scanRequest.context.canon.loreEntryTitles,
		...scanRequest.context.canon.plotThreadTitles,
		...scanRequest.context.canon.timelineEventTitles,
	];
	const broaderCanon = compactList(allCanon, 50);
	const count = scanRequest.maxProposals ?? 3;

	return `You are the Novellum agentic worldbuild scan assistant.

TASK
Suggest exactly ${count} non-canonical ${config.label} proposal(s) for author review.

PROJECT
Title: ${scanRequest.context.project.title}
Genre: ${scanRequest.context.project.genre || 'Unspecified'}
Logline: ${scanRequest.context.project.logline}
Synopsis: ${scanRequest.context.project.synopsis}

EXISTING CANON IN THIS CATEGORY
${canonNames || '(none)'}

BROADER CANON NAMES AND TITLES
${broaderCanon || '(none)'}

OUTPUT
Return ONLY a valid JSON object with this shape:
{"proposals":[{"entityKind":"${config.entityKind}","confidence":0.75,"reasoningSummary":"one sentence","payload":${config.payloadSchema}}]}

RULES
- Do not write canon. These are proposals only.
- Do not duplicate any exact name or title from existing canon.
- Make every proposal clearly grounded in the project logline and synopsis.
- Keep reasoningSummary user-safe and concise.
- confidence must be a number from 0 to 1.
- Every string field in payload must be non-empty.`;
}

function extractProposalDrafts(rawOutput: string): unknown[] {
	const trimmed = rawOutput.trim();
	const parse = (value: string): unknown[] => {
		const parsed = JSON.parse(value) as unknown;
		if (Array.isArray(parsed)) return parsed;
		if (typeof parsed === 'object' && parsed !== null) {
			const proposals = (parsed as { proposals?: unknown }).proposals;
			if (Array.isArray(proposals)) return proposals;
		}
		return [];
	};

	try {
		return parse(trimmed);
	} catch {
		/* fall through */
	}

	const firstObject = trimmed.indexOf('{');
	const lastObject = trimmed.lastIndexOf('}');
	if (firstObject !== -1 && lastObject > firstObject) {
		try {
			return parse(trimmed.slice(firstObject, lastObject + 1));
		} catch {
			/* fall through */
		}
	}

	const firstArray = trimmed.indexOf('[');
	const lastArray = trimmed.lastIndexOf(']');
	if (firstArray !== -1 && lastArray > firstArray) {
		try {
			return parse(trimmed.slice(firstArray, lastArray + 1));
		} catch {
			return [];
		}
	}

	return [];
}

function loadExistingProposalKeys(projectId: string): Set<string> {
	const keys = new Set<string>();
	try {
		const rows = db
			.prepare(
				`SELECT value FROM project_metadata
				 WHERE projectId = ? AND scope = 'pipeline' AND ownerId = ?`,
			)
			.all(projectId, WORLDBUILD_PROPOSAL_OWNER_ID) as Array<{ value: string }>;
		for (const row of rows) {
			try {
				const proposal = JSON.parse(row.value) as Partial<WorldbuildProposalRecord>;
				if (
					proposal.status === 'pending_review' &&
					typeof proposal.dedupeKey === 'string' &&
					proposal.dedupeKey.trim()
				) {
					keys.add(proposal.dedupeKey);
				}
			} catch {
				/* ignore malformed proposal rows during dedupe */
			}
		}
	} catch {
		/* If metadata is unavailable, schema validation will still protect persistence. */
	}
	return keys;
}

function addCanonDedupeKeys(
	keys: Set<string>,
	domainScope: WorldbuildingDomainId,
	canon: WorldbuildScanCanonContext,
): void {
	const config = DOMAIN_CONFIG[domainScope];
	for (const identifier of canon[config.canonField]) {
		if (typeof identifier === 'string' && identifier.trim()) {
			keys.add(buildProposalDedupeKey(domainScope, config.entityKind, identifier));
		}
	}
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function proposalFromDraft(
	draft: unknown,
	scanRequest: WorldbuildScanRequest,
	generatedAt: string,
	sourceContext: WorldbuildProposalRecord['sourceContext'],
): WorldbuildProposalRecord | null {
	if (!isObject(draft)) return null;
	const config = DOMAIN_CONFIG[scanRequest.domainScope];
	const payload = isObject(draft.payload) ? draft.payload : null;
	if (!payload) return null;

	const identifier = payload[config.identifierField];
	if (typeof identifier !== 'string' || !identifier.trim()) return null;

	const rawConfidence = typeof draft.confidence === 'number' ? draft.confidence : 0.5;
	const confidence = clampConfidence(rawConfidence);
	if (confidence < MIN_PROPOSAL_CONFIDENCE) return null;

	const reasoningSummary =
		typeof draft.reasoningSummary === 'string' && draft.reasoningSummary.trim()
			? draft.reasoningSummary.trim()
			: 'Suggested from the current project context.';

	return {
		proposalId: crypto.randomUUID(),
		projectId: scanRequest.projectId,
		categoryId: scanRequest.domainScope,
		entityKind:
			typeof draft.entityKind === 'string' && draft.entityKind.trim()
				? draft.entityKind.trim()
				: config.entityKind,
		status: 'pending_review',
		generatedAt,
		sourceContext,
		confidence,
		reasoningSummary,
		payload,
		dedupeKey: buildProposalDedupeKey(scanRequest.domainScope, config.entityKind, identifier),
		acceptance: null,
		rejection: null,
	};
}

function normalizeAndDedupeProposals(
	rawDrafts: unknown[],
	scanRequest: WorldbuildScanRequest,
): WorldbuildProposalRecord[] {
	const generatedAt = new Date().toISOString();
	const sourceContext = buildSourceContext(scanRequest.context.project);
	const existingKeys = loadExistingProposalKeys(scanRequest.projectId);
	addCanonDedupeKeys(existingKeys, scanRequest.domainScope, scanRequest.context.canon);

	const proposals: WorldbuildProposalRecord[] = [];
	for (const draft of rawDrafts) {
		const proposal = proposalFromDraft(draft, scanRequest, generatedAt, sourceContext);
		if (!proposal) continue;
		if (isDuplicateProposalKey(proposal.dedupeKey, existingKeys)) continue;
		existingKeys.add(proposal.dedupeKey);
		proposals.push(proposal);
		if (proposals.length >= Math.min(scanRequest.maxProposals ?? 3, MAX_PROPOSALS_PER_SCAN)) break;
	}
	return proposals;
}

function persistProposals(proposals: WorldbuildProposalRecord[]): void {
	const tx = db.transaction(() => {
		for (const proposal of proposals) {
			persistWorldbuildProposal(proposal, db);
		}
	});
	tx();
}

function mockDrafts(scanRequest: WorldbuildScanRequest): unknown[] {
	const config = DOMAIN_CONFIG[scanRequest.domainScope];
	const count = scanRequest.maxProposals ?? 3;
	const stem = scanRequest.context.project.title.trim() || 'Project';
	const drafts: unknown[] = [];

	for (let i = 1; i <= count; i += 1) {
		if (scanRequest.domainScope === 'personae') {
			drafts.push({
				entityKind: config.entityKind,
				confidence: 0.72,
				reasoningSummary: 'Anchors the central conflict with a reviewable character suggestion.',
				payload: {
					name: `${stem} Witness ${i}`,
					role: 'Supporting',
					bio: 'A pressure-tested figure tied to the project conflict.',
					faction: 'Unaligned',
					traits: ['observant'],
					goals: ['protect a fragile truth'],
					flaws: ['keeps secrets too long'],
					tags: ['scan'],
					notes: '[Mock scan proposal]',
				},
			});
		} else if (scanRequest.domainScope === 'atlas') {
			drafts.push({
				entityKind: config.entityKind,
				confidence: 0.72,
				reasoningSummary: 'Provides a grounded place where the premise can create pressure.',
				payload: {
					name: `${stem} Crossing ${i}`,
					description: 'A contested route shaped by the story conflict.',
					tags: ['scan'],
				},
			});
		} else if (scanRequest.domainScope === 'archive') {
			drafts.push({
				entityKind: config.entityKind,
				confidence: 0.72,
				reasoningSummary: 'Adds a compact lore hook for the existing premise.',
				payload: {
					title: `${stem} Accord ${i}`,
					category: 'custom',
					content: 'A remembered agreement that still shapes present choices.',
					tags: ['scan'],
				},
			});
		} else if (scanRequest.domainScope === 'threads') {
			drafts.push({
				entityKind: config.entityKind,
				confidence: 0.72,
				reasoningSummary: 'Extends the central tension into a reviewable plot thread.',
				payload: {
					title: `${stem} Pressure ${i}`,
					description: 'A developing line of conflict tied to the synopsis.',
					status: 'planned',
				},
			});
		} else {
			drafts.push({
				entityKind: config.entityKind,
				confidence: 0.72,
				reasoningSummary: 'Creates a timeline anchor for the project conflict.',
				payload: {
					title: `${stem} Turning Point ${i}`,
					description: 'A consequential event that reframes the current story pressure.',
					date: 'Undated',
				},
			});
		}
	}

	return drafts;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const scanRequest = parseScanRequest(body);

	if (!scanRequest) {
		return scanError('invalid_request', statusForScanCode('invalid_request'), {
			hint: 'Request must include projectId, domainScope, and context envelope.',
		});
	}

	const sufficiency = checkScanContextSufficiency(scanRequest.context.project);
	if (!sufficiency.sufficient) {
		return scanError('context_insufficient', statusForScanCode('context_insufficient'), {
			missing: sufficiency.missing,
		});
	}

	const providerResult = await loadProvider();
	if (providerResult.kind === 'no_creds') {
		return scanError('no_credentials', statusForScanCode('no_credentials'));
	}

	if (providerResult.kind === 'mock') {
		const proposals = normalizeAndDedupeProposals(mockDrafts(scanRequest), scanRequest);
		persistProposals(proposals);
		return json({ ok: true, proposals } satisfies ScanSuccessResponse);
	}

	const { provider, apiKey, modelOverride } = providerResult;
	const model = modelOverride ?? SCAN_MODEL;

	try {
		const result = await provider.complete(apiKey, {
			model,
			messages: [{ role: 'user', content: buildScanPrompt(scanRequest) }],
			maxTokens: MAX_OUTPUT_TOKENS,
			temperature: 0.4,
			signal: request.signal,
		});

		const rawDrafts = extractProposalDrafts(result.content);
		const proposals = normalizeAndDedupeProposals(rawDrafts, scanRequest);

		if (proposals.length === 0) {
			return scanError('schema_validation_failed', statusForScanCode('schema_validation_failed'), {
				issue: 'No valid, non-duplicate proposals returned by provider.',
			});
		}

		persistProposals(proposals);
		return json({ ok: true, proposals } satisfies ScanSuccessResponse);
	} catch (err) {
		if (err instanceof AiProviderError) {
			return scanError(
				err.code === 'invalid_key' || err.code === 'rate_limit' ? err.code : 'provider_error',
				statusForProviderCode(err.code, err.status),
			);
		}
		return scanError('provider_error', statusForScanCode('provider_error'));
	}
};
