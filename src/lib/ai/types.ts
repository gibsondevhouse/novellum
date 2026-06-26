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
import type { OutlineContextPacket } from './pipeline/outline-context-builder.js';

export type ContextPolicy =
	| 'scene_only'
	| 'scene_plus_adjacent'
	| 'project_summary'
	| 'chapter_scope'
	| 'continuity_scope'
	| 'worldbuilding_scope'
	| 'outline_scope';

export type TaskType =
	| 'continue'
	| 'rewrite'
	| 'continuity_check'
	| 'edit'
	| 'style_check'
	| 'brainstorm'
	| 'chat'
	| 'write'
	| 'agent'
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

export const BRAINSTORM_AGENT_SCHEMA_VERSION = '1.0.0' as const;

export const BRAINSTORM_PROPOSAL_CATEGORIES = [
	'premise_variant',
	'thematic_thread',
	'genre_hook',
	'protagonist_sketch'
] as const;

export const BRAINSTORM_WORLD_BUILD_SEED_TARGETS = [
	'premise_note',
	'character_seed',
	'location_seed',
	'faction_seed',
	'lore_seed',
	'plot_thread_seed',
	'theme_seed'
] as const;

export type BrainstormProposalCategory = (typeof BRAINSTORM_PROPOSAL_CATEGORIES)[number];

export type BrainstormWorldbuildSeedTarget = (typeof BRAINSTORM_WORLD_BUILD_SEED_TARGETS)[number];

export type BrainstormProposalConfidence = 'low' | 'medium' | 'high';

/**
 * Author and project constraints supplied to BrainstormAgent before generation.
 * These hints keep brainstorming bounded to the seed idea and current project
 * direction without sending unrelated manuscript text.
 */
export interface BrainstormAgentContextConstraints {
	projectId?: string;
	projectTitle?: string;
	genre?: string;
	intendedAudience?: string;
	tone?: string;
	existingPremise?: string;
	comparableTitles?: string[];
	mustInclude?: string[];
	avoid?: string[];
	contentWarningsToAvoid?: string[];
}

/**
 * Input contract for a single-shot BrainstormAgent run.
 */
export interface BrainstormAgentRequest {
	/**
	 * The author's raw creative seed. Must be non-empty before the agent is
	 * invoked.
	 */
	seedIdea: string;
	/**
	 * Optional grounding constraints drawn from project metadata or explicit
	 * author controls.
	 */
	context?: BrainstormAgentContextConstraints;
	/**
	 * Optional subset of proposal categories to request. Omitted means the
	 * agent should return all category groups.
	 */
	requestedCategories?: BrainstormProposalCategory[];
	/**
	 * Soft cap per proposal category. The parser and UI still accept empty
	 * lists when the model cannot produce useful seeds for a category.
	 */
	maxProposalsPerCategory?: number;
}

interface BrainstormProposalBase<Category extends BrainstormProposalCategory> {
	/**
	 * Stable model-generated identifier scoped to the session. Used only for UI
	 * selection and accept/reject state; it is not a database primary key.
	 */
	id: string;
	category: Category;
	title: string;
	description: string;
	/**
	 * Short explanation of why the seed fits the request and how an author might
	 * use it.
	 */
	rationale: string;
	confidence?: BrainstormProposalConfidence;
	/**
	 * Optional destination hint for review-gated worldbuilding prefill.
	 */
	worldbuildSeedTarget?: BrainstormWorldbuildSeedTarget;
	/**
	 * Optional promptable question that can drive a later guided brainstorm or
	 * worldbuilding form.
	 */
	storyQuestion?: string;
	tags?: string[];
}

export type BrainstormPremiseVariantProposal = BrainstormProposalBase<'premise_variant'>;
export type BrainstormThematicThreadProposal = BrainstormProposalBase<'thematic_thread'>;
export type BrainstormGenreHookProposal = BrainstormProposalBase<'genre_hook'>;
export type BrainstormProtagonistSketchProposal = BrainstormProposalBase<'protagonist_sketch'>;

