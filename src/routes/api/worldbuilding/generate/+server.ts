/**
 * POST /api/worldbuilding/generate
 *
 * Generates structured entity drafts from project logline + synopsis.
 * Returns a JSON array of entity drafts — never auto-applies to the DB.
 * The caller reviews and explicitly saves each draft.
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import type { Project } from '$lib/db/domain-types.js';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';
import {
	AiProviderError,
	createOpenRouterProvider,
	createOllamaProvider,
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
import {
	buildPromptContextNote,
	legacyStringToGenerationContext,
	normalizeGenerationContext,
	type GenerationContextPayload,
} from '$modules/world-building/services/generation-context.js';
import { validateGeneratedDrafts } from '$lib/ai/validators/worldbuilding-draft-validator.js';

const credentialService = createCredentialService();
const openRouterProvider = createOpenRouterProvider();

const MAX_OUTPUT_TOKENS = 4000;
const GENERATION_MODEL = 'openai/gpt-4o-mini';
const MOCK_ENABLED = () => process.env.NOVELLUM_AI_MOCK === '1';

export type EntityKind =
	| 'character'
	| 'faction'
	| 'lineage'
	| 'realm'
	| 'landmark'
	| 'lore-entry'
	| 'plot-thread'
	| 'timeline-event';

const VALID_ENTITY_KINDS: EntityKind[] = [
	'character',
	'faction',
	'lineage',
	'realm',
	'landmark',
	'lore-entry',
	'plot-thread',
	'timeline-event',
];

const VALID_COUNTS = [1, 3, 5] as const;
type GenerateCount = (typeof VALID_COUNTS)[number];

interface GenerateRequestBody {
	projectId: string;
	entityKind: EntityKind;
	count: GenerateCount;
	context?: string;
	generationContext?: GenerationContextPayload;
}

// ── Provider loading (mirrors /api/ai/+server.ts) ──────────────────────────

type LoadResult =
	| { kind: 'ok'; provider: ReturnType<typeof createOpenRouterProvider>; apiKey: string; modelOverride?: string }
	| { kind: 'mock' }
	| { kind: 'no_creds' };

async function loadProvider(): Promise<LoadResult> {
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

function noCredsResponse(): Response {
	return json(
		{ error: { code: 'no_credentials', message: 'No AI provider credentials configured.' } },
		{ status: 401 },
	);
}

function statusForCode(code: AiProviderErrorCode, fallback?: number): number {
	if (code === 'invalid_key') return 401;
	if (code === 'rate_limit') return 429;
	return fallback && fallback >= 400 ? fallback : 502;
}

// ── Existing entity lookup ────────────────────────────────────────────────

interface ExistingEntityContext {
	names: string[];
	summaries: string[];
}

function compactText(value: string | null | undefined, maxChars = 120): string {
	return typeof value === 'string' ? value.trim().slice(0, maxChars) : '';
}

function loadExistingEntityContext(projectId: string, entityKind: EntityKind): ExistingEntityContext {
	try {
		if (entityKind === 'character') {
			const rows = db
				.prepare(
					`SELECT name, role, faction FROM characters WHERE projectId = ? ORDER BY createdAt DESC LIMIT 10`,
				)
				.all(projectId) as Array<{ name: string; role: string; faction: string }>;
			return {
				names: rows.map((row) => row.name).filter(Boolean),
				summaries: rows
					.map((row) => {
						const role = compactText(row.role, 40) || 'role unspecified';
						const faction = compactText(row.faction, 40) || 'no faction';
						return `${row.name}: role=${role}; faction=${faction}`;
					})
					.filter(Boolean),
			};
		}

		if (entityKind === 'faction') {
			const rows = db
				.prepare(
					`SELECT name, type, description FROM factions WHERE projectId = ? ORDER BY createdAt DESC LIMIT 10`,
				)
				.all(projectId) as Array<{ name: string; type: string; description: string }>;
			return {
				names: rows.map((row) => row.name).filter(Boolean),
				summaries: rows
					.map((row) => {
						const type = compactText(row.type, 36) || 'type unspecified';
						const description = compactText(row.description, 90);
						return `${row.name}: type=${type}${description ? `; ${description}` : ''}`;
					})
					.filter(Boolean),
			};
		}

		if (entityKind === 'lineage') {
			const row = db
				.prepare(
					`SELECT value
					 FROM project_metadata
					 WHERE projectId = ?
					   AND scope = 'project'
					   AND ownerId = ?
					   AND key = 'lineages'`,
				)
				.get(projectId, projectId) as { value: string } | undefined;
			if (!row?.value) return { names: [], summaries: [] };
			const parsed = JSON.parse(row.value) as Record<
				string,
				{ name?: string; lineageType?: string; summary?: string }
			>;
			const values = Object.values(parsed).slice(0, 10);
			return {
				names: values.map((entry) => compactText(entry.name, 80)).filter(Boolean),
				summaries: values
					.map((entry) => {
						const name = compactText(entry.name, 80);
						if (!name) return '';
						const lineageType = compactText(entry.lineageType, 40) || 'type unspecified';
						const summary = compactText(entry.summary, 90);
						return `${name}: type=${lineageType}${summary ? `; ${summary}` : ''}`;
					})
					.filter(Boolean),
			};
		}

		if (entityKind === 'realm') {
			const rows = db
				.prepare(
					`SELECT name, realmType, conflictPressure
					 FROM locations
					 WHERE projectId = ? AND kind = 'realm'
					 ORDER BY createdAt DESC
					 LIMIT 10`,
				)
				.all(projectId) as Array<{ name: string; realmType: string; conflictPressure: string }>;
			return {
				names: rows.map((row) => row.name).filter(Boolean),
				summaries: rows
					.map((row) => {
						const realmType = compactText(row.realmType, 24) || 'type unspecified';
						const pressure = compactText(row.conflictPressure, 90);
						return `${row.name}: realmType=${realmType}${pressure ? `; pressure=${pressure}` : ''}`;
					})
					.filter(Boolean),
			};
		}

		if (entityKind === 'landmark') {
			const rows = db
				.prepare(
					`SELECT name, realmId, purpose, activityType
					 FROM locations
					 WHERE projectId = ? AND kind = 'landmark'
					 ORDER BY createdAt DESC
					 LIMIT 10`,
				)
				.all(projectId) as Array<{
					name: string;
					realmId: string;
					purpose: string;
					activityType: string;
				}>;
			return {
				names: rows.map((row) => row.name).filter(Boolean),
				summaries: rows
					.map((row) => {
						const purpose = compactText(row.purpose, 60) || 'purpose unspecified';
						const activity = compactText(row.activityType, 40);
						const realmId = compactText(row.realmId, 24) || 'unassigned realm';
						return `${row.name}: realm=${realmId}; purpose=${purpose}${activity ? `; activity=${activity}` : ''}`;
					})
					.filter(Boolean),
			};
		}

		if (entityKind === 'lore-entry') {
			const rows = db
				.prepare(
					`SELECT title, category, content
					 FROM lore_entries
					 WHERE projectId = ?
					 ORDER BY createdAt DESC
					 LIMIT 10`,
				)
				.all(projectId) as Array<{ title: string; category: string; content: string }>;
			return {
				names: rows.map((row) => row.title).filter(Boolean),
				summaries: rows
					.map((row) => {
						const category = compactText(row.category, 36) || 'category unspecified';
						const content = compactText(row.content, 90);
						return `${row.title}: category=${category}${content ? `; ${content}` : ''}`;
					})
					.filter(Boolean),
			};
		}

		if (entityKind === 'plot-thread') {
			const rows = db
				.prepare(
					`SELECT title, status, description
					 FROM plot_threads
					 WHERE projectId = ?
					 ORDER BY createdAt DESC
					 LIMIT 10`,
				)
				.all(projectId) as Array<{ title: string; status: string; description: string }>;
			return {
				names: rows.map((row) => row.title).filter(Boolean),
				summaries: rows
					.map((row) => {
						const status = compactText(row.status, 24) || 'status unspecified';
						const description = compactText(row.description, 90);
						return `${row.title}: status=${status}${description ? `; ${description}` : ''}`;
					})
					.filter(Boolean),
			};
		}

		if (entityKind === 'timeline-event') {
			const rows = db
				.prepare(
					`SELECT title, date, description
					 FROM timeline_events
					 WHERE projectId = ?
					 ORDER BY createdAt DESC
					 LIMIT 10`,
				)
				.all(projectId) as Array<{ title: string; date: string; description: string }>;
			return {
				names: rows.map((row) => row.title).filter(Boolean),
				summaries: rows
					.map((row) => {
						const date = compactText(row.date, 32) || 'date unspecified';
						const description = compactText(row.description, 90);
						return `${row.title}: date=${date}${description ? `; ${description}` : ''}`;
					})
					.filter(Boolean),
			};
		}
	} catch {
		/* ignore — existing context is a soft hint, not required */
	}
	return { names: [], summaries: [] };
}

