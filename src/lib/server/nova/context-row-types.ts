// Internal SQLite row shapes for the Nova context graph builder.
// These mirror the database schema and are not exported outside the nova server layer.

export interface ProjectRow {
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

export interface ChapterRow {
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

export interface SceneRow {
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

export interface BeatRow {
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

export interface CharacterRow {
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

export interface CharacterRelationshipRow {
	id: string;
	projectId: string;
	characterAId: string;
	characterBId: string;
	type: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface LocationRow {
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

export interface LoreEntryRow {
	id: string;
	projectId: string;
	title: string;
	category: string;
	content: string;
	tags: string;
	createdAt: string;
	updatedAt: string;
}

export interface PlotThreadRow {
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

export interface TimelineEventRow {
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

export interface StoryFrameRow {
	id: string;
	projectId: string;
	premise: string;
	theme: string;
	toneNotes: string;
	updatedAt: string;
}

export interface ActRow {
	id: string;
	projectId: string;
	arcId: string | null;
	title: string;
	order: number;
	planningNotes: string;
	createdAt: string;
	updatedAt: string;
}

export interface ArcRow {
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

export interface MilestoneRow {
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

export interface WritingStyleRow {
	id: string;
	projectId: string;
	title: string;
	description: string;
	exampleText: string;
	createdAt: string;
	updatedAt: string;
}

export interface SystemPromptRow {
	id: string;
	projectId: string;
	name: string;
	content: string;
	isDefault: number;
	createdAt: string;
	updatedAt: string;
}

export interface ChatInstructionRow {
	id: string;
	projectId: string;
	name: string;
	content: string;
	isDefault: number;
	createdAt: string;
	updatedAt: string;
}

export interface ProjectGraph {
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
