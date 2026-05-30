import type { ZodIssue } from 'zod';
import {
	WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT,
	type WorldbuildPopulatedBible,
	type WorldbuildPremise,
	type WorldbuildResearchBriefs,
	type WorldbuildWorldspec,
} from './worldbuild-schemas.js';
import { createPipelineArtifactEnvelope, type PipelineArtifactEnvelope, type PipelineRunRequest } from './contracts.js';
import {
	PIPELINE_TASK_KEYS,
	getPipelineTaskDefinition,
	type PipelineTaskDefinition,
} from './task-catalog.js';

export const WORLDBUILD_PIPELINE_KEYS = [
	PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE,
	PIPELINE_TASK_KEYS.WORLDBUILD_WORLDSPEC,
	PIPELINE_TASK_KEYS.WORLDBUILD_RESEARCH,
	PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE,
] as const;

export type WorldbuildTaskKey = (typeof WORLDBUILD_PIPELINE_KEYS)[number];

export interface WorldbuildCharacterDraft {
	name: string;
	role: string;
	bio: string;
	faction: string;
	traits: string[];
	goals: string[];
	flaws: string[];
	tags: string[];
	notes: string;
}

export interface WorldbuildLocationDraft {
	name: string;
	description: string;
	tags: string[];
	realmType?: string;
	realmId?: string | null;
}

export interface WorldbuildFactionDraft {
	name: string;
	type: string;
	description: string;
	mission: string;
	ideology: string;
}

export interface WorldbuildLineageDraft {
	name: string;
	lineageType: string;
	summary: string;
	origin: string;
	regionHomeland: string;
	currentStatus: string;
	foundingOrigin: string;
	inheritedValues: string;
}

export interface WorldbuildThemeDraft {
	title: string;
	description: string;
	tensionPair: string;
	imagery: string;
}

export interface WorldbuildGlossaryDraft {
	term: string;
	definition: string;
	pronunciation: string;
	category: string;
}

export interface WorldbuildLoreEntryDraft {
	title: string;
	category: string;
	content: string;
	tags: string[];
}

export interface WorldbuildPlotThreadDraft {
	title: string;
	description: string;
	status: string;
	relatedSceneIds: string[];
	relatedCharacterIds: string[];
}

export interface WorldbuildTimelineEventDraft {
	title: string;
	description: string;
	date: string;
	relatedCharacterIds: string[];
	relatedSceneIds: string[];
}

export interface WorldbuildPopulatedBibleTableWrites {
	characters: WorldbuildCharacterDraft[];
	locations: WorldbuildLocationDraft[];
	factions: WorldbuildFactionDraft[];
	themes: WorldbuildThemeDraft[];
	glossary_terms: WorldbuildGlossaryDraft[];
	lore_entries: WorldbuildLoreEntryDraft[];
	plot_threads: WorldbuildPlotThreadDraft[];
	timeline_events: WorldbuildTimelineEventDraft[];
}

export interface WorldbuildPopulatedBiblePayload {
	canonical: WorldbuildPopulatedBible;
	tableWrites: WorldbuildPopulatedBibleTableWrites;
}

export interface WorldbuildDomainPersonaePayload {
	individuals: WorldbuildCharacterDraft[];
	factions: WorldbuildFactionDraft[];
	relationships: Array<{ source: string; target: string; type: string; description: string }>;
}

export interface WorldbuildDomainAtlasPayload {
	realms: WorldbuildLocationDraft[];
	landmarks: WorldbuildLocationDraft[];
	travelConstraints: Array<{ description: string }>;
}

export interface WorldbuildDomainArchivePayload {
	myths: WorldbuildLoreEntryDraft[];
	traditions: WorldbuildLoreEntryDraft[];
	technologies: WorldbuildLoreEntryDraft[];
	themes: WorldbuildThemeDraft[];
	glossaryTerms: WorldbuildGlossaryDraft[];
}

export interface WorldbuildDomainThreadsPayload {
	majorArcs: WorldbuildPlotThreadDraft[];
	subplots: WorldbuildPlotThreadDraft[];
	motivations: Array<{ characterId: string; characterName: string; drive: string; conflict: string }>;
}

export interface WorldbuildDomainChroniclesPayload {
	eras: Array<{ name: string; period: string; description: string }>;
	keyEvents: WorldbuildTimelineEventDraft[];
	personalHistories: WorldbuildTimelineEventDraft[];
}

