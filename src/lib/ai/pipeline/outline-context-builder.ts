import type { AiContext } from '../types.js';
import { PIPELINE_TASK_KEYS } from './task-catalog.js';
import {
	createOutlineContextTextReference,
	evaluateOutlineContextSufficiency,
	type OutlineContextSufficiencyResult,
} from './outline-context-sufficiency.js';

type JsonRecord = Record<string, unknown>;

export const OUTLINE_CONTEXT_PACKET_VERSION = '1.0.0' as const;
export const OUTLINE_CONTEXT_PACKET_DEFAULT_CHAR_BUDGET = 12_000 as const;
export const OUTLINE_CONTEXT_ENTRY_SUMMARY_LIMIT = 420 as const;

export type OutlineContextSourceKind = 'project' | 'story_frame' | 'canonical' | 'checkpoint';

export type OutlineContextEntityType =
	| 'project'
	| 'story_frame'
	| 'character'
	| 'plot_thread'
	| 'location'
	| 'faction'
	| 'lore_entry'
	| 'timeline_event'
	| 'theme'
	| 'checkpoint';

export type OutlineContextPacketWarningCode =
	| 'malformed_legacy_json'
	| 'context_budget_exceeded'
	| 'duplicate_source_label';

export interface OutlineContextSourceReference {
	id: string;
	kind: OutlineContextSourceKind;
	entityType: OutlineContextEntityType;
	sourceId: string;
	label: string;
	path: string;
	rank: number;
}

export interface OutlineContextPacketEntry {
	id: string;
	label: string;
	summary: string;
	sourceRefId: string;
	sourceKind: OutlineContextSourceKind;
	rank: number;
	truncated: boolean;
}

export interface OutlineContextCheckpointSummary extends OutlineContextPacketEntry {
	taskKey: string;
	itemCounts: Partial<Record<OutlineContextEntityType, number>>;
}

export interface OutlineContextPacketWarning {
	code: OutlineContextPacketWarningCode;
	message: string;
	sourceRefId?: string;
}

export interface OutlineContextPacketBudget {
	charBudget: number;
	estimatedChars: number;
	truncated: boolean;
	omittedSourceCount: number;
}

export interface OutlineContextPacket {
	version: typeof OUTLINE_CONTEXT_PACKET_VERSION;
	project: {
		id: string | null;
		title: string | null;
		genre: string;
		logline: string;
		synopsis: ReturnType<typeof createOutlineContextTextReference> | null;
		targetWordCount: number | null;
		status: string;
		projectType: string;
		planningNotes: OutlineContextPacketEntry[];
	};
	readiness: OutlineContextSufficiencyResult;
	worldbuilding: {
		characters: OutlineContextPacketEntry[];
		plotThreads: OutlineContextPacketEntry[];
		locations: OutlineContextPacketEntry[];
		factions: OutlineContextPacketEntry[];
		loreEntries: OutlineContextPacketEntry[];
		timelineEvents: OutlineContextPacketEntry[];
		themes: OutlineContextPacketEntry[];
		checkpointSummaries: OutlineContextCheckpointSummary[];
	};
	sourceReferences: OutlineContextSourceReference[];
	warnings: OutlineContextPacketWarning[];
	budget: OutlineContextPacketBudget;
	contextHash: string;
}

export interface OutlineContextPacketInput {
	project?: unknown;
	storyFrames?: ReadonlyArray<unknown> | null;
	worldbuilding?: {
		characters?: ReadonlyArray<unknown> | null;
		plotThreads?: ReadonlyArray<unknown> | null;
		locations?: ReadonlyArray<unknown> | null;
		factions?: ReadonlyArray<unknown> | null;
		loreEntries?: ReadonlyArray<unknown> | null;
		timelineEvents?: ReadonlyArray<unknown> | null;
		themes?: ReadonlyArray<unknown> | null;
		acceptedCheckpoints?: ReadonlyArray<unknown> | null;
		pipelineCheckpoints?: ReadonlyArray<unknown> | null;
		legacyMetadataValues?: ReadonlyArray<unknown> | null;
	} | null;
	outlineHierarchy?: {
		acts?: ReadonlyArray<unknown>;
		chapters?: ReadonlyArray<unknown>;
		scenes?: ReadonlyArray<unknown>;
	} | null;
}

