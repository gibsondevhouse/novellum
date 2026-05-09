// AI pipeline types — version 2

import type {
	Beat,
	Character,
	Chapter,
	Location,
	LoreEntry,
	PlotThread,
	Scene,
	SystemPrompt,
	ChatInstruction,
	WritingStyle
} from '$lib/db/domain-types';
import type { SceneIntentSnapshot } from '$lib/stores/scene-intent.svelte.js';

export type ContextPolicy =
	| 'scene_only'
	| 'scene_plus_adjacent'
	| 'chapter_scope'
	| 'continuity_scope'
	| 'outline_scope';

export type TaskType =
	| 'brainstorm'
	| 'outline'
	| 'draft'
	| 'continue'
	| 'rewrite'
	| 'continuity_check'
	| 'summarize'
	| 'edit'
	| 'style_check';

export type EditMode = 'developmental' | 'line_edit' | 'proofread';

export interface StylePreset {
	id: string;
	name: string;
	description: string;
	rules: string[];
}

export interface StyleDeviation {
	spanStart: number;
	spanEnd: number;
	original: string;
	suggestion: string;
	reason: string;
	presetId: string;
}

export interface RewriteOption {
	index: 1 | 2 | 3;
	text: string;
}

export interface EditSuggestion {
	spanStart: number;
	spanEnd: number;
	original: string;
	suggestion: string;
	reason: string;
	mode: EditMode;
}

export interface UiContext {
	activeProjectId: string | null;
	activeSceneId: string | null;
	activeBeatId: string | null;
	activeChapterId: string | null;
	instruction?: string;
}

export interface AiTask {
	taskType: TaskType;
	role: string;
	targetEntityId: string | null;
	contextPolicy: ContextPolicy;
	outputFormat: string;
	instruction?: string;
}

export interface AiContext {
	policy: ContextPolicy;
	scene: Scene | null;
	adjacentScenes: Scene[];
	chapter: Chapter | null;
	beats: Beat[];
	characters: Character[];
	locations: Location[];
	loreEntries: LoreEntry[];
	plotThreads: PlotThread[];
	systemPrompts?: SystemPrompt[];
	chatInstructions?: ChatInstruction[];
	writingStyles?: WritingStyle[];
	/**
	 * Writer-defined intent + live writing signals for the active scene.
	 * Published by the editor through `$lib/stores/scene-intent`. Lets Nova
	 * answer with awareness of what the writer set out to do, not just the
	 * prose they have produced so far.
	 */
	sceneIntent?: SceneIntentSnapshot;
}

// Legacy types — kept for backward compatibility with existing consumers
export interface AIRequestPayload {
	model: string;
	messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
}

export interface AIResponse {
	text: string;
	model: string;
	tokensUsed: number;
}

export interface RetryConfig {
	maxRetries: number;
	baseDelayMs: number;
}

export interface ContextBundle {
	userPrompt: string;
	chapterText?: string;
	bibleSummary?: string;
	outlineSection?: string;
}