// ── Prompt builders ────────────────────────────────────────────────────────

const ENTITY_LABEL: Record<EntityKind, string> = {
	character: 'character',
	faction: 'faction',
	lineage: 'lineage (dynasty / bloodline / house)',
	realm: 'realm (macro territory)',
	landmark: 'landmark (specific high-impact site)',
	'lore-entry': 'lore entry',
	'plot-thread': 'plot thread',
	'timeline-event': 'timeline event',
};

const ENTITY_SCHEMA: Record<EntityKind, string> = {
	character:
		'{"name":"string","role":"string","bio":"string","faction":"string","coreDesire":"string","fear":"string","contradiction":"string","strength":"string","flaw":"string","storyRole":"string","externalGoal":"string","internalNeed":"string","stakes":"string","voiceSummary":"string","speechPattern":"string","traits":["string"],"goals":["string"],"flaws":["string"],"tags":["string"],"notes":"string"}',
	faction:
		'{"name":"string","type":"string","description":"string","mission":"string","ideology":"string"}',
	lineage:
		'{"name":"string","lineageType":"string","summary":"string","origin":"string","regionHomeland":"string","currentStatus":"string","foundingOrigin":"string","inheritedValues":"string"}',
	realm: '{"name":"string","description":"string","realmType":"string","tags":["string"]}',
	landmark:
		'{"name":"string","description":"string","realmId":"string | null","tags":["string"]}',
	'lore-entry':
		'{"title":"string","category":"string","content":"string","tags":["string"]}',
	'plot-thread':
		'{"title":"string","description":"string","status":"string"}',
	'timeline-event':
		'{"title":"string","description":"string","date":"string"}',
};

