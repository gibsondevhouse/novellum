import { PIPELINE_TASK_KEYS } from './task-catalog.js';

type JsonRecord = Record<string, unknown>;

export const OUTLINE_CONTEXT_MIN_PREMISE_LENGTH = 12 as const;
export const OUTLINE_CONTEXT_INLINE_TEXT_LIMIT = 1_200 as const;
export const OUTLINE_CONTEXT_TEXT_SUMMARY_LIMIT = 600 as const;

export const OUTLINE_CONTEXT_REQUIRED_BANDS = [
	'project_identity',
	'primary_story_premise',
	'character_or_plot_thread',
] as const;

export const OUTLINE_CONTEXT_ENRICHING_BANDS = [
	'locations',
	'factions',
	'lore_entries',
	'timeline_events',
	'themes',
] as const;

export type OutlineContextRequiredBand = (typeof OUTLINE_CONTEXT_REQUIRED_BANDS)[number];
export type OutlineContextEnrichingBand = (typeof OUTLINE_CONTEXT_ENRICHING_BANDS)[number];
export type OutlineContextBand = OutlineContextRequiredBand | OutlineContextEnrichingBand;

export type OutlineContextMissingCode =
	| 'project_identity_missing'
	| 'story_premise_missing'
	| 'story_source_missing';

export type OutlineContextWarningCode = 'malformed_legacy_json';

export type OutlinePremiseSourceKind =
	| 'project_premise'
	| 'project_logline'
	| 'story_frame_premise'
	| 'accepted_checkpoint_premise'
	| 'project_synopsis';

export interface OutlineContextMissingPrerequisite {
	code: OutlineContextMissingCode;
	band: OutlineContextRequiredBand;
	message: string;
}

export interface OutlineContextWarning {
	code: OutlineContextWarningCode;
	message: string;
	source: string;
}

export interface OutlineContextTextReference {
	text: string;
	hash: string;
	length: number;
	truncated: boolean;
}

export interface OutlineProjectSufficiencyInput {
	id?: string | null;
	title?: string | null;
	premise?: string | null;
	logline?: string | null;
	synopsis?: string | null;
	storyFrames?: ReadonlyArray<OutlineStoryFrameSufficiencyInput | unknown> | null;
}

export interface OutlineStoryFrameSufficiencyInput {
	premise?: unknown;
	theme?: unknown;
	toneNotes?: unknown;
	updatedAt?: unknown;
}

export interface OutlineWorldbuildingSufficiencyInput {
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
}

export interface OutlineContextSufficiencyInput {
	project?: OutlineProjectSufficiencyInput | null;
	worldbuilding?: OutlineWorldbuildingSufficiencyInput | null;
}

export interface OutlineContextSourceCounts {
	characters: number;
	plotThreads: number;
	locations: number;
	factions: number;
	loreEntries: number;
	timelineEvents: number;
	themes: number;
	acceptedCheckpointCharacters: number;
	acceptedCheckpointPlotThreads: number;
	acceptedCheckpointPremises: number;
}

export interface OutlineContextBandState {
	band: OutlineContextBand;
	required: boolean;
	present: boolean;
	count: number;
}

export interface OutlineContextPremiseSummary {
	sourceKind: OutlinePremiseSourceKind;
	value: OutlineContextTextReference;
}

export interface OutlineContextSufficiencySummary {
	project: {
		id: string | null;
		title: string | null;
		premise: OutlineContextPremiseSummary | null;
	};
	required: Record<OutlineContextRequiredBand, OutlineContextBandState>;
	enriching: Record<OutlineContextEnrichingBand, OutlineContextBandState>;
	sourceCounts: OutlineContextSourceCounts;
}

export interface OutlineContextSufficiencyResult {
	ok: boolean;
	missing: OutlineContextMissingPrerequisite[];
	warnings: OutlineContextWarning[];
	summary: OutlineContextSufficiencySummary;
}

interface CheckpointScanResult {
	premiseCandidates: string[];
	counts: Pick<
		OutlineContextSourceCounts,
		| 'characters'
		| 'plotThreads'
		| 'locations'
		| 'factions'
		| 'loreEntries'
		| 'timelineEvents'
		| 'themes'
		| 'acceptedCheckpointCharacters'
		| 'acceptedCheckpointPlotThreads'
		| 'acceptedCheckpointPremises'
	>;
}