export interface OutlineContextPacketOptions {
	charBudget?: number;
}

const ENTITY_RANK: Record<OutlineContextEntityType, number> = {
	project: 0,
	story_frame: 5,
	character: 10,
	plot_thread: 20,
	location: 30,
	faction: 35,
	lore_entry: 40,
	timeline_event: 45,
	theme: 50,
	checkpoint: 60,
};

const WORLD_GROUPS = [
	'characters',
	'plotThreads',
	'locations',
	'factions',
	'loreEntries',
	'timelineEvents',
	'themes',
	'checkpointSummaries',
] as const;

type WorldGroup = (typeof WORLD_GROUPS)[number];

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function trimText(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function numberOrNull(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function fieldText(record: JsonRecord, key: string): string {
	const value = record[key];
	if (typeof value === 'string') return value.trim();
	if (typeof value === 'number' && Number.isFinite(value)) return `${value}`;
	if (Array.isArray(value)) {
		return value
			.filter((item): item is string => typeof item === 'string')
			.map((item) => item.trim())
			.filter(Boolean)
			.join(', ');
	}
	return '';
}

function firstText(record: JsonRecord, keys: string[], fallback = ''): string {
	for (const key of keys) {
		const value = fieldText(record, key);
		if (value) return value;
	}
	return fallback;
}

function truncateSummary(value: string): { text: string; truncated: boolean } {
	const trimmed = value.trim();
	if (trimmed.length <= OUTLINE_CONTEXT_ENTRY_SUMMARY_LIMIT) {
		return { text: trimmed, truncated: false };
	}
	return {
		text: `${trimmed.slice(0, OUTLINE_CONTEXT_ENTRY_SUMMARY_LIMIT).trimEnd()}...`,
		truncated: true,
	};
}

function compactSummary(record: JsonRecord, keys: string[]): { text: string; truncated: boolean } {
	const parts = keys
		.map((key) => fieldText(record, key))
		.filter((value, index, list) => value && list.indexOf(value) === index);
	return truncateSummary(parts.join(' | '));
}

function stableKeyPart(value: string): string {
	const normalized = value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return normalized || 'unknown';
}

function stableStringify(value: unknown): string {
	if (value === null || typeof value !== 'object') return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
	const record = value as JsonRecord;
	return `{${Object.keys(record)
		.sort()
		.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
		.join(',')}}`;
}

function stableHash(value: unknown): string {
	return createOutlineContextTextReference(stableStringify(value), Number.MAX_SAFE_INTEGER).hash;
}

function estimateChars(value: unknown): number {
	return stableStringify(value).length;
}

function parseCheckpoint(value: unknown): JsonRecord | null {
	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value) as unknown;
			return isRecord(parsed) ? parsed : null;
		} catch {
			return null;
		}
	}
	return isRecord(value) ? value : null;
}

function candidateCheckpoints(input: OutlineContextPacketInput): JsonRecord[] {
	const worldbuilding = input.worldbuilding ?? null;
	const groups = [
		worldbuilding?.acceptedCheckpoints,
		worldbuilding?.pipelineCheckpoints,
		worldbuilding?.legacyMetadataValues,
	];
	const checkpoints: JsonRecord[] = [];
	for (const group of groups) {
		if (!Array.isArray(group)) continue;
		for (const value of group) {
			const checkpoint = parseCheckpoint(value);
			if (checkpoint && trimText(checkpoint.lifecycle) === 'accepted') checkpoints.push(checkpoint);
		}
	}
	return checkpoints;
}

function makeSourceRef(
	kind: OutlineContextSourceKind,
	entityType: OutlineContextEntityType,
	sourceId: string,
	label: string,
	path: string,
	index: number,
): OutlineContextSourceReference {
	const safeSourceId = stableKeyPart(sourceId || `${index}`);
	return {
		id: `${kind}:${entityType}:${safeSourceId}:${stableKeyPart(path)}:${index}`,
		kind,
		entityType,
		sourceId: sourceId || `${index}`,
		label,
		path,
		rank: ENTITY_RANK[entityType],
	};
}

