// Core data model interfaces for Novellum (Dexie schema version 2)

export interface Project {
	id: string;
	title: string;
	coverUrl?: string;
	genre: string;
	logline: string;
	synopsis: string;
	targetWordCount: number;
	status: string;
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
	characterIds: string[];
	locationIds: string[];
	arcRefs?: ArcRef[];
	createdAt: string;
	updatedAt: string;
}

export interface Beat {
	id: string;
	sceneId: string;
	projectId: string;
	title: string;
	type: string;
	order: number;
	notes: string;
	createdAt: string;
	updatedAt: string;
}

export interface Character {
	id: string;
	projectId: string;
	name: string;
	role: string;
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
	title: string;
	order: number;
	planningNotes: string;
	createdAt: string;
	updatedAt: string;
}

export type ArcType = 'character' | 'plot' | 'relationship' | 'thematic' | 'world';

export interface Arc {
	id: string;
	projectId: string;
	title: string;
	description: string;
	purpose: string;
	arcType?: ArcType;
	order: number;
	createdAt: string;
	updatedAt: string;
}