const MISSING_MESSAGES: Record<OutlineContextMissingCode, string> = {
	project_identity_missing: 'Open a project with a title before generating an outline.',
	story_premise_missing:
		'Add a logline, synopsis, story-frame premise, or accepted premise checkpoint before generating an outline.',
	story_source_missing:
		'Add at least one character or plot thread before generating an outline.',
};

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function trimText(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function hasPremiseSignal(value: unknown): value is string {
	return trimText(value).length >= OUTLINE_CONTEXT_MIN_PREMISE_LENGTH;
}

function stableTextHash(value: string): string {
	let hash = 0x811c9dc5;
	for (let index = 0; index < value.length; index++) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return hash.toString(16).padStart(8, '0');
}

export function createOutlineContextTextReference(
	value: string,
	limit: number = OUTLINE_CONTEXT_INLINE_TEXT_LIMIT,
): OutlineContextTextReference {
	const trimmed = value.trim();
	if (trimmed.length <= limit) {
		return {
			text: trimmed,
			hash: stableTextHash(trimmed),
			length: trimmed.length,
			truncated: false,
		};
	}

	const summaryLimit = Math.min(limit, OUTLINE_CONTEXT_TEXT_SUMMARY_LIMIT);
	return {
		text: `${trimmed.slice(0, summaryLimit).trimEnd()}...`,
		hash: stableTextHash(trimmed),
		length: trimmed.length,
		truncated: true,
	};
}

function countEntitySources(items: ReadonlyArray<unknown> | null | undefined, keys: string[]): number {
	if (!Array.isArray(items)) return 0;
	return items.filter((item) => {
		if (typeof item === 'string') return item.trim().length > 0;
		if (!isRecord(item)) return false;
		return keys.some((key) => trimText(item[key]).length > 0);
	}).length;
}

function recordArray(record: JsonRecord | null, key: string): ReadonlyArray<unknown> {
	const value = record?.[key];
	return Array.isArray(value) ? value : [];
}

function nestedRecord(record: JsonRecord | null, key: string): JsonRecord | null {
	const value = record?.[key];
	return isRecord(value) ? value : null;
}

function parseCheckpointCandidate(
	value: unknown,
	source: string,
	warnings: OutlineContextWarning[],
): JsonRecord | null {
	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value) as unknown;
			return isRecord(parsed) ? parsed : null;
		} catch {
			warnings.push({
				code: 'malformed_legacy_json',
				message: 'A saved worldbuilding source could not be read and was ignored.',
				source,
			});
			return null;
		}
	}

	return isRecord(value) ? value : null;
}

function checkpointCandidates(
	worldbuilding: OutlineWorldbuildingSufficiencyInput | null | undefined,
	warnings: OutlineContextWarning[],
): JsonRecord[] {
	const groups: Array<[string, ReadonlyArray<unknown> | null | undefined]> = [
		['acceptedCheckpoints', worldbuilding?.acceptedCheckpoints],
		['pipelineCheckpoints', worldbuilding?.pipelineCheckpoints],
		['legacyMetadataValues', worldbuilding?.legacyMetadataValues],
	];
	const checkpoints: JsonRecord[] = [];

	for (const [groupName, values] of groups) {
		if (!Array.isArray(values)) continue;
		for (let index = 0; index < values.length; index++) {
			const parsed = parseCheckpointCandidate(values[index], `${groupName}[${index}]`, warnings);
			if (parsed) checkpoints.push(parsed);
		}
	}

	return checkpoints;
}

function addCounts(target: CheckpointScanResult['counts'], source: Partial<CheckpointScanResult['counts']>): void {
	for (const [key, value] of Object.entries(source)) {
		target[key as keyof CheckpointScanResult['counts']] += value ?? 0;
	}
}

function premiseFromPayload(payload: JsonRecord | null): string {
	if (!payload) return '';
	const fields = [
		trimText(payload.hook),
		trimText(payload.coreConflict),
		trimText(payload.readerPromise),
	].filter(Boolean);
	return fields.join(' ');
}