function makeEntry(
	record: JsonRecord,
	ref: OutlineContextSourceReference,
	labelKeys: string[],
	summaryKeys: string[],
): OutlineContextPacketEntry {
	const label = firstText(record, labelKeys, ref.label);
	const summary = compactSummary(record, summaryKeys);
	return {
		id: ref.sourceId,
		label,
		summary: summary.text,
		sourceRefId: ref.id,
		sourceKind: ref.kind,
		rank: ref.rank,
		truncated: summary.truncated,
	};
}

function entriesFromRows(
	rows: ReadonlyArray<unknown> | null | undefined,
	kind: OutlineContextSourceKind,
	entityType: OutlineContextEntityType,
	pathPrefix: string,
	labelKeys: string[],
	summaryKeys: string[],
	sourceRefs: Map<string, OutlineContextSourceReference>,
): OutlineContextPacketEntry[] {
	if (!Array.isArray(rows)) return [];
	return rows
		.map((row, index) => {
			const record = typeof row === 'string' ? { label: row } : row;
			if (!isRecord(record)) return null;
			const label = firstText(record, labelKeys, `${entityType} ${index + 1}`);
			if (!label) return null;
			const sourceId = firstText(record, ['id', 'title', 'name', 'term'], `${index}`);
			const ref = makeSourceRef(kind, entityType, sourceId, label, `${pathPrefix}[${index}]`, index);
			sourceRefs.set(ref.id, ref);
			return makeEntry(record, ref, labelKeys, summaryKeys);
		})
		.filter((entry): entry is OutlineContextPacketEntry => entry !== null)
		.sort(compareEntries);
}

function compareEntries(a: OutlineContextPacketEntry, b: OutlineContextPacketEntry): number {
	return a.rank - b.rank || a.label.localeCompare(b.label) || a.sourceRefId.localeCompare(b.sourceRefId);
}

function compareRefs(a: OutlineContextSourceReference, b: OutlineContextSourceReference): number {
	return a.rank - b.rank || a.label.localeCompare(b.label) || a.id.localeCompare(b.id);
}

function checkpointPayload(record: JsonRecord): JsonRecord | null {
	const artifact = record.artifact;
	if (!isRecord(artifact)) return null;
	return isRecord(artifact.payload) ? artifact.payload : null;
}

function recordArray(record: JsonRecord | null, key: string): ReadonlyArray<unknown> {
	const value = record?.[key];
	return Array.isArray(value) ? value : [];
}

function nestedRecord(record: JsonRecord | null, key: string): JsonRecord | null {
	const value = record?.[key];
	return isRecord(value) ? value : null;
}

function countRows(rows: ReadonlyArray<unknown>, labelKeys: string[]): number {
	return rows.filter((row) => {
		if (typeof row === 'string') return row.trim().length > 0;
		return isRecord(row) && Boolean(firstText(row, labelKeys));
	}).length;
}

function checkpointSummaryText(taskKey: string, payload: JsonRecord | null): string {
	if (!payload) return taskKey;
	if (taskKey === PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE) {
		return compactSummary(payload, ['hook', 'coreConflict', 'readerPromise']).text || taskKey;
	}
	const tableWrites = nestedRecord(payload, 'tableWrites');
	const parts = [
		`characters ${countRows(recordArray(payload, 'individuals'), ['name', 'id']) + countRows(recordArray(tableWrites, 'characters'), ['name', 'id'])}`,
		`plot threads ${countRows(recordArray(payload, 'majorArcs'), ['title', 'id']) + countRows(recordArray(payload, 'subplots'), ['title', 'id']) + countRows(recordArray(tableWrites, 'plot_threads'), ['title', 'id'])}`,
		`locations ${countRows(recordArray(payload, 'realms'), ['name', 'id']) + countRows(recordArray(payload, 'landmarks'), ['name', 'id']) + countRows(recordArray(tableWrites, 'locations'), ['name', 'id'])}`,
	].filter((part) => !part.endsWith(' 0'));
	return parts.length ? parts.join(' | ') : taskKey;
}

