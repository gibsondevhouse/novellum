// Outliner module public types
import type { Chapter, Scene } from '$lib/db/domain-types';
import type {
	PipelineHierarchyLayer,
	PipelineHierarchyPath,
} from './services/seven-layer-outline.js';

export type OutlineNodeId = number;

export type ChapterWithScenes = Chapter & { scenes: Scene[] };
export type ChapterWithScenesAndAct = ChapterWithScenes & { actTitle?: string };

/** Focused beat state passed between outline components. */
export type BeatFocus = {
	id: string;
	index: number;
	content: string;
	notes: string;
	onUpdateContent: (content: string) => void;
	onUpdateNotes: (notes: string) => void;
};

/** Discriminated union for outline tree selection. */
export type OutlineSelection =
	| { type: 'chapter'; chapter: Chapter }
	| { type: 'scene'; scene: Scene };

export type { PipelineHierarchyLayer, PipelineHierarchyPath };

export type PipelineHierarchyReadiness = 'empty' | 'partial' | 'ready';
