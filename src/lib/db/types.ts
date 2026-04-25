// Core data model interfaces for Novellum (Dexie schema version 2)

export interface Project {
	id: string;
	title: string;
	coverUrl?: string;
	genre: string;
	logline: string;
	synopsis: string;
	targetWordCount: number;
	status: 'planning' | 'drafting' | 'revising' | 'completed' | 'archived' | string;
	systemPrompt: string;
	negativePrompt: string;
	projectType: 'novel' | 'story' | 'collection';
	lastOpenedAt: string;
	stylePresetId: string;
	createdAt: string; // ISO 8601
	updatedAt: string;
}

export interface Chapter {
	id: string;
	projectId: string;
	title: string;
	order: number;
	summary: string;
	wordCount: number;
	actId?: string;
	arcRefs?: ArcRef[];
	createdAt: string;
	updatedAt: string;
}

export interface Scene {
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
	characterIds: string[];
	locationIds: string[];
	arcRefs?: ArcRef[];
	createdAt: string;
	updatedAt: string;
}

export interface Beat {
	id: string;
	sceneId?: string | null;
	arcId?: string | null;
	projectId: string;
	title: string;
	type: string;
	order: number;
	notes: string;
	createdAt: string;
	updatedAt: string;
}

export interface Stage {
	id: string;
	beatId: string;
	projectId: string;
	title: string;
	description: string;
	order: number;
	status: 'planned' | 'in_progress' | 'completed' | string;
	createdAt: string;
	updatedAt: string;
}

export interface Character {
	id: string;
	projectId: string;
	name: string;
	role: string;
	occupation?: string;
	age?: string;
	height?: string;
	weight?: string;
	build?: string;
	hair?: string;
	eyes?: string;
	coreDesire?: string;
	fear?: string;
	contradiction?: string;
	temperament?: string;
	alignment?: string;
	strength?: string;
	flaw?: string;
	storyRole?: string;
	arcStage?: string;
	externalGoal?: string;
	internalNeed?: string;
	stakes?: string;
	conflict?: string;
	voiceSummary?: string;
	speechPattern?: string;
	phrases?: string;
	tells?: string;
	bodyLanguage?: string;
	dialogueSample?: string;
	immutableTraits?: string;
	injuries?: string;
	habits?: string;
	secrets?: string;
	othersKnow?: string;
	lastChange?: string;
	timelineMarkers?: string;
	emotionalState?: string;
	currentObjective?: string;
	currentPressure?: string;
	lastSeen?: string;
	nextMove?: string;
	pronunciation: string;
	aliases: string[];
	diasporaOrigin: string;
	photoUrl: string;
	bio: string;
	faction: string;
	anomalies: string[];
	traits: string[];
	goals: string[];
	flaws: string[];
	arcs: string[];
	notes: string;
	tags: string[];
	createdAt: string;
	updatedAt: string;
}

export interface CharacterRelationship {
	id: string;
	projectId: string;
	characterAId: string;
	characterBId: string;
	type: string;
	status?: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface Location {
	id: string;
	projectId: string;
	name: string;
	description: string;
	tags: string[];
	kind?: 'realm' | 'landmark' | '';
	realmType?: 'physical' | 'metaphysical' | 'political' | 'hybrid' | '';
	realityRules?: string;
	culturalBaseline?: string;
	powerStructure?: string;
	conflictPressure?: string;
	storyRole?: string;
	tone?: string;
	realmId?: string;
	environment?: string;
	notableFeatures?: string[];
	purpose?: string;
	activityType?: string;
	emotionalTone?: string;
	changeOverTime?: string;
	landmarkIds?: string[];
	factionIds?: string[];
	characterIds?: string[];
	threadIds?: string[];
	createdAt: string;
	updatedAt: string;
}

export interface LoreEntry {
	id: string;
	projectId: string;
	title: string;
	category: string;
	content: string;
	tags: string[];
	createdAt: string;
	updatedAt: string;
}

export interface PlotThread {
	id: string;
	projectId: string;
	title: string;
	description: string;
	status: string;
	relatedSceneIds: string[];
	relatedCharacterIds: string[];
	createdAt: string;
	updatedAt: string;
}

export interface TimelineEvent {
	id: string;
	projectId: string;
	title: string;
	description: string;
	date: string;
	relatedCharacterIds: string[];
	relatedSceneIds: string[];
	/** Discriminator for chronicles surfaces: 'era' (default) | 'key-event'. */
	category?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ConsistencyIssue {
	id: string;
	projectId: string;
	type: 'timeline' | 'character' | 'lore' | 'plot_thread';
	severity: 'warning' | 'error';
	description: string;
	entityIds: string[];
	sceneId: string | null;
	status: 'open' | 'resolved' | 'dismissed';
	createdAt: string;
	updatedAt: string;
}

export interface ExportSettings {
	id: string;
	projectId: string;
	titlePage: boolean;
	chapterStyle: 'heading' | 'chapter_number' | 'both';
	fontFamily: string;
	fontSize: number;
	lineSpacing: number;
	createdAt: string;
	updatedAt: string;
}

export interface SceneSnapshot {
	id: string;
	sceneId: string;
	projectId: string;
	text: string;
	createdAt: string;
}

export interface ArcRef {
	arcId: string;
	arcLabel?: string;
	role?: 'primary' | 'secondary' | 'background';
}

export interface StoryFrame {
	id: string;
	projectId: string;
	premise: string;
	theme: string;
	toneNotes: string;
	updatedAt: string;
}

export interface Act {
	id: string;
	projectId: string;
	arcId?: string;
	title: string;
	order: number;
	planningNotes: string;
	createdAt: string;
	updatedAt: string;
}

export type CoreArcType = 'character' | 'plot' | 'relationship' | 'theme' | 'world';

export type ArcType = CoreArcType | `custom:${string}`;

export type ArcStatus = 'planned' | 'in_progress' | 'complete' | 'on_hold' | 'cut';

export interface Arc {
	id: string;
	projectId: string;
	title: string;
	description: string;
	purpose: string;
	arcType?: ArcType;
	status?: ArcStatus;
	characterIds?: string[];
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface Milestone {
	id: string;
	actId: string;
	projectId: string;
	title: string;
	description: string;
	order: number;
	chapterIds: string[];
	createdAt: string;
	updatedAt: string;
}

export interface Asset {
    id: string;
    projectId: string;
    name: string;
    mimeType: string;
    data: string; // base64
    sizeBytes: number;
    createdAt: string;
    updatedAt: string;
}

export interface WritingStyle {
	id: string;
	projectId: string;
	title: string;
	description: string;
	exampleText: string;
	createdAt: string;
	updatedAt: string;
}

export interface Template {
	id: string;
	projectId: string;
	name: string;
	description: string;
	content: string;
	type: string;
	createdAt: string;
	updatedAt: string;
}

export interface SystemPrompt {
	id: string;
	projectId: string;
	name: string;
	content: string;
	isDefault: number;
	createdAt: string;
	updatedAt: string;
}

export interface ChatInstruction {
	id: string;
	projectId: string;
	name: string;
	content: string;
	isDefault: number;
	createdAt: string;
	updatedAt: string;
}