function buildSystemPrompt(
	project: Project,
	entityKind: EntityKind,
	count: GenerateCount,
	existingContext: ExistingEntityContext,
	userContext?: string,
	generationContext?: GenerationContextPayload,
): string {
	const label = ENTITY_LABEL[entityKind];
	const schema = ENTITY_SCHEMA[entityKind];
	const existingNameNote =
		existingContext.names.length > 0
			? `\nExisting ${label} names (avoid exact duplicates): ${existingContext.names.join(', ')}`
			: '';
	const existingSummaryNote =
		existingContext.summaries.length > 0
			? `\nExisting ${label} summaries:\n- ${existingContext.summaries.join('\n- ')}`
			: '';
	const contextNote = userContext ? `\nAdditional context: ${userContext}` : '';
	const realmTypeGuidance =
		entityKind === 'realm'
			? '\nFor realmType, use one of: physical, metaphysical, political, hybrid.'
			: '';
	const landmarkGuidance =
		entityKind === 'landmark'
			? '\nFor realmId, use null when no parent realm is known yet.'
			: '';
	const lineageGuidance =
		entityKind === 'lineage'
			? '\nTreat a lineage as a dynasty/house/bloodline with inherited social consequence. Do not output character-sheet prose.'
			: '';
	const characterFieldGuidance =
		entityKind === 'character'
			? '\nFor character fields `coreDesire`, `fear`, `contradiction`, `strength`, `flaw`, `storyRole`, `externalGoal`, `internalNeed`, `stakes`, `voiceSummary`, and `speechPattern`, return concrete, story-specific values (not placeholders).'
			: '';
	const targetNames =
		generationContext?.hints
			?.filter((hint) => hint.intent === 'target')
			.map((hint) => hint.name) ?? [];
	const avoidNames =
		generationContext?.hints
			?.filter((hint) => hint.intent === 'avoid')
			.map((hint) => hint.name) ?? [];

	// Cap targets to requested count so we don't ask for more than we generate
	const cappedTargetNames = targetNames.slice(0, count as number);
	const remainingCount = (count as number) - cappedTargetNames.length;

	const targetRule =
		cappedTargetNames.length > 0
			? `\n- You MUST generate a profile for each of these named characters (use their exact names as-is, do NOT rename them): ${cappedTargetNames.join(', ')}.`
			: '';
	const remainingRule =
		cappedTargetNames.length > 0 && remainingCount > 0
			? `\n- The remaining ${remainingCount} character(s) may be newly invented to fit the story world.`
			: cappedTargetNames.length > 0 && remainingCount === 0
				? `\n- Only generate profiles for the targeted characters above — do not invent additional ones.`
				: '';
	const avoidRule =
		avoidNames.length > 0
			? `\n- Do NOT generate any ${label} with these names: ${avoidNames.join(', ')}.`
			: '';

	return `You are a fiction worldbuilding assistant. Generate exactly ${count} ${label}(s) that feel grounded in the project below.

PROJECT
Title: ${project.title || 'Untitled'}
Genre: ${project.genre || 'Unspecified'}
Logline: ${project.logline || '(not yet written)'}
Synopsis: ${project.synopsis || '(not yet written)'}${existingNameNote}${existingSummaryNote}${contextNote}${realmTypeGuidance}${landmarkGuidance}${lineageGuidance}${characterFieldGuidance}

TASK
Return ONLY a valid JSON array. Each element must match this schema exactly:
${schema}

RULES
- Return ONLY the JSON array — no explanation, no prose, no markdown fences.
- Use the project logline and synopsis to make the ${label}(s) feel like they belong in this story.
- Every string field must be non-empty.
- Array fields must have at least one element.
- Do not reuse any names from the existing names list.${targetRule}${remainingRule}${avoidRule}`;
}