function countCheckpointPayload(record: JsonRecord): CheckpointScanResult {
	const emptyCounts: CheckpointScanResult['counts'] = {
		characters: 0,
		plotThreads: 0,
		locations: 0,
		factions: 0,
		loreEntries: 0,
		timelineEvents: 0,
		themes: 0,
		acceptedCheckpointCharacters: 0,
		acceptedCheckpointPlotThreads: 0,
		acceptedCheckpointPremises: 0,
	};
	const result: CheckpointScanResult = {
		premiseCandidates: [],
		counts: emptyCounts,
	};

	if (trimText(record.lifecycle) !== 'accepted') return result;

	const taskKey = trimText(record.taskKey);
	const artifact = nestedRecord(record, 'artifact');
	const payload = nestedRecord(artifact, 'payload');
	if (!payload) return result;

	if (taskKey === PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE) {
		const premise = premiseFromPayload(payload);
		if (hasPremiseSignal(premise)) {
			result.premiseCandidates.push(premise);
			result.counts.acceptedCheckpointPremises += 1;
		}
		return result;
	}

	const tableWrites = nestedRecord(payload, 'tableWrites');
	const canonical = nestedRecord(payload, 'canonical');

	const characterCount =
		countEntitySources(recordArray(payload, 'individuals'), ['name', 'id']) +
		countEntitySources(recordArray(payload, 'characters'), ['name', 'id']) +
		countEntitySources(recordArray(tableWrites, 'characters'), ['name', 'id']) +
		countEntitySources(recordArray(canonical, 'characters'), ['name', 'id']);
	const plotThreadCount =
		countEntitySources(recordArray(payload, 'majorArcs'), ['title', 'id']) +
		countEntitySources(recordArray(payload, 'subplots'), ['title', 'id']) +
		countEntitySources(recordArray(payload, 'plotThreads'), ['title', 'id']) +
		countEntitySources(recordArray(tableWrites, 'plot_threads'), ['title', 'id']);

	addCounts(result.counts, {
		characters: characterCount,
		plotThreads: plotThreadCount,
		acceptedCheckpointCharacters: characterCount,
		acceptedCheckpointPlotThreads: plotThreadCount,
		locations:
			countEntitySources(recordArray(payload, 'realms'), ['name', 'id']) +
			countEntitySources(recordArray(payload, 'landmarks'), ['name', 'id']) +
			countEntitySources(recordArray(tableWrites, 'locations'), ['name', 'id']) +
			countEntitySources(recordArray(canonical, 'locations'), ['name', 'id']),
		factions:
			countEntitySources(recordArray(payload, 'factions'), ['name', 'id']) +
			countEntitySources(recordArray(tableWrites, 'factions'), ['name', 'id']) +
			countEntitySources(recordArray(canonical, 'factions'), ['name', 'id']),
		loreEntries:
			countEntitySources(recordArray(payload, 'myths'), ['title', 'id']) +
			countEntitySources(recordArray(payload, 'traditions'), ['title', 'id']) +
			countEntitySources(recordArray(payload, 'technologies'), ['title', 'id']) +
			countEntitySources(recordArray(tableWrites, 'lore_entries'), ['title', 'id']) +
			countEntitySources(recordArray(canonical, 'loreEntries'), ['title', 'id']),
		timelineEvents:
			countEntitySources(recordArray(payload, 'keyEvents'), ['title', 'id']) +
			countEntitySources(recordArray(payload, 'personalHistories'), ['title', 'id']) +
			countEntitySources(recordArray(tableWrites, 'timeline_events'), ['title', 'id']) +
			countEntitySources(recordArray(canonical, 'timelineEvents'), ['title', 'id']),
		themes:
			countEntitySources(recordArray(payload, 'themes'), ['title', 'id']) +
			countEntitySources(recordArray(tableWrites, 'themes'), ['title', 'id']) +
			countEntitySources(recordArray(canonical, 'themes'), ['title', 'id']),
	});

	return result;
}

function scanAcceptedCheckpoints(checkpoints: JsonRecord[]): CheckpointScanResult {
	const aggregate: CheckpointScanResult = {
		premiseCandidates: [],
		counts: {
			characters: 0,
			plotThreads: 0,
			locations: 0,
			factions: 0,
			loreEntries: 0,
			timelineEvents: 0,
			themes: 0,
			acceptedCheckpointCharacters: 0,
			acceptedCheckpointPlotThreads: 0,
			acceptedCheckpointPremises: 0,
		},
	};

	for (const checkpoint of checkpoints) {
		const result = countCheckpointPayload(checkpoint);
		aggregate.premiseCandidates.push(...result.premiseCandidates);
		addCounts(aggregate.counts, result.counts);
	}

	return aggregate;
}

function firstStoryFramePremise(project: OutlineProjectSufficiencyInput | null | undefined): string {
	if (!Array.isArray(project?.storyFrames)) return '';
	for (const frame of project.storyFrames) {
		if (!isRecord(frame)) continue;
		const premise = trimText(frame.premise);
		if (hasPremiseSignal(premise)) return premise;
	}
	return '';
}

function resolvePremise(
	project: OutlineProjectSufficiencyInput | null | undefined,
	checkpointPremises: string[],
): OutlineContextPremiseSummary | null {
	const candidates: Array<[OutlinePremiseSourceKind, unknown]> = [
		['project_premise', project?.premise],
		['project_logline', project?.logline],
		['story_frame_premise', firstStoryFramePremise(project)],
		['accepted_checkpoint_premise', checkpointPremises[0]],
		['project_synopsis', project?.synopsis],
	];

	for (const [sourceKind, value] of candidates) {
		if (!hasPremiseSignal(value)) continue;
		return {
			sourceKind,
			value: createOutlineContextTextReference(value),
		};
	}

	return null;
}