export type WorldbuildPayloadByTaskKey = {
	[PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE]: WorldbuildPremise;
	[PIPELINE_TASK_KEYS.WORLDBUILD_WORLDSPEC]: WorldbuildWorldspec;
	[PIPELINE_TASK_KEYS.WORLDBUILD_RESEARCH]: WorldbuildResearchBriefs;
	[PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE]: WorldbuildPopulatedBiblePayload;
	[PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_PERSONAE]: WorldbuildDomainPersonaePayload;
	[PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_ATLAS]: WorldbuildDomainAtlasPayload;
	[PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_ARCHIVE]: WorldbuildDomainArchivePayload;
	[PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_THREADS]: WorldbuildDomainThreadsPayload;
	[PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_CHRONICLES]: WorldbuildDomainChroniclesPayload;
};

export type WorldbuildPayload = WorldbuildPayloadByTaskKey[WorldbuildTaskKey];

export type WorldbuildParseErrorCode =
	| 'unsupported_worldbuild_task'
	| 'missing_json_object'
	| 'invalid_json_object'
	| 'schema_validation_failed'
	| 'missing_required_fields';

export interface WorldbuildParseError {
	code: WorldbuildParseErrorCode;
	message: string;
	details: string[];
}

export type WorldbuildParseResult =
	| {
			ok: true;
			taskKey: WorldbuildTaskKey;
			payload: WorldbuildPayload;
			rawJson: string;
			fallbackMessage: null;
	  }
	| {
			ok: false;
			taskKey: string;
			error: WorldbuildParseError;
			rawJson: string | null;
			fallbackMessage: string;
	  };

export type WorldbuildArtifactResult =
	| {
			ok: true;
			artifact: PipelineArtifactEnvelope<WorldbuildPayload>;
			parse: Extract<WorldbuildParseResult, { ok: true }>;
	  }
	| {
			ok: false;
			parse: Extract<WorldbuildParseResult, { ok: false }>;
	  };

export interface WorldbuildArtifactBuildRequest
	extends Omit<PipelineRunRequest<WorldbuildPayload>, 'payload' | 'task'> {
	task: Pick<
		PipelineTaskDefinition,
		'key' | 'family' | 'stage' | 'outputFormat' | 'role' | 'contextPolicy'
	>;
	rawOutput: string;
}

type JsonExtractionResult =
	| {
			ok: true;
			rawJson: string;
			jsonValue: unknown;
	  }
	| {
			ok: false;
			error: WorldbuildParseError;
			rawJson: string | null;
	  };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toRecordArray(items: WorldbuildPopulatedBible['characters']): Record<string, unknown>[] {
	return items.filter(isRecord);
}

function getString(record: Record<string, unknown>, keys: string[], fallback = ''): string {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === 'string' && value.trim().length > 0) {
			return value.trim();
		}
	}
	return fallback;
}

function getStringArray(record: Record<string, unknown>, keys: string[]): string[] {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === 'string') {
			const trimmed = value.trim();
			return trimmed ? [trimmed] : [];
		}
		if (Array.isArray(value)) {
			return value
				.filter((item): item is string => typeof item === 'string')
				.map((item) => item.trim())
				.filter((item) => item.length > 0);
		}
	}
	return [];
}

function formatZodIssues(issues: ZodIssue[]): string[] {
	return issues.map((issue) => {
		const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
		return `${path}: ${issue.message}`;
	});
}

function getFallbackMessage(taskKey: string, code: WorldbuildParseErrorCode): string {
	if (code === 'missing_required_fields') {
		return `Worldbuild parser rejected ${taskKey} output because required persistence fields were missing. Ask the model to regenerate with complete entity names/titles.`;
	}
	return `Worldbuild parser could not validate ${taskKey} output. Ask the model to regenerate strict JSON matching the declared OUTPUT FORMAT.`;
}

function extractJsonObject(rawOutput: string): JsonExtractionResult {
	const trimmed = rawOutput.trim();
	if (!trimmed) {
		return {
			ok: false,
			rawJson: null,
			error: {
				code: 'missing_json_object',
				message: 'Model output is empty.',
				details: ['No content was returned by the model.'],
			},
		};
	}

	const direct = parseJsonCandidate(trimmed);
	if (direct.ok) {
		return {
			ok: true,
			rawJson: trimmed,
			jsonValue: direct.jsonValue,
		};
	}

	const firstBrace = rawOutput.indexOf('{');
	const lastBrace = rawOutput.lastIndexOf('}');
	if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
		return {
			ok: false,
			rawJson: null,
			error: {
				code: 'missing_json_object',
				message: 'No JSON object was found in model output.',
				details: ['Expected an object payload bounded by `{` and `}`.'],
			},
		};
	}

	const extracted = rawOutput.slice(firstBrace, lastBrace + 1).trim();
	const parsed = parseJsonCandidate(extracted);
	if (!parsed.ok) {
		return {
			ok: false,
			rawJson: extracted,
			error: {
				code: 'invalid_json_object',
				message: 'Model output contained JSON-like text that failed to parse.',
				details: [parsed.message],
			},
		};
	}

	return {
		ok: true,
		rawJson: extracted,
		jsonValue: parsed.jsonValue,
	};
}