// ── JSON array extraction ──────────────────────────────────────────────────

function extractJsonArray(rawOutput: string): unknown[] {
	const trimmed = rawOutput.trim();

	// Try direct parse first
	try {
		const direct = JSON.parse(trimmed);
		if (Array.isArray(direct)) return direct;
	} catch {
		/* fall through */
	}

	// Extract between first [ and last ]
	const first = trimmed.indexOf('[');
	const last = trimmed.lastIndexOf(']');
	if (first === -1 || last === -1 || first >= last) return [];

	try {
		const extracted = JSON.parse(trimmed.slice(first, last + 1));
		return Array.isArray(extracted) ? extracted : [];
	} catch {
		return [];
	}
}

// ── Mock response ──────────────────────────────────────────────────────────

function mockDrafts(entityKind: EntityKind, count: GenerateCount): unknown[] {
	const results: unknown[] = [];
	for (let i = 1; i <= count; i++) {
		if (entityKind === 'character') {
			results.push({
				name: `Mock Character ${i}`,
				role: 'Supporting',
				bio: 'A compelling figure with hidden depths.',
				faction: 'Unknown',
				coreDesire: 'To reclaim a stolen inheritance.',
				fear: 'Becoming the very force they resist.',
				contradiction: 'Compassionate in private, ruthless in strategy.',
				strength: 'Exceptional pattern recognition under pressure.',
				flaw: 'Refuses help until too late.',
				storyRole: 'Pressure catalyst for the protagonist.',
				externalGoal: 'Secure proof that clears their family name.',
				internalNeed: 'Trust allies without controlling them.',
				stakes: 'Failure means exile and civil unrest.',
				voiceSummary: 'Measured cadence with surgical precision.',
				speechPattern: 'Short clauses, then sudden vivid metaphors.',
				traits: ['perceptive', 'loyal'],
				goals: ['find belonging'],
				flaws: ['overly cautious'],
				tags: ['mock'],
				notes: '[Mock draft — AI not active]',
			});
		} else if (entityKind === 'faction') {
			results.push({
				name: `Mock Faction ${i}`,
				type: 'civic',
				description: '[Mock draft — AI not active]',
				mission: 'Preserve order',
				ideology: 'Stability over chaos',
			});
		} else if (entityKind === 'lineage') {
			results.push({
				name: `Mock Lineage ${i}`,
				lineageType: 'dynasty',
				summary: '[Mock draft — AI not active]',
				origin: 'Old Kingdom',
				regionHomeland: 'Northern Reach',
				currentStatus: 'fractured',
				foundingOrigin: 'Forged during succession wars',
				inheritedValues: 'Duty, secrecy, blood-oath loyalty',
			});
		} else if (entityKind === 'realm') {
			results.push({
				name: `Mock Realm ${i}`,
				description: '[Mock draft — AI not active]',
				realmType: 'physical',
				tags: ['mock'],
			});
		} else if (entityKind === 'landmark') {
			results.push({
				name: `Mock Landmark ${i}`,
				description: '[Mock draft — AI not active]',
				realmId: null,
				tags: ['mock'],
			});
		} else if (entityKind === 'lore-entry') {
			results.push({
				title: `Mock Lore Entry ${i}`,
				category: 'myth',
				content: '[Mock draft — AI not active]',
				tags: ['mock'],
			});
		} else if (entityKind === 'plot-thread') {
			results.push({
				title: `Mock Plot Thread ${i}`,
				description: '[Mock draft — AI not active]',
				status: 'planned',
			});
		} else if (entityKind === 'timeline-event') {
			results.push({
				title: `Mock Timeline Event ${i}`,
				description: '[Mock draft — AI not active]',
				date: 'Unknown era',
			});
		} else {
			results.push({ name: `Mock ${entityKind} ${i}` });
		}
	}
	return results;
}