function addCheckpointEntries(
	packetEntries: Record<WorldGroup, OutlineContextPacketEntry[]>,
	sourceRefs: Map<string, OutlineContextSourceReference>,
	checkpoints: JsonRecord[],
): void {
	for (let checkpointIndex = 0; checkpointIndex < checkpoints.length; checkpointIndex++) {
		const checkpoint = checkpoints[checkpointIndex];
		const checkpointId = firstText(checkpoint, ['id'], `${checkpointIndex}`);
		const taskKey = firstText(checkpoint, ['taskKey'], 'accepted-checkpoint');
		const payload = checkpointPayload(checkpoint);
		const summaryRef = makeSourceRef(
			'checkpoint',
			'checkpoint',
			checkpointId,
			taskKey,
			`acceptedCheckpoints[${checkpointIndex}]`,
			checkpointIndex,
		);
		sourceRefs.set(summaryRef.id, summaryRef);
		const summary = truncateSummary(checkpointSummaryText(taskKey, payload));
		const tableWrites = nestedRecord(payload, 'tableWrites');
		const canonical = nestedRecord(payload, 'canonical');
		const itemCounts: OutlineContextCheckpointSummary['itemCounts'] = {};

		const summaryEntry: OutlineContextCheckpointSummary = {
			id: checkpointId,
			label: taskKey,
			summary: summary.text,
			sourceRefId: summaryRef.id,
			sourceKind: 'checkpoint',
			rank: summaryRef.rank,
			truncated: summary.truncated,
			taskKey,
			itemCounts,
		};

		const addRows = (
			group: WorldGroup,
			entityType: OutlineContextEntityType,
			rows: ReadonlyArray<unknown>,
			labelKeys: string[],
			summaryKeys: string[],
		) => {
			if (!rows.length) return;
			itemCounts[entityType] = (itemCounts[entityType] ?? 0) + countRows(rows, labelKeys);
			packetEntries[group].push(
				...entriesFromRows(
					rows,
					'checkpoint',
					entityType,
					`acceptedCheckpoints[${checkpointIndex}].artifact.payload.${group}`,
					labelKeys,
					summaryKeys,
					sourceRefs,
				),
			);
		};

		addRows('characters', 'character', recordArray(payload, 'individuals'), ['name', 'id'], [
			'role',
			'storyRole',
			'coreDesire',
			'externalGoal',
			'internalNeed',
			'stakes',
			'bio',
		]);
		addRows('characters', 'character', recordArray(payload, 'characters'), ['name', 'id'], [
			'role',
			'bio',
			'goals',
			'traits',
		]);
		addRows('characters', 'character', recordArray(tableWrites, 'characters'), ['name', 'id'], [
			'role',
			'bio',
			'goals',
			'traits',
		]);
		addRows('characters', 'character', recordArray(canonical, 'characters'), ['name', 'id'], [
			'role',
			'bio',
			'goals',
			'traits',
		]);
		addRows('plotThreads', 'plot_thread', recordArray(payload, 'majorArcs'), ['title', 'id'], [
			'description',
			'status',
			'relatedCharacterIds',
		]);
		addRows('plotThreads', 'plot_thread', recordArray(payload, 'subplots'), ['title', 'id'], [
			'description',
			'status',
			'relatedCharacterIds',
		]);
		addRows('plotThreads', 'plot_thread', recordArray(tableWrites, 'plot_threads'), ['title', 'id'], [
			'description',
			'status',
			'relatedCharacterIds',
		]);
		addRows('locations', 'location', recordArray(payload, 'realms'), ['name', 'id'], [
			'description',
			'tags',
		]);
		addRows('locations', 'location', recordArray(payload, 'landmarks'), ['name', 'id'], [
			'description',
			'tags',
		]);
		addRows('locations', 'location', recordArray(tableWrites, 'locations'), ['name', 'id'], [
			'description',
			'tags',
		]);
		addRows('factions', 'faction', recordArray(payload, 'factions'), ['name', 'id'], [
			'type',
			'mission',
			'ideology',
			'description',
		]);
		addRows('factions', 'faction', recordArray(tableWrites, 'factions'), ['name', 'id'], [
			'type',
			'mission',
			'ideology',
			'description',
		]);
		addRows('loreEntries', 'lore_entry', recordArray(payload, 'myths'), ['title', 'id'], [
			'category',
			'content',
			'tags',
		]);
		addRows('loreEntries', 'lore_entry', recordArray(payload, 'traditions'), ['title', 'id'], [
			'category',
			'content',
			'tags',
		]);
		addRows('loreEntries', 'lore_entry', recordArray(payload, 'technologies'), ['title', 'id'], [
			'category',
			'content',
			'tags',
		]);
		addRows('loreEntries', 'lore_entry', recordArray(tableWrites, 'lore_entries'), ['title', 'id'], [
			'category',
			'content',
			'tags',
		]);
		addRows('timelineEvents', 'timeline_event', recordArray(payload, 'keyEvents'), ['title', 'id'], [
			'date',
			'description',
			'relatedCharacterIds',
		]);
		addRows('timelineEvents', 'timeline_event', recordArray(payload, 'personalHistories'), ['title', 'id'], [
			'date',
			'description',
			'relatedCharacterIds',
		]);
		addRows('timelineEvents', 'timeline_event', recordArray(tableWrites, 'timeline_events'), ['title', 'id'], [
			'date',
			'description',
			'relatedCharacterIds',
		]);
		addRows('themes', 'theme', recordArray(payload, 'themes'), ['title', 'id'], [
			'description',
			'tensionPair',
			'imagery',
		]);
		addRows('themes', 'theme', recordArray(tableWrites, 'themes'), ['title', 'id'], [
			'description',
			'tensionPair',
			'imagery',
		]);

		packetEntries.checkpointSummaries.push(summaryEntry);
	}
}