function parseJsonCandidate(candidate: string):
	| { ok: true; jsonValue: unknown }
	| { ok: false; message: string } {
	try {
		return { ok: true, jsonValue: JSON.parse(candidate) };
	} catch (error) {
		return {
			ok: false,
			message: error instanceof Error ? error.message : 'Malformed JSON payload.',
		};
	}
}

function normalizePopulatedBiblePayload(
	payload: WorldbuildPopulatedBible,
): { ok: true; normalized: WorldbuildPopulatedBiblePayload } | { ok: false; errors: string[] } {
	const errors: string[] = [];

	const characters = toRecordArray(payload.characters).map((record, index) => {
		const name = getString(record, ['name', 'title']);
		if (!name) errors.push(`characters[${index}].name is required for persistence.`);
		return {
			name,
			role: getString(record, ['role', 'storyRole']),
			bio: getString(record, ['bio', 'description', 'summary']),
			faction: getString(record, ['faction', 'factionName']),
			traits: getStringArray(record, ['traits']),
			goals: getStringArray(record, ['goals']),
			flaws: getStringArray(record, ['flaws']),
			tags: getStringArray(record, ['tags']),
			notes: getString(record, ['notes']),
		};
	});

	const locations = toRecordArray(payload.locations).map((record, index) => {
		const name = getString(record, ['name', 'title']);
		if (!name) errors.push(`locations[${index}].name is required for persistence.`);
		return {
			name,
			description: getString(record, ['description', 'summary']),
			tags: getStringArray(record, ['tags']),
		};
	});

	const factions = toRecordArray(payload.factions).map((record, index) => {
		const name = getString(record, ['name', 'title']);
		if (!name) errors.push(`factions[${index}].name is required for persistence.`);
		return {
			name,
			type: getString(record, ['type', 'kind']),
			description: getString(record, ['description', 'summary']),
			mission: getString(record, ['mission', 'goal']),
			ideology: getString(record, ['ideology', 'beliefs']),
		};
	});

	const themes = toRecordArray(payload.themes).map((record, index) => {
		const title = getString(record, ['title', 'name', 'theme']);
		if (!title) errors.push(`themes[${index}].title is required for persistence.`);
		return {
			title,
			description: getString(record, ['description', 'statement']),
			tensionPair: getString(record, ['tensionPair', 'tension', 'axis']),
			imagery: getString(record, ['imagery', 'motifs']),
		};
	});

	const glossaryTerms = toRecordArray(payload.glossary).map((record, index) => {
		const term = getString(record, ['term', 'name', 'title']);
		if (!term) errors.push(`glossary[${index}].term is required for persistence.`);
		return {
			term,
			definition: getString(record, ['definition', 'description']),
			pronunciation: getString(record, ['pronunciation']),
			category: getString(record, ['category', 'type']),
		};
	});

	const loreEntries = toRecordArray(payload.loreEntries).map((record, index) => {
		const title = getString(record, ['title', 'name']);
		if (!title) errors.push(`loreEntries[${index}].title is required for persistence.`);
		return {
			title,
			category: getString(record, ['category', 'type']),
			content: getString(record, ['content', 'description']),
			tags: getStringArray(record, ['tags']),
		};
	});

	const relationshipThreads = toRecordArray(payload.relationships).map((record, index) => {
		const fallbackTitle = `Relationship Thread ${index + 1}`;
		const title = getString(record, ['title', 'label', 'name'], fallbackTitle);
		return {
			title,
			description: getString(record, ['description', 'dynamic', 'conflict']),
			status: getString(record, ['status'], 'planned'),
			relatedSceneIds: getStringArray(record, ['relatedSceneIds', 'sceneIds']),
			relatedCharacterIds: getStringArray(record, [
				'relatedCharacterIds',
				'characterIds',
				'members',
			]),
		};
	});

	const timelineEvents = toRecordArray(payload.timelineEvents).map((record, index) => ({
		title: getString(record, ['title', 'name'], `Timeline Event ${index + 1}`),
		description: getString(record, ['description', 'summary']),
		date: getString(record, ['date', 'time']),
		relatedCharacterIds: getStringArray(record, ['relatedCharacterIds', 'characterIds']),
		relatedSceneIds: getStringArray(record, ['relatedSceneIds', 'sceneIds']),
	}));

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	return {
		ok: true,
		normalized: {
			canonical: payload,
			tableWrites: {
				characters,
				locations,
				factions,
				themes,
				glossary_terms: glossaryTerms,
				lore_entries: loreEntries,
				plot_threads: relationshipThreads,
				timeline_events: timelineEvents,
			},
		},
	};
}

