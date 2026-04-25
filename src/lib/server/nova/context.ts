import { decodeJson } from '$lib/server/db/index.js';
import {
	isExplicitlyUnsupportedBinaryAttachment,
	isSupportedTextAttachment,
	NOVA_MAX_FILE_TEXT_CHARS,
} from '$lib/ai/context-files.js';
import type {
	NovaContextFileInput,
	NovaContextIncludedItem,
	NovaContextMode,
	NovaContextRequestPayload,
	NovaContextResponsePayload,
	NovaContextTruncationEntry,
} from '$modules/ai/types.js';
import type Database from 'better-sqlite3';

const DEFAULT_MAX_CONTEXT_CHARS = 100_000;
const FINAL_TRIM_BUFFER = 96;

const MODE_BUDGETS: Record<NovaContextMode, number> = {
	off: 0,
	summary: 12_000,
	targeted: 35_000,
	full: 100_000,
};

interface ContextCaps {
	projectLogline: number;
	projectSynopsis: number;
	chapterSummary: number;
	sceneSummary: number;
	sceneContent: number;
	sceneNotes: number;
	beatNotes: number;
	characterBio: number;
	characterNotes: number;
	locationDescription: number;
	loreContent: number;
	plotDescription: number;
	timelineDescription: number;
	storyFrame: number;
	actPlanningNotes: number;
	arcDescription: number;
	arcPurpose: number;
	milestoneDescription: number;
	writingStyleDescription: number;
	writingStyleExample: number;
	systemPrompt: number;
	chatInstruction: number;
	fileText: number;
}

const BASE_CAPS: ContextCaps = {
	projectLogline: 900,
	projectSynopsis: 1200,
	chapterSummary: 700,
	sceneSummary: 900,
	sceneContent: 4200,
	sceneNotes: 900,
	beatNotes: 800,
	characterBio: 1200,
	characterNotes: 700,
	locationDescription: 1300,
	loreContent: 1400,
	plotDescription: 1200,
	timelineDescription: 1000,
	storyFrame: 1000,
	actPlanningNotes: 900,
	arcDescription: 1100,
	arcPurpose: 700,
	milestoneDescription: 800,
	writingStyleDescription: 700,
	writingStyleExample: 1000,
	systemPrompt: 1200,
	chatInstruction: 1200,
	fileText: NOVA_MAX_FILE_TEXT_CHARS,
};

const COMPRESSED_CAPS: ContextCaps = {
	projectLogline: 450,
	projectSynopsis: 700,
	chapterSummary: 350,
	sceneSummary: 500,
	sceneContent: 1800,
	sceneNotes: 380,
	beatNotes: 320,
	characterBio: 650,
	characterNotes: 320,
	locationDescription: 700,
	loreContent: 800,
	plotDescription: 700,
	timelineDescription: 600,
	storyFrame: 520,
	actPlanningNotes: 420,
	arcDescription: 700,
	arcPurpose: 380,
	milestoneDescription: 420,
	writingStyleDescription: 400,
	writingStyleExample: 560,
	systemPrompt: 680,
	chatInstruction: 680,
	fileText: 24_000,
};

type SqliteLike = Pick<Database.Database, 'prepare'>;

interface ProjectRow {
	id: string;
	title: string;
	genre: string;
	logline: string;
	synopsis: string;
	targetWordCount: number;
	status: string;
	systemPrompt: string;
	negativePrompt: string;
	projectType: string;
	lastOpenedAt: string;
	stylePresetId: string;
	createdAt: string;
	updatedAt: string;
}

interface ChapterRow {
	id: string;
	projectId: string;
	title: string;
	order: number;
	summary: string;
	wordCount: number;
	actId: string | null;
	arcRefs: string;
	createdAt: string;
	updatedAt: string;
}

interface SceneRow {
	id: string;
	chapterId: string;
	projectId: string;
	title: string;
	summary: string;
	povCharacterId: string | null;
	locationId: string | null;
	timelineEventId: string | null;
	order: number;
	content: string;
	wordCount: number;
	notes: string;
	characterIds: string;
	locationIds: string;
	arcRefs: string;
	createdAt: string;
	updatedAt: string;
}

interface BeatRow {
	id: string;
	sceneId: string | null;
	arcId: string | null;
	projectId: string;
	title: string;
	type: string;
	order: number;
	notes: string;
	createdAt: string;
	updatedAt: string;
}

interface CharacterRow {
	id: string;
	projectId: string;
	name: string;
	role: string;
	pronunciation: string;
	aliases: string;
	diasporaOrigin: string;
	photoUrl: string;
	bio: string;
	faction: string;
	anomalies: string;
	traits: string;
	goals: string;
	flaws: string;
	arcs: string;
	notes: string;
	tags: string;
	createdAt: string;
	updatedAt: string;
}