function storyFrameEntries(
	storyFrames: ReadonlyArray<unknown> | null | undefined,
	sourceRefs: Map<string, OutlineContextSourceReference>,
): OutlineContextPacketEntry[] {
	if (!Array.isArray(storyFrames)) return [];
	return storyFrames
		.map((frame, index) => {
			if (!isRecord(frame)) return null;
			const label = `Story frame ${index + 1}`;
			const sourceId = firstText(frame, ['id'], `${index}`);
			const ref = makeSourceRef('story_frame', 'story_frame', sourceId, label, `storyFrames[${index}]`, index);
			sourceRefs.set(ref.id, ref);
			return makeEntry(frame, ref, ['premise', 'theme'], ['premise', 'theme', 'toneNotes']);
		})
		.filter((entry): entry is OutlineContextPacketEntry => entry !== null)
		.sort(compareEntries);
}

function outlinePlanningEntries(
	hierarchy: OutlineContextPacketInput['outlineHierarchy'],
	sourceRefs: Map<string, OutlineContextSourceReference>,
): OutlineContextPacketEntry[] {
	const acts = Array.isArray(hierarchy?.acts) ? hierarchy.acts : [];
	return entriesFromRows(
		acts,
		'canonical',
		'story_frame',
		'outlineHierarchy.acts',
		['title', 'id'],
		['title', 'planningNotes'],
		sourceRefs,
	).filter((entry) => entry.summary.length > 0);
}

function detectDuplicateLabels(
	entries: OutlineContextPacketEntry[],
	warnings: OutlineContextPacketWarning[],
): void {
	const seen = new Map<string, OutlineContextPacketEntry>();
	for (const entry of entries) {
		const key = `${entry.rank}:${entry.label.trim().toLowerCase()}`;
		const prior = seen.get(key);
		if (!prior) {
			seen.set(key, entry);
			continue;
		}
		if (prior.sourceRefId === entry.sourceRefId) continue;
		warnings.push({
			code: 'duplicate_source_label',
			message: `Multiple context sources share the label "${entry.label}"; source references are retained for review.`,
			sourceRefId: entry.sourceRefId,
		});
	}
}

function emptyWorldEntries(): Record<WorldGroup, OutlineContextPacketEntry[]> {
	return {
		characters: [],
		plotThreads: [],
		locations: [],
		factions: [],
		loreEntries: [],
		timelineEvents: [],
		themes: [],
		checkpointSummaries: [],
	};
}