// ── Request handler ────────────────────────────────────────────────────────

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown = null;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	const { projectId, entityKind, count, context, generationContext } = body as GenerateRequestBody;

	if (!projectId || typeof projectId !== 'string') {
		error(400, 'Missing projectId');
	}
	if (!entityKind || !VALID_ENTITY_KINDS.includes(entityKind as EntityKind)) {
		error(400, `Invalid entityKind. Must be one of: ${VALID_ENTITY_KINDS.join(', ')}`);
	}
	if (!VALID_COUNTS.includes(count as GenerateCount)) {
		error(400, 'count must be 1, 3, or 5');
	}

	const normalizedGenerationContext =
		normalizeGenerationContext(generationContext) ??
		legacyStringToGenerationContext(typeof context === 'string' ? context : undefined);
	const promptContextNote = buildPromptContextNote(normalizedGenerationContext);

	// Load project
	const project = db
		.prepare(`SELECT * FROM projects WHERE id = ?`)
		.get(projectId) as Project | undefined;

	if (!project) {
		error(404, 'Project not found');
	}

	const missingContext = !project.logline && !project.synopsis;
	const existingContext = loadExistingEntityContext(projectId, entityKind);

	// Load AI provider
	const providerResult = await loadProvider();

	if (providerResult.kind === 'no_creds') return noCredsResponse();

	if (providerResult.kind === 'mock') {
		const mockValidation = validateGeneratedDrafts(mockDrafts(entityKind, count), entityKind, count);
		return json({
			drafts: mockValidation.ok ? mockValidation.drafts : mockDrafts(entityKind, count),
			entityKind,
			projectContext: { title: project.title, genre: project.genre, logline: project.logline },
			...(missingContext ? { warning: 'logline_missing' } : {}),
		});
	}

	const systemPrompt = buildSystemPrompt(
		project,
		entityKind,
		count,
		existingContext,
		promptContextNote,
		normalizedGenerationContext,
	);

	const { provider, apiKey, modelOverride } = providerResult;
	const model = modelOverride ?? GENERATION_MODEL;

	try {
		const result = await provider.complete(apiKey, {
			model,
			messages: [{ role: 'user', content: systemPrompt }],
			maxTokens: MAX_OUTPUT_TOKENS,
			signal: request.signal,
		});

		const rawDrafts = extractJsonArray(result.content);

		if (rawDrafts.length === 0) {
			return json(
				{
					error: {
						code: 'parse_failed',
						message: 'The AI returned an unexpected format. Please try again.',
					},
				},
				{ status: 502 },
			);
		}

		const validation = validateGeneratedDrafts(rawDrafts, entityKind, count);

		if (!validation.ok) {
			return json(
				{
					error: {
						code: 'validation_failed',
						message: validation.error.message,
					},
				},
				{ status: 502 },
			);
		}

		return json({
			drafts: validation.drafts,
			entityKind,
			projectContext: {
				title: project.title,
				genre: project.genre,
				logline: project.logline,
			},
			...(missingContext ? { warning: 'logline_missing' } : {}),
		});
	} catch (err) {
		if (err instanceof AiProviderError) {
			return json(
				{ error: { code: err.code, message: err.message } },
				{ status: statusForCode(err.code, err.status) },
			);
		}
		const message = err instanceof Error ? err.message : 'unknown error';
		return json({ error: { code: 'provider_error', message } }, { status: 502 });
	}
};