function makeBandState(
	band: OutlineContextBand,
	required: boolean,
	present: boolean,
	count: number,
): OutlineContextBandState {
	return { band, required, present, count };
}

export function evaluateOutlineContextSufficiency(
	input: OutlineContextSufficiencyInput,
): OutlineContextSufficiencyResult {
	const project = input.project ?? null;
	const worldbuilding = input.worldbuilding ?? null;
	const warnings: OutlineContextWarning[] = [];
	const checkpoints = checkpointCandidates(worldbuilding, warnings);
	const checkpointScan = scanAcceptedCheckpoints(checkpoints);

	const projectId = trimText(project?.id) || null;
	const projectTitle = trimText(project?.title) || null;
	const premise = resolvePremise(project, checkpointScan.premiseCandidates);
	const sourceCounts: OutlineContextSourceCounts = {
		characters:
			countEntitySources(worldbuilding?.characters, ['name', 'id']) +
			checkpointScan.counts.characters,
		plotThreads:
			countEntitySources(worldbuilding?.plotThreads, ['title', 'id']) +
			checkpointScan.counts.plotThreads,
		locations:
			countEntitySources(worldbuilding?.locations, ['name', 'id']) +
			checkpointScan.counts.locations,
		factions:
			countEntitySources(worldbuilding?.factions, ['name', 'id']) +
			checkpointScan.counts.factions,
		loreEntries:
			countEntitySources(worldbuilding?.loreEntries, ['title', 'id']) +
			checkpointScan.counts.loreEntries,
		timelineEvents:
			countEntitySources(worldbuilding?.timelineEvents, ['title', 'id']) +
			checkpointScan.counts.timelineEvents,
		themes:
			countEntitySources(worldbuilding?.themes, ['title', 'id']) +
			checkpointScan.counts.themes,
		acceptedCheckpointCharacters: checkpointScan.counts.acceptedCheckpointCharacters,
		acceptedCheckpointPlotThreads: checkpointScan.counts.acceptedCheckpointPlotThreads,
		acceptedCheckpointPremises: checkpointScan.counts.acceptedCheckpointPremises,
	};

	const hasProjectIdentity = Boolean(projectId && projectTitle);
	const hasPremise = Boolean(premise);
	const hasStorySource = sourceCounts.characters + sourceCounts.plotThreads > 0;

	const required: Record<OutlineContextRequiredBand, OutlineContextBandState> = {
		project_identity: makeBandState('project_identity', true, hasProjectIdentity, hasProjectIdentity ? 1 : 0),
		primary_story_premise: makeBandState(
			'primary_story_premise',
			true,
			hasPremise,
			hasPremise ? 1 : 0,
		),
		character_or_plot_thread: makeBandState(
			'character_or_plot_thread',
			true,
			hasStorySource,
			sourceCounts.characters + sourceCounts.plotThreads,
		),
	};

	const enriching: Record<OutlineContextEnrichingBand, OutlineContextBandState> = {
		locations: makeBandState('locations', false, sourceCounts.locations > 0, sourceCounts.locations),
		factions: makeBandState('factions', false, sourceCounts.factions > 0, sourceCounts.factions),
		lore_entries: makeBandState('lore_entries', false, sourceCounts.loreEntries > 0, sourceCounts.loreEntries),
		timeline_events: makeBandState(
			'timeline_events',
			false,
			sourceCounts.timelineEvents > 0,
			sourceCounts.timelineEvents,
		),
		themes: makeBandState('themes', false, sourceCounts.themes > 0, sourceCounts.themes),
	};

	const missing: OutlineContextMissingPrerequisite[] = [];
	if (!hasProjectIdentity) {
		missing.push({
			code: 'project_identity_missing',
			band: 'project_identity',
			message: MISSING_MESSAGES.project_identity_missing,
		});
	}
	if (!hasPremise) {
		missing.push({
			code: 'story_premise_missing',
			band: 'primary_story_premise',
			message: MISSING_MESSAGES.story_premise_missing,
		});
	}
	if (!hasStorySource) {
		missing.push({
			code: 'story_source_missing',
			band: 'character_or_plot_thread',
			message: MISSING_MESSAGES.story_source_missing,
		});
	}

	return {
		ok: missing.length === 0,
		missing,
		warnings,
		summary: {
			project: {
				id: projectId,
				title: projectTitle,
				premise,
			},
			required,
			enriching,
			sourceCounts,
		},
	};
}