function applyBudget(
	project: OutlineContextPacket['project'],
	readiness: OutlineContextSufficiencyResult,
	fullWorldbuilding: Record<WorldGroup, OutlineContextPacketEntry[]>,
	sourceRefs: Map<string, OutlineContextSourceReference>,
	warnings: OutlineContextPacketWarning[],
	charBudget: number,
): {
	worldbuilding: OutlineContextPacket['worldbuilding'];
	sourceReferences: OutlineContextSourceReference[];
	budget: OutlineContextPacketBudget;
} {
	const kept = emptyWorldEntries();
	const keptRefIds = new Set<string>();
	for (const entry of project.planningNotes) keptRefIds.add(entry.sourceRefId);

	let estimated = estimateChars({ project, readiness: { ok: readiness.ok, missing: readiness.missing } });
	let omittedSourceCount = 0;
	const orderedEntries: Array<{ group: WorldGroup; entry: OutlineContextPacketEntry }> = [];
	for (const group of WORLD_GROUPS) {
		for (const entry of fullWorldbuilding[group].sort(compareEntries)) orderedEntries.push({ group, entry });
	}
	orderedEntries.sort((a, b) => compareEntries(a.entry, b.entry));

	for (const { group, entry } of orderedEntries) {
		const ref = sourceRefs.get(entry.sourceRefId);
		const cost = estimateChars(entry) + (ref ? estimateChars(ref) : 0);
		if (estimated + cost <= charBudget) {
			kept[group].push(entry);
			keptRefIds.add(entry.sourceRefId);
			estimated += cost;
		} else {
			omittedSourceCount += 1;
		}
	}

	if (omittedSourceCount > 0) {
		warnings.push({
			code: 'context_budget_exceeded',
			message: 'Outline context packet omitted lower-priority sources to stay within budget.',
		});
	}

	const sourceReferences = Array.from(sourceRefs.values())
		.filter((ref) => keptRefIds.has(ref.id) || ref.kind === 'project' || ref.kind === 'story_frame')
		.sort(compareRefs);

	return {
		worldbuilding: {
			characters: kept.characters,
			plotThreads: kept.plotThreads,
			locations: kept.locations,
			factions: kept.factions,
			loreEntries: kept.loreEntries,
			timelineEvents: kept.timelineEvents,
			themes: kept.themes,
			checkpointSummaries: kept.checkpointSummaries as OutlineContextCheckpointSummary[],
		},
		sourceReferences,
		budget: {
			charBudget,
			estimatedChars: 0,
			truncated: omittedSourceCount > 0,
			omittedSourceCount,
		},
	};
}

function buildProject(
	input: OutlineContextPacketInput,
	sourceRefs: Map<string, OutlineContextSourceReference>,
): OutlineContextPacket['project'] {
	const project = isRecord(input.project) ? input.project : {};
	const projectId = trimText(project.id) || null;
	const title = trimText(project.title) || null;
	const identityRef = makeSourceRef(
		'project',
		'project',
		projectId ?? 'current',
		title ?? 'Current project',
		'project',
		0,
	);
	sourceRefs.set(identityRef.id, identityRef);
	const synopsis = trimText(project.synopsis);
	const planningNotes = [
		...storyFrameEntries(input.storyFrames, sourceRefs),
		...outlinePlanningEntries(input.outlineHierarchy, sourceRefs),
	];
	return {
		id: projectId,
		title,
		genre: trimText(project.genre),
		logline: trimText(project.logline),
		synopsis: synopsis ? createOutlineContextTextReference(synopsis) : null,
		targetWordCount: numberOrNull(project.targetWordCount),
		status: trimText(project.status),
		projectType: trimText(project.projectType),
		planningNotes,
	};
}