function parseWithTaskDefinition(
	task: Pick<PipelineTaskDefinition, 'key' | 'outputFormat'>,
	rawOutput: string,
): WorldbuildParseResult {
	if (!isWorldbuildTaskKey(task.key)) {
		const error: WorldbuildParseError = {
			code: 'unsupported_worldbuild_task',
			message: `Task key ${task.key} is not a worldbuild pipeline stage.`,
			details: [`Expected one of: ${WORLDBUILD_PIPELINE_KEYS.join(', ')}`],
		};
		return {
			ok: false,
			taskKey: task.key,
			error,
			rawJson: null,
			fallbackMessage: getFallbackMessage(task.key, error.code),
		};
	}

	const extraction = extractJsonObject(rawOutput);
	if (!extraction.ok) {
		return {
			ok: false,
			taskKey: task.key,
			error: extraction.error,
			rawJson: extraction.rawJson,
			fallbackMessage: getFallbackMessage(task.key, extraction.error.code),
		};
	}

	const schema = WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT[task.outputFormat as keyof typeof WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT];
	if (!schema) {
		const error: WorldbuildParseError = {
			code: 'unsupported_worldbuild_task',
			message: `No worldbuild schema is registered for output format ${task.outputFormat}.`,
			details: ['Only canonical worldbuild output formats are supported.'],
		};
		return {
			ok: false,
			taskKey: task.key,
			error,
			rawJson: extraction.rawJson,
			fallbackMessage: getFallbackMessage(task.key, error.code),
		};
	}

	const parsed = schema.safeParse(extraction.jsonValue);
	if (!parsed.success) {
		const error: WorldbuildParseError = {
			code: 'schema_validation_failed',
			message: `Output failed schema validation for ${task.outputFormat}.`,
			details: formatZodIssues(parsed.error.issues),
		};
		return {
			ok: false,
			taskKey: task.key,
			error,
			rawJson: extraction.rawJson,
			fallbackMessage: getFallbackMessage(task.key, error.code),
		};
	}

	if (task.key === PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE) {
		const normalized = normalizePopulatedBiblePayload(parsed.data as WorldbuildPopulatedBible);
		if (!normalized.ok) {
			const error: WorldbuildParseError = {
				code: 'missing_required_fields',
				message: 'World-bible payload is missing required fields for persistence.',
				details: normalized.errors,
			};
			return {
				ok: false,
				taskKey: task.key,
				error,
				rawJson: extraction.rawJson,
				fallbackMessage: getFallbackMessage(task.key, error.code),
			};
		}

		return {
			ok: true,
			taskKey: task.key,
			payload: normalized.normalized,
			rawJson: extraction.rawJson,
			fallbackMessage: null,
		};
	}

	return {
		ok: true,
		taskKey: task.key,
		payload: parsed.data as WorldbuildPayload,
		rawJson: extraction.rawJson,
		fallbackMessage: null,
	};
}

export function parseWorldbuildOutput(taskKey: string, rawOutput: string): WorldbuildParseResult {
	const taskDefinition = getPipelineTaskDefinition(taskKey);
	if (!taskDefinition) {
		const error: WorldbuildParseError = {
			code: 'unsupported_worldbuild_task',
			message: `No pipeline task definition exists for ${taskKey}.`,
			details: [`Known worldbuild keys: ${WORLDBUILD_PIPELINE_KEYS.join(', ')}`],
		};
		return {
			ok: false,
			taskKey,
			error,
			rawJson: null,
			fallbackMessage: getFallbackMessage(taskKey, error.code),
		};
	}

	return parseWithTaskDefinition(taskDefinition, rawOutput);
}

export function createWorldbuildArtifactFromModelOutput(
	request: WorldbuildArtifactBuildRequest,
): WorldbuildArtifactResult {
	const parse = parseWithTaskDefinition(request.task, request.rawOutput);
	if (!parse.ok) {
		return {
			ok: false,
			parse,
		};
	}

	const artifact = createPipelineArtifactEnvelope({
		...request,
		payload: parse.payload,
		task: request.task,
	});

	return {
		ok: true,
		artifact,
		parse,
	};
}

export function isWorldbuildTaskKey(taskKey: string): taskKey is WorldbuildTaskKey {
	return WORLDBUILD_PIPELINE_KEYS.includes(taskKey as WorldbuildTaskKey);
}
