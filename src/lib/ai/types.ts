// AI pipeline types — version 2

import type {
	Arc,
	Act,
	Beat,
	Character,
	CharacterRelationship,
	Chapter,
	Faction,
	GlossaryTerm,
	Location,
	LoreEntry,
	Milestone,
	PlotThread,
	Project,
	Scene,
	Stage,
	StoryFrame,
	SystemPrompt,
	ChatInstruction,
	Theme,
	TimelineEvent,
	WritingStyle
} from '$lib/db/domain-types';
import type { SceneIntentSnapshot } from '$lib/stores/scene-intent.svelte.js';

export type ContextPolicy =
	| 'scene_only'
	| 'scene_plus_adjacent'
	| 'project_summary'
	| 'chapter_scope'
	| 'continuity_scope'
	| 'outline_scope';

export type TaskType =
	| 'continue'
	| 'rewrite'
	| 'continuity_check'
	| 'edit'
	| 'style_check'
	| 'chat'
	| 'pipeline';

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
	pipelineTask?: PipelineTaskReference;
}

export interface PipelineTaskReference {
	key: string;
	family: 'vibe-worldbuild' | 'vibe-author';
	stage: string;
}

export type PipelineRunState =
	| 'idle'
	| 'ready'
	| 'running'
	| 'completed_pending_checkpoint'
	| 'failed';

export interface ProjectContextCounts {
	chapters: number;
	scenes: number;
	beats: number;
	characters: number;
	characterRelationships: number;
	locations: number;
	loreEntries: number;
	plotThreads: number;
	timelineEvents: number;
	acts: number;
	arcs: number;
	milestones: number;
	writingStyles: number;
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
	project?: Project | null;
	projectCounts?: ProjectContextCounts;
	storyFrames?: StoryFrame[];
	timelineEvents?: TimelineEvent[];
	characterRelationships?: CharacterRelationship[];
	factions?: Faction[];
	themes?: Theme[];
	glossaryTerms?: GlossaryTerm[];
	systemPrompts?: SystemPrompt[];
	chatInstructions?: ChatInstruction[];
	writingStyles?: WritingStyle[];
	templates?: Array<{ type: string; content: string }>;
	/**
	 * Seven-layer outline hierarchy (arcs → acts → milestones → chapters
	 * → scenes → beats → stages). Populated for outline-scope and
	 * vibe-author pipeline tasks so the model can reason across the whole
	 * narrative structure. Optional so legacy task paths remain unchanged.
	 */
	outlineHierarchy?: {
		arcs: Arc[];
		acts: Act[];
		milestones: Milestone[];
		chapters: Chapter[];
		scenes: Scene[];
		beats: Beat[];
		stages: Stage[];
	};
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