/**
 * One reviewable creative seed returned by BrainstormAgent.
 */
export type BrainstormProposal =
	| BrainstormPremiseVariantProposal
	| BrainstormThematicThreadProposal
	| BrainstormGenreHookProposal
	| BrainstormProtagonistSketchProposal;

/**
 * Category-grouped proposal hierarchy used by the parser and future Nova UI.
 */
export interface BrainstormProposalGroups {
	premiseVariants: BrainstormPremiseVariantProposal[];
	thematicThreads: BrainstormThematicThreadProposal[];
	genreHooks: BrainstormGenreHookProposal[];
	protagonistSketches: BrainstormProtagonistSketchProposal[];
}

/**
 * Full BrainstormAgent output contract. Sessions are ephemeral in plan-043;
 * accepted proposals are projected into review-gated worldbuilding prefill
 * state by later stages.
 */
export interface BrainstormSession {
	schemaVersion: typeof BRAINSTORM_AGENT_SCHEMA_VERSION;
	seedIdea: string;
	proposals: BrainstormProposalGroups;
}

const createBrainstormProposalJsonSchema = (category: BrainstormProposalCategory) => ({
	type: 'object',
	additionalProperties: false,
	required: ['id', 'category', 'title', 'description', 'rationale'],
	properties: {
		id: { type: 'string', minLength: 1 },
		category: { type: 'string', const: category },
		title: { type: 'string', minLength: 1, maxLength: 120 },
		description: { type: 'string', minLength: 1, maxLength: 1200 },
		rationale: { type: 'string', minLength: 1, maxLength: 600 },
		confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
		worldbuildSeedTarget: { type: 'string', enum: BRAINSTORM_WORLD_BUILD_SEED_TARGETS },
		storyQuestion: { type: 'string', minLength: 1, maxLength: 300 },
		tags: {
			type: 'array',
			items: { type: 'string', minLength: 1 },
			default: []
		}
	}
});

/**
 * Strict JSON schema for OpenRouter-compatible structured output. It mirrors
 * BrainstormSession and keeps proposal groups explicit so each UI section can
 * render without category inference.
 */
export const BRAINSTORM_AGENT_JSON_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	required: ['schemaVersion', 'seedIdea', 'proposals'],
	properties: {
		schemaVersion: { type: 'string', const: BRAINSTORM_AGENT_SCHEMA_VERSION },
		seedIdea: { type: 'string', minLength: 1 },
		proposals: {
			type: 'object',
			additionalProperties: false,
			required: ['premiseVariants', 'thematicThreads', 'genreHooks', 'protagonistSketches'],
			properties: {
				premiseVariants: {
					type: 'array',
					items: createBrainstormProposalJsonSchema('premise_variant')
				},
				thematicThreads: {
					type: 'array',
					items: createBrainstormProposalJsonSchema('thematic_thread')
				},
				genreHooks: {
					type: 'array',
					items: createBrainstormProposalJsonSchema('genre_hook')
				},
				protagonistSketches: {
					type: 'array',
					items: createBrainstormProposalJsonSchema('protagonist_sketch')
				}
			}
		}
	}
} as const satisfies Record<string, unknown>;

export const BRAINSTORM_AGENT_RESPONSE_FORMAT = {
	type: 'json_schema',
	jsonSchema: {
		name: 'brainstorm_agent_session',
		strict: true,
		schema: BRAINSTORM_AGENT_JSON_SCHEMA
	}
} as const;

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
	family: 'vibe-worldbuild' | 'vibe-worldbuild-domain' | 'vibe-author';
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
	/**
	 * Deterministic project/worldbuilding packet for plan-040 outline generation.
	 * Present for `outline_scope` contexts; excludes full manuscript text.
	 */
	outlineContextPacket?: OutlineContextPacket;
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