interface CharacterRelationshipRow {
	id: string;
	projectId: string;
	characterAId: string;
	characterBId: string;
	type: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

interface LocationRow {
	id: string;
	projectId: string;
	name: string;
	description: string;
	tags: string;
	kind: string;
	realmType: string;
	realityRules: string;
	culturalBaseline: string;
	powerStructure: string;
	conflictPressure: string;
	storyRole: string;
	tone: string;
	realmId: string;
	environment: string;
	notableFeatures: string;
	purpose: string;
	activityType: string;
	emotionalTone: string;
	changeOverTime: string;
	landmarkIds: string;
	factionIds: string;
	characterIds: string;
	threadIds: string;
	createdAt: string;
	updatedAt: string;
}

interface LoreEntryRow {
	id: string;
	projectId: string;
	title: string;
	category: string;
	content: string;
	tags: string;
	createdAt: string;
	updatedAt: string;
}

interface PlotThreadRow {
	id: string;
	projectId: string;
	title: string;
	description: string;
	status: string;
	relatedSceneIds: string;
	relatedCharacterIds: string;
	createdAt: string;
	updatedAt: string;
}

interface TimelineEventRow {
	id: string;
	projectId: string;
	title: string;
	description: string;
	date: string;
	relatedCharacterIds: string;
	relatedSceneIds: string;
	createdAt: string;
	updatedAt: string;
}

interface StoryFrameRow {
	id: string;
	projectId: string;
	premise: string;
	theme: string;
	toneNotes: string;
	updatedAt: string;
}

interface ActRow {
	id: string;
	projectId: string;
	arcId: string | null;
	title: string;
	order: number;
	planningNotes: string;
	createdAt: string;
	updatedAt: string;
}

interface ArcRow {
	id: string;
	projectId: string;
	title: string;
	description: string;
	purpose: string;
	arcType: string | null;
	status: string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

interface MilestoneRow {
	id: string;
	actId: string;
	projectId: string;
	title: string;
	description: string;
	order: number;
	chapterIds: string;
	createdAt: string;
	updatedAt: string;
}

interface WritingStyleRow {
	id: string;
	projectId: string;
	title: string;
	description: string;
	exampleText: string;
	createdAt: string;
	updatedAt: string;
}

interface SystemPromptRow {
	id: string;
	projectId: string;
	name: string;
	content: string;
	isDefault: number;
	createdAt: string;
	updatedAt: string;
}

interface ChatInstructionRow {
	id: string;
	projectId: string;
	name: string;
	content: string;
	isDefault: number;
	createdAt: string;
	updatedAt: string;
}

interface ProjectGraph {
	project: ProjectRow;
	chapters: ChapterRow[];
	scenes: SceneRow[];
	beats: BeatRow[];
	characters: CharacterRow[];
	characterRelationships: CharacterRelationshipRow[];
	locations: LocationRow[];
	loreEntries: LoreEntryRow[];
	plotThreads: PlotThreadRow[];
	timelineEvents: TimelineEventRow[];
	storyFrames: StoryFrameRow[];
	acts: ActRow[];
	arcs: ArcRow[];
	milestones: MilestoneRow[];
	writingStyles: WritingStyleRow[];
	systemPrompts: SystemPromptRow[];
	chatInstructions: ChatInstructionRow[];
}

interface AcceptedFilesResult {
	accepted: NovaContextFileInput[];
	warnings: string[];
}

interface RenderResult {
	text: string;
	entries: NovaContextTruncationEntry[];
}

interface TruncationCollector {
	push: (entry: NovaContextTruncationEntry) => void;
}

function maybeLine(lines: string[], label: string, value: string): void {
	const trimmed = value.trim();
	if (!trimmed) return;
	lines.push(`- ${label}: ${trimmed}`);
}

function decodeStringArray(raw: string): string[] {
	return decodeJson<string[]>(raw);
}

function decodeArcRefs(raw: string): string {
	const refs = decodeJson<Array<{ arcId: string; arcLabel?: string; role?: string }>>(raw);
	if (refs.length === 0) return 'none';
	return refs
		.map((ref) => {
			const role = ref.role ? ` (${ref.role})` : '';
			const label = ref.arcLabel ? ` ${ref.arcLabel}` : '';
			return `${ref.arcId}${label}${role}`;
		})
		.join(', ');
}

function formatList(values: string[]): string {
	return values.length > 0 ? values.join(', ') : 'none';
}

function normalizeLineBreaks(value: string): string {
	return value.replace(/\r\n/g, '\n');
}

function truncateValue(
	value: string,
	maxChars: number,
	source: 'project' | 'file',
	sourceId: string,
	field: string,
	collector: TruncationCollector | null,
): string {
	const normalized = normalizeLineBreaks(value).trim();
	if (!normalized) return '';
	if (normalized.length <= maxChars) return normalized;

	const marker = `\n[Truncated from ${normalized.length} chars]`;
	const sliceMax = Math.max(0, maxChars - marker.length);
	const nextValue = `${normalized.slice(0, sliceMax).trimEnd()}${marker}`;

	collector?.push({
		source,
		sourceId,
		field,
		beforeChars: normalized.length,
		afterChars: nextValue.length,
	});

	return nextValue;
}

function selectAll<T>(database: SqliteLike, sql: string, parameter: string): T[] {
	return database.prepare(sql).all(parameter) as T[];
}

function getProjectGraph(database: SqliteLike, projectId: string): ProjectGraph | null {
	const project = database.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as
		| ProjectRow
		| undefined;
	if (!project) return null;

	return {
		project,
		chapters: selectAll<ChapterRow>(
			database,
			'SELECT * FROM chapters WHERE projectId = ? ORDER BY "order" ASC, createdAt ASC',
			projectId,
		),
		scenes: selectAll<SceneRow>(
			database,
			'SELECT * FROM scenes WHERE projectId = ? ORDER BY chapterId ASC, "order" ASC, createdAt ASC',
			projectId,
		),
		beats: selectAll<BeatRow>(
			database,
			'SELECT * FROM beats WHERE projectId = ? ORDER BY "order" ASC, createdAt ASC',
			projectId,
		),
		characters: selectAll<CharacterRow>(
			database,
			'SELECT * FROM characters WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		characterRelationships: selectAll<CharacterRelationshipRow>(
			database,
			'SELECT * FROM character_relationships WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		locations: selectAll<LocationRow>(
			database,
			'SELECT * FROM locations WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		loreEntries: selectAll<LoreEntryRow>(
			database,
			'SELECT * FROM lore_entries WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		plotThreads: selectAll<PlotThreadRow>(
			database,
			'SELECT * FROM plot_threads WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		timelineEvents: selectAll<TimelineEventRow>(
			database,
			'SELECT * FROM timeline_events WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		storyFrames: selectAll<StoryFrameRow>(
			database,
			'SELECT * FROM story_frames WHERE projectId = ? ORDER BY updatedAt DESC',
			projectId,
		),
		acts: selectAll<ActRow>(
			database,
			'SELECT * FROM acts WHERE projectId = ? ORDER BY "order" ASC, createdAt ASC',
			projectId,
		),
		arcs: selectAll<ArcRow>(
			database,
			'SELECT * FROM arcs WHERE projectId = ? ORDER BY "order" ASC, createdAt ASC',
			projectId,
		),
		milestones: selectAll<MilestoneRow>(
			database,
			'SELECT * FROM milestones WHERE projectId = ? ORDER BY "order" ASC, createdAt ASC',
			projectId,
		),
		writingStyles: selectAll<WritingStyleRow>(
			database,
			'SELECT * FROM writing_styles WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		systemPrompts: selectAll<SystemPromptRow>(
			database,
			'SELECT * FROM system_prompts WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
		chatInstructions: selectAll<ChatInstructionRow>(
			database,
			'SELECT * FROM chat_instructions WHERE projectId = ? ORDER BY createdAt ASC',
			projectId,
		),
	};
}

function toPositiveInt(value: unknown): number {
	if (typeof value !== 'number') return 0;
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.floor(value));
}

function acceptFiles(files: NovaContextFileInput[]): AcceptedFilesResult {
	const warnings: string[] = [];
	const accepted: NovaContextFileInput[] = [];

	for (const file of files) {
		const fileRef = file.name ? `"${file.name}"` : 'a file';
		if (!isSupportedTextAttachment(file)) {
			if (isExplicitlyUnsupportedBinaryAttachment(file)) {
				warnings.push(`${fileRef} is not supported yet. Use text, markdown, JSON, or CSV for now.`);
			} else {
				warnings.push(`${fileRef} is not a supported text attachment and was skipped.`);
			}
			continue;
		}

		if (!file.text?.trim()) {
			warnings.push(`${fileRef} is empty and was skipped.`);
			continue;
		}

		accepted.push({
			id: file.id,
			name: file.name.trim(),
			mimeType: file.mimeType.trim(),
			sizeBytes: toPositiveInt(file.sizeBytes),
			text: normalizeLineBreaks(file.text),
		});
	}

	return { accepted, warnings };
}

interface AppendProjectBlockOptions {
	scopes?: ReadonlySet<string>;
	entityHints?: string[];
}

function filterByHints<T>(
	rows: T[],
	hints: string[],
	extract: (row: T) => Array<string | null | undefined>,
): T[] {
	if (hints.length === 0) return rows;
	const lcHints = hints.map((h) => h.toLowerCase()).filter(Boolean);
	if (lcHints.length === 0) return rows;
	const filtered = rows.filter((row) => {
		const haystack = extract(row)
			.filter((value): value is string => Boolean(value))
			.map((value) => value.toLowerCase());
		return lcHints.some((hint) => haystack.some((value) => value.includes(hint)));
	});
	return filtered.length > 0 ? filtered : rows;
}

function appendProjectBlock(
	lines: string[],
	graph: ProjectGraph,
	caps: ContextCaps,
	collector: TruncationCollector | null,
	options: AppendProjectBlockOptions = {},
): void {
	const projectId = graph.project.id;
	const scopes = options.scopes;
	const entityHints = options.entityHints ?? [];
	const inScope = (...names: string[]): boolean =>
		!scopes || names.some((name) => scopes.has(name));

	lines.push(`# Project: ${graph.project.title}`);
	lines.push(`- id: ${projectId}`);
	maybeLine(lines, 'genre', graph.project.genre);
	maybeLine(lines, 'status', graph.project.status);
	maybeLine(lines, 'projectType', graph.project.projectType);
	if (graph.project.targetWordCount > 0) {
		lines.push(`- targetWordCount: ${graph.project.targetWordCount}`);
	}
	maybeLine(
		lines,
		'logline',
		truncateValue(graph.project.logline, caps.projectLogline, 'project', projectId, 'project.logline', collector),
	);
	maybeLine(
		lines,
		'synopsis',
		truncateValue(graph.project.synopsis, caps.projectSynopsis, 'project', projectId, 'project.synopsis', collector),
	);
	maybeLine(lines, 'stylePresetId', graph.project.stylePresetId);
	maybeLine(lines, 'lastOpenedAt', graph.project.lastOpenedAt);
	maybeLine(lines, 'updatedAt', graph.project.updatedAt);

	if (inScope('chapters', 'manuscript')) {
	const chapterRows = filterByHints(graph.chapters, entityHints, (row) => [row.title]);
	lines.push(`## Chapters (${chapterRows.length})`);
	for (const chapter of chapterRows) {
		const chapterSummary = truncateValue(
			chapter.summary,
			caps.chapterSummary,
			'project',
			projectId,
			`chapter:${chapter.id}.summary`,
			collector,
		);
		lines.push(
			`- [${chapter.id}] order=${chapter.order} title="${chapter.title}" wordCount=${chapter.wordCount} actId=${chapter.actId ?? 'none'} arcRefs=${decodeArcRefs(chapter.arcRefs)}`,
		);
		if (chapterSummary) lines.push(`  summary: ${chapterSummary}`);
	}
	}

	if (inScope('scenes', 'manuscript')) {
	const sceneRows = filterByHints(graph.scenes, entityHints, (row) => [row.title]);
	lines.push(`## Scenes (${sceneRows.length})`);
	for (const scene of sceneRows) {
		const sceneSummary = truncateValue(
			scene.summary,
			caps.sceneSummary,
			'project',
			projectId,
			`scene:${scene.id}.summary`,
			collector,
		);
		const sceneContent = truncateValue(
			scene.content,
			caps.sceneContent,
			'project',
			projectId,
			`scene:${scene.id}.content`,
			collector,
		);
		const sceneNotes = truncateValue(
			scene.notes,
			caps.sceneNotes,
			'project',
			projectId,
			`scene:${scene.id}.notes`,
			collector,
		);
		lines.push(
			`- [${scene.id}] chapterId=${scene.chapterId} order=${scene.order} title="${scene.title}" wordCount=${scene.wordCount} pov=${scene.povCharacterId ?? 'none'} location=${scene.locationId ?? 'none'} timeline=${scene.timelineEventId ?? 'none'}`,
		);
		lines.push(`  characterIds: ${formatList(decodeStringArray(scene.characterIds))}`);
		lines.push(`  locationIds: ${formatList(decodeStringArray(scene.locationIds))}`);
		lines.push(`  arcRefs: ${decodeArcRefs(scene.arcRefs)}`);
		if (sceneSummary) lines.push(`  summary: ${sceneSummary}`);
		if (sceneNotes) lines.push(`  notes: ${sceneNotes}`);
		if (sceneContent) lines.push(`  content: ${sceneContent}`);
	}
	}

	if (inScope('beats', 'scenes', 'manuscript')) {
	const beatRows = filterByHints(graph.beats, entityHints, (row) => [row.title]);
	lines.push(`## Beats (${beatRows.length})`);
	for (const beat of beatRows) {
		const beatNotes = truncateValue(
			beat.notes,
			caps.beatNotes,
			'project',
			projectId,
			`beat:${beat.id}.notes`,
			collector,
		);
		lines.push(
			`- [${beat.id}] order=${beat.order} title="${beat.title}" type=${beat.type || 'n/a'} sceneId=${beat.sceneId ?? 'none'} arcId=${beat.arcId ?? 'none'}`,
		);
		if (beatNotes) lines.push(`  notes: ${beatNotes}`);
	}
	}

	if (inScope('characters')) {
	const characterRows = filterByHints(graph.characters, entityHints, (row) => [
		row.name,
		...decodeStringArray(row.aliases),
		...decodeStringArray(row.tags),
	]);
	lines.push(`## Characters (${characterRows.length})`);
	for (const character of characterRows) {
		const bio = truncateValue(
			character.bio,
			caps.characterBio,
			'project',
			projectId,
			`character:${character.id}.bio`,
			collector,
		);
		const notes = truncateValue(
			character.notes,
			caps.characterNotes,
			'project',
			projectId,
			`character:${character.id}.notes`,
			collector,
		);
		lines.push(
			`- [${character.id}] name="${character.name}" role=${character.role || 'n/a'} faction=${character.faction || 'none'} pronunciation=${character.pronunciation || 'n/a'} diasporaOrigin=${character.diasporaOrigin || 'n/a'}`,
		);
		lines.push(`  aliases: ${formatList(decodeStringArray(character.aliases))}`);
		lines.push(`  traits: ${formatList(decodeStringArray(character.traits))}`);
		lines.push(`  goals: ${formatList(decodeStringArray(character.goals))}`);
		lines.push(`  flaws: ${formatList(decodeStringArray(character.flaws))}`);
		lines.push(`  arcs: ${formatList(decodeStringArray(character.arcs))}`);
		lines.push(`  anomalies: ${formatList(decodeStringArray(character.anomalies))}`);
		lines.push(`  tags: ${formatList(decodeStringArray(character.tags))}`);
		if (bio) lines.push(`  bio: ${bio}`);
		if (notes) lines.push(`  notes: ${notes}`);
	}

	lines.push(`## Character Relationships (${graph.characterRelationships.length})`);
	for (const relation of graph.characterRelationships) {
		lines.push(
			`- [${relation.id}] ${relation.characterAId} -> ${relation.characterBId} type="${relation.type || 'n/a'}" description="${relation.description || ''}"`,
		);
	}
	}

	if (inScope('worldbuilding')) {
	const locationRows = filterByHints(graph.locations, entityHints, (row) => [
		row.name,
		...decodeStringArray(row.tags),
	]);
	lines.push(`## Locations (${locationRows.length})`);
	for (const location of locationRows) {
		const description = truncateValue(
			location.description,
			caps.locationDescription,
			'project',
			projectId,
			`location:${location.id}.description`,
			collector,
		);
		lines.push(
			`- [${location.id}] name="${location.name}" kind=${location.kind || 'n/a'} realmType=${location.realmType || 'n/a'} realmId=${location.realmId || 'none'} tone=${location.tone || 'n/a'}`,
		);
		lines.push(`  tags: ${formatList(decodeStringArray(location.tags))}`);
		lines.push(`  notableFeatures: ${formatList(decodeStringArray(location.notableFeatures))}`);
		lines.push(`  landmarkIds: ${formatList(decodeStringArray(location.landmarkIds))}`);
		lines.push(`  factionIds: ${formatList(decodeStringArray(location.factionIds))}`);
		lines.push(`  characterIds: ${formatList(decodeStringArray(location.characterIds))}`);
		lines.push(`  threadIds: ${formatList(decodeStringArray(location.threadIds))}`);
		maybeLine(lines, '  realityRules', location.realityRules);
		maybeLine(lines, '  culturalBaseline', location.culturalBaseline);
		maybeLine(lines, '  powerStructure', location.powerStructure);
		maybeLine(lines, '  conflictPressure', location.conflictPressure);
		maybeLine(lines, '  storyRole', location.storyRole);
		maybeLine(lines, '  environment', location.environment);
		maybeLine(lines, '  purpose', location.purpose);
		maybeLine(lines, '  activityType', location.activityType);
		maybeLine(lines, '  emotionalTone', location.emotionalTone);
		maybeLine(lines, '  changeOverTime', location.changeOverTime);
		if (description) lines.push(`  description: ${description}`);
	}
	}

	if (inScope('lore')) {
	const loreRows = filterByHints(graph.loreEntries, entityHints, (row) => [
		row.title,
		...decodeStringArray(row.tags),
	]);
	lines.push(`## Lore Entries (${loreRows.length})`);
	for (const lore of loreRows) {
		const content = truncateValue(
			lore.content,
			caps.loreContent,
			'project',
			projectId,
			`lore:${lore.id}.content`,
			collector,
		);
		lines.push(`- [${lore.id}] category=${lore.category || 'n/a'} title="${lore.title}"`);
		lines.push(`  tags: ${formatList(decodeStringArray(lore.tags))}`);
		if (content) lines.push(`  content: ${content}`);
	}
	}

	if (inScope('arcs')) {
	const threadRows = filterByHints(graph.plotThreads, entityHints, (row) => [row.title]);
	lines.push(`## Plot Threads (${threadRows.length})`);
	for (const thread of threadRows) {
		const description = truncateValue(
			thread.description,
			caps.plotDescription,
			'project',
			projectId,
			`plotThread:${thread.id}.description`,
			collector,
		);
		lines.push(`- [${thread.id}] status=${thread.status || 'n/a'} title="${thread.title}"`);
		lines.push(`  relatedSceneIds: ${formatList(decodeStringArray(thread.relatedSceneIds))}`);
		lines.push(`  relatedCharacterIds: ${formatList(decodeStringArray(thread.relatedCharacterIds))}`);
		if (description) lines.push(`  description: ${description}`);
	}
	}

	if (inScope('timeline')) {
	const timelineRows = filterByHints(graph.timelineEvents, entityHints, (row) => [row.title]);
	lines.push(`## Timeline Events (${timelineRows.length})`);
	for (const event of timelineRows) {
		const description = truncateValue(
			event.description,
			caps.timelineDescription,
			'project',
			projectId,
			`timelineEvent:${event.id}.description`,
			collector,
		);
		lines.push(`- [${event.id}] date=${event.date || 'n/a'} title="${event.title}"`);
		lines.push(`  relatedSceneIds: ${formatList(decodeStringArray(event.relatedSceneIds))}`);
		lines.push(`  relatedCharacterIds: ${formatList(decodeStringArray(event.relatedCharacterIds))}`);
		if (description) lines.push(`  description: ${description}`);
	}
	}

	if (inScope('outline')) {
	lines.push(`## Story Frames (${graph.storyFrames.length})`);
	for (const frame of graph.storyFrames) {
		const premise = truncateValue(
			frame.premise,
			caps.storyFrame,
			'project',
			projectId,
			`storyFrame:${frame.id}.premise`,
			collector,
		);
		const theme = truncateValue(
			frame.theme,
			caps.storyFrame,
			'project',
			projectId,
			`storyFrame:${frame.id}.theme`,
			collector,
		);
		const toneNotes = truncateValue(
			frame.toneNotes,
			caps.storyFrame,
			'project',
			projectId,
			`storyFrame:${frame.id}.toneNotes`,
			collector,
		);
		lines.push(`- [${frame.id}] updatedAt=${frame.updatedAt}`);
		if (premise) lines.push(`  premise: ${premise}`);
		if (theme) lines.push(`  theme: ${theme}`);
		if (toneNotes) lines.push(`  toneNotes: ${toneNotes}`);
	}
	}

	if (inScope('arcs')) {
	const actRows = filterByHints(graph.acts, entityHints, (row) => [row.title]);
	lines.push(`## Acts (${actRows.length})`);
	for (const act of actRows) {
		const planningNotes = truncateValue(
			act.planningNotes,
			caps.actPlanningNotes,
			'project',
			projectId,
			`act:${act.id}.planningNotes`,
			collector,
		);
		lines.push(
			`- [${act.id}] order=${act.order} title="${act.title}" arcId=${act.arcId ?? 'none'} updatedAt=${act.updatedAt}`,
		);
		if (planningNotes) lines.push(`  planningNotes: ${planningNotes}`);
	}
	const arcRows = filterByHints(graph.arcs, entityHints, (row) => [row.title]);
	lines.push(`## Arcs (${arcRows.length})`);
	for (const arc of arcRows) {
		const description = truncateValue(
			arc.description,
			caps.arcDescription,
			'project',
			projectId,
			`arc:${arc.id}.description`,
			collector,
		);
		const purpose = truncateValue(
			arc.purpose,
			caps.arcPurpose,
			'project',
			projectId,
			`arc:${arc.id}.purpose`,
			collector,
		);
		lines.push(
			`- [${arc.id}] order=${arc.order} title="${arc.title}" type=${arc.arcType ?? 'n/a'} status=${arc.status || 'n/a'}`,
		);
		if (purpose) lines.push(`  purpose: ${purpose}`);
		if (description) lines.push(`  description: ${description}`);
	}
	const milestoneRows = filterByHints(graph.milestones, entityHints, (row) => [row.title]);
	lines.push(`## Milestones (${milestoneRows.length})`);
	for (const milestone of milestoneRows) {
		const description = truncateValue(
			milestone.description,
			caps.milestoneDescription,
			'project',
			projectId,
			`milestone:${milestone.id}.description`,
			collector,
		);
		lines.push(
			`- [${milestone.id}] actId=${milestone.actId} order=${milestone.order} title="${milestone.title}"`,
		);
		lines.push(`  chapterIds: ${formatList(decodeStringArray(milestone.chapterIds))}`);
		if (description) lines.push(`  description: ${description}`);
	}
	}

	if (inScope('style')) {
	const styleRows = filterByHints(graph.writingStyles, entityHints, (row) => [row.title]);
	lines.push(`## Writing Styles (${styleRows.length})`);
	for (const style of styleRows) {
		const description = truncateValue(
			style.description,
			caps.writingStyleDescription,
			'project',
			projectId,
			`writingStyle:${style.id}.description`,
			collector,
		);
		const exampleText = truncateValue(
			style.exampleText,
			caps.writingStyleExample,
			'project',
			projectId,
			`writingStyle:${style.id}.exampleText`,
			collector,
		);
		lines.push(`- [${style.id}] title="${style.title}"`);
		if (description) lines.push(`  description: ${description}`);
		if (exampleText) lines.push(`  exampleText: ${exampleText}`);
	}
	}

	if (!scopes) {
	lines.push(`## System Prompts (${graph.systemPrompts.length})`);
	for (const prompt of graph.systemPrompts) {
		const content = truncateValue(
			prompt.content,
			caps.systemPrompt,
			'project',
			projectId,
			`systemPrompt:${prompt.id}.content`,
			collector,
		);
		lines.push(`- [${prompt.id}] name="${prompt.name}" default=${prompt.isDefault ? 'yes' : 'no'}`);
		if (content) lines.push(`  content: ${content}`);
	}

	lines.push(`## Chat Instructions (${graph.chatInstructions.length})`);
	for (const instruction of graph.chatInstructions) {
		const content = truncateValue(
			instruction.content,
			caps.chatInstruction,
			'project',
			projectId,
			`chatInstruction:${instruction.id}.content`,
			collector,
		);
		lines.push(
			`- [${instruction.id}] name="${instruction.name}" default=${instruction.isDefault ? 'yes' : 'no'}`,
		);
		if (content) lines.push(`  content: ${content}`);
	}
	}

	lines.push('');
}

function appendProjectSummaryBlock(
	lines: string[],
	graph: ProjectGraph,
	caps: ContextCaps,
	collector: TruncationCollector | null,
): void {
	const projectId = graph.project.id;
	lines.push(`# Project Summary: ${graph.project.title}`);
	lines.push(`- id: ${projectId}`);
	maybeLine(lines, 'genre', graph.project.genre);
	maybeLine(lines, 'status', graph.project.status);
	maybeLine(lines, 'projectType', graph.project.projectType);
	if (graph.project.targetWordCount > 0) {
		lines.push(`- targetWordCount: ${graph.project.targetWordCount}`);
	}
	maybeLine(
		lines,
		'logline',
		truncateValue(graph.project.logline, caps.projectLogline, 'project', projectId, 'project.logline', collector),
	);
	maybeLine(
		lines,
		'synopsis',
		truncateValue(graph.project.synopsis, caps.projectSynopsis, 'project', projectId, 'project.synopsis', collector),
	);
	maybeLine(lines, 'updatedAt', graph.project.updatedAt);

	lines.push(`## Counts`);
	lines.push(`- chapters: ${graph.chapters.length}`);
	lines.push(`- scenes: ${graph.scenes.length}`);
	lines.push(`- beats: ${graph.beats.length}`);
	lines.push(`- characters: ${graph.characters.length}`);
	lines.push(`- characterRelationships: ${graph.characterRelationships.length}`);
	lines.push(`- locations: ${graph.locations.length}`);
	lines.push(`- loreEntries: ${graph.loreEntries.length}`);
	lines.push(`- plotThreads: ${graph.plotThreads.length}`);
	lines.push(`- timelineEvents: ${graph.timelineEvents.length}`);
	lines.push(`- acts: ${graph.acts.length}`);
	lines.push(`- arcs: ${graph.arcs.length}`);
	lines.push(`- milestones: ${graph.milestones.length}`);
	lines.push(`- writingStyles: ${graph.writingStyles.length}`);

	const frame = graph.storyFrames[0];
	if (frame) {
		lines.push(`## Story Frame`);
		const premise = truncateValue(frame.premise, caps.storyFrame, 'project', projectId, `storyFrame:${frame.id}.premise`, collector);
		const theme = truncateValue(frame.theme, caps.storyFrame, 'project', projectId, `storyFrame:${frame.id}.theme`, collector);
		const toneNotes = truncateValue(frame.toneNotes, caps.storyFrame, 'project', projectId, `storyFrame:${frame.id}.toneNotes`, collector);
		if (premise) lines.push(`- premise: ${premise}`);
		if (theme) lines.push(`- theme: ${theme}`);
		if (toneNotes) lines.push(`- toneNotes: ${toneNotes}`);
	}

	lines.push('');
}

function appendFileBlocks(
	lines: string[],
	files: NovaContextFileInput[],
	caps: ContextCaps,
	collector: TruncationCollector | null,
): void {
	if (files.length === 0) return;
	lines.push('# Attached Files');
	for (const file of files) {
		lines.push(
			`## File: ${file.name} (id=${file.id}, mimeType=${file.mimeType || 'unknown'}, sizeBytes=${file.sizeBytes})`,
		);
		lines.push(
			truncateValue(file.text, caps.fileText, 'file', file.id, `file:${file.id}.text`, collector),
		);
		lines.push('');
	}
}

function renderContextText(
	graphs: ProjectGraph[],
	files: NovaContextFileInput[],
	caps: ContextCaps,
	options: {
		mode?: NovaContextMode;
		scopes?: ReadonlySet<string>;
		entityHints?: string[];
	} = {},
): RenderResult {
	const entries: NovaContextTruncationEntry[] = [];
	const collector: TruncationCollector = {
		push: (entry) => entries.push(entry),
	};
	const lines: string[] = [];
	const mode = options.mode ?? 'full';
	for (const graph of graphs) {
		if (mode === 'summary') {
			appendProjectSummaryBlock(lines, graph, caps, collector);
		} else if (mode === 'targeted') {
			appendProjectBlock(lines, graph, caps, collector, {
				scopes: options.scopes,
				entityHints: options.entityHints,
			});
		} else {
			appendProjectBlock(lines, graph, caps, collector);
		}
	}
	appendFileBlocks(lines, files, caps, collector);

	return {
		text: lines.join('\n').trim(),
		entries,
	};
}

export function buildNovaContext(
	database: SqliteLike,
	payload: NovaContextRequestPayload,
	options?: { maxContextChars?: number },
): NovaContextResponsePayload {
	const mode: NovaContextMode = payload.mode ?? 'full';
	const modeBudget = MODE_BUDGETS[mode] ?? DEFAULT_MAX_CONTEXT_CHARS;
	const maxContextChars = options?.maxContextChars ?? modeBudget;
	const warnings: string[] = [];

	const scopes =
		mode === 'targeted' && payload.requestedScopes && payload.requestedScopes.length > 0
			? new Set(payload.requestedScopes)
			: undefined;
	const entityHints = mode === 'targeted' ? payload.entityHints ?? [] : [];

	const normalizedProjectIds = [...new Set(payload.projectIds.map((id) => id.trim()).filter(Boolean))];
	const { accepted: acceptedFiles, warnings: fileWarnings } = acceptFiles(payload.files);
	warnings.push(...fileWarnings);

	const includedItems: NovaContextIncludedItem[] = [];
	const projectGraphs: ProjectGraph[] = [];
	for (const projectId of normalizedProjectIds) {
		const graph = getProjectGraph(database, projectId);
		if (!graph) {
			warnings.push(`Project "${projectId}" was not found and was skipped.`);
			continue;
		}
		projectGraphs.push(graph);
		includedItems.push({
			kind: 'project',
			projectId: graph.project.id,
			label: graph.project.title,
		});
	}

	for (const file of acceptedFiles) {
		includedItems.push({
			kind: 'file',
			id: file.id,
			name: file.name,
			mimeType: file.mimeType,
			sizeBytes: file.sizeBytes,
		});
	}

	const raw = renderContextText(projectGraphs, acceptedFiles, {
		...BASE_CAPS,
		fileText: Number.MAX_SAFE_INTEGER,
		sceneContent: Number.MAX_SAFE_INTEGER,
		characterBio: Number.MAX_SAFE_INTEGER,
		characterNotes: Number.MAX_SAFE_INTEGER,
		locationDescription: Number.MAX_SAFE_INTEGER,
		loreContent: Number.MAX_SAFE_INTEGER,
		plotDescription: Number.MAX_SAFE_INTEGER,
		timelineDescription: Number.MAX_SAFE_INTEGER,
		systemPrompt: Number.MAX_SAFE_INTEGER,
		chatInstruction: Number.MAX_SAFE_INTEGER,
		writingStyleExample: Number.MAX_SAFE_INTEGER,
		projectSynopsis: Number.MAX_SAFE_INTEGER,
		projectLogline: Number.MAX_SAFE_INTEGER,
		chapterSummary: Number.MAX_SAFE_INTEGER,
		sceneSummary: Number.MAX_SAFE_INTEGER,
		sceneNotes: Number.MAX_SAFE_INTEGER,
		beatNotes: Number.MAX_SAFE_INTEGER,
		storyFrame: Number.MAX_SAFE_INTEGER,
		actPlanningNotes: Number.MAX_SAFE_INTEGER,
		arcDescription: Number.MAX_SAFE_INTEGER,
		arcPurpose: Number.MAX_SAFE_INTEGER,
		milestoneDescription: Number.MAX_SAFE_INTEGER,
		writingStyleDescription: Number.MAX_SAFE_INTEGER,
	}, { mode, scopes, entityHints });

	let compressionPasses = 0;
	let rendered = renderContextText(projectGraphs, acceptedFiles, BASE_CAPS, { mode, scopes, entityHints });
	if (rendered.text.length > maxContextChars) {
		compressionPasses = 1;
		rendered = renderContextText(projectGraphs, acceptedFiles, COMPRESSED_CAPS, { mode, scopes, entityHints });
	}

	let finalHardTrimApplied = false;
	let contextText = rendered.text;
	const finalEntries = [...rendered.entries];
	if (contextText.length > maxContextChars) {
		finalHardTrimApplied = true;
		const before = contextText.length;
		const slice = Math.max(0, maxContextChars - FINAL_TRIM_BUFFER);
		contextText = `${contextText.slice(0, slice).trimEnd()}\n\n[Context hard-trimmed to fit token budget]`;
		finalEntries.push({
			source: 'project',
			sourceId: 'global',
			field: 'context.hardTrim',
			beforeChars: before,
			afterChars: contextText.length,
		});
	}

	if (compressionPasses > 0) {
		warnings.push('Context exceeded the standard budget and was compressed before sending.');
	}
	if (finalHardTrimApplied) {
		warnings.push('Context still exceeded limits after compression and was hard-trimmed.');
	}

	return {
		contextText,
		includedItems,
		truncationReport: {
			maxChars: maxContextChars,
			totalCharsBefore: raw.text.length,
			totalCharsAfter: contextText.length,
			compressionPasses,
			finalHardTrimApplied,
			entries: finalEntries,
		},
		warnings: [...new Set(warnings)],
	};
}