export function buildOutlineContextPacket(
	input: OutlineContextPacketInput,
	options: OutlineContextPacketOptions = {},
): OutlineContextPacket {
	const sourceRefs = new Map<string, OutlineContextSourceReference>();
	const project = buildProject(input, sourceRefs);
	const worldbuilding = input.worldbuilding ?? {};
	const checkpoints = candidateCheckpoints(input);
	const readiness = evaluateOutlineContextSufficiency({
		project: {
			...(isRecord(input.project) ? input.project : {}),
			storyFrames: input.storyFrames ?? [],
		},
		worldbuilding: {
			characters: worldbuilding.characters,
			plotThreads: worldbuilding.plotThreads,
			locations: worldbuilding.locations,
			factions: worldbuilding.factions,
			loreEntries: worldbuilding.loreEntries,
			timelineEvents: worldbuilding.timelineEvents,
			themes: worldbuilding.themes,
			acceptedCheckpoints: worldbuilding.acceptedCheckpoints,
			pipelineCheckpoints: worldbuilding.pipelineCheckpoints,
			legacyMetadataValues: worldbuilding.legacyMetadataValues,
		},
	});
	const warnings: OutlineContextPacketWarning[] = readiness.warnings.map((warning) => ({
		code: warning.code,
		message: warning.message,
	}));
	const fullWorldEntries = emptyWorldEntries();
	fullWorldEntries.characters.push(
		...entriesFromRows(worldbuilding.characters, 'canonical', 'character', 'worldbuilding.characters', ['name', 'id'], [
			'role',
			'storyRole',
			'coreDesire',
			'externalGoal',
			'internalNeed',
			'stakes',
			'bio',
			'goals',
			'traits',
			'notes',
		], sourceRefs),
	);
	fullWorldEntries.plotThreads.push(
		...entriesFromRows(worldbuilding.plotThreads, 'canonical', 'plot_thread', 'worldbuilding.plotThreads', ['title', 'id'], [
			'description',
			'status',
			'relatedCharacterIds',
		], sourceRefs),
	);
	fullWorldEntries.locations.push(
		...entriesFromRows(worldbuilding.locations, 'canonical', 'location', 'worldbuilding.locations', ['name', 'id'], [
			'description',
			'storyRole',
			'conflictPressure',
			'tags',
		], sourceRefs),
	);
	fullWorldEntries.factions.push(
		...entriesFromRows(worldbuilding.factions, 'canonical', 'faction', 'worldbuilding.factions', ['name', 'id'], [
			'type',
			'mission',
			'ideology',
			'description',
		], sourceRefs),
	);
	fullWorldEntries.loreEntries.push(
		...entriesFromRows(worldbuilding.loreEntries, 'canonical', 'lore_entry', 'worldbuilding.loreEntries', ['title', 'id'], [
			'category',
			'content',
			'tags',
		], sourceRefs),
	);
	fullWorldEntries.timelineEvents.push(
		...entriesFromRows(worldbuilding.timelineEvents, 'canonical', 'timeline_event', 'worldbuilding.timelineEvents', ['title', 'id'], [
			'date',
			'description',
			'relatedCharacterIds',
		], sourceRefs),
	);
	fullWorldEntries.themes.push(
		...entriesFromRows(worldbuilding.themes, 'canonical', 'theme', 'worldbuilding.themes', ['title', 'id'], [
			'description',
			'tensionPair',
			'imagery',
		], sourceRefs),
	);
	addCheckpointEntries(fullWorldEntries, sourceRefs, checkpoints);

	detectDuplicateLabels(Object.values(fullWorldEntries).flat(), warnings);
	const charBudget = Math.max(1, Math.floor(options.charBudget ?? OUTLINE_CONTEXT_PACKET_DEFAULT_CHAR_BUDGET));
	const budgeted = applyBudget(project, readiness, fullWorldEntries, sourceRefs, warnings, charBudget);
	const packetWithoutHash = {
		version: OUTLINE_CONTEXT_PACKET_VERSION,
		project,
		readiness,
		worldbuilding: budgeted.worldbuilding,
		sourceReferences: budgeted.sourceReferences,
		warnings,
		budget: budgeted.budget,
	};
	const packet: OutlineContextPacket = {
		...packetWithoutHash,
		budget: {
			...budgeted.budget,
			estimatedChars: estimateChars(packetWithoutHash),
		},
		contextHash: stableHash(packetWithoutHash),
	};
	return packet;
}

export function buildOutlineContextPacketFromAiContext(
	context: AiContext,
	options: OutlineContextPacketOptions & { acceptedCheckpoints?: ReadonlyArray<unknown> | null } = {},
): OutlineContextPacket {
	return buildOutlineContextPacket(
		{
			project: context.project ?? null,
			storyFrames: context.storyFrames ?? [],
			worldbuilding: {
				characters: context.characters,
				plotThreads: context.plotThreads,
				locations: context.locations,
				factions: context.factions,
				loreEntries: context.loreEntries,
				timelineEvents: context.timelineEvents,
				themes: context.themes,
				acceptedCheckpoints: options.acceptedCheckpoints ?? [],
			},
			outlineHierarchy: context.outlineHierarchy ?? null,
		},
		options,
	);
}
