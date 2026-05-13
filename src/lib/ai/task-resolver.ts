import type { AiTask, ContextPolicy, TaskType, UiContext } from './types.js';

interface TaskDefinition {
	taskType: TaskType;
	contextPolicy: ContextPolicy;
	outputFormat: string;
	role: string;
}

const TASK_MAP: Record<string, TaskDefinition> = {
	continue: {
		taskType: 'continue',
		contextPolicy: 'scene_plus_adjacent',
		outputFormat: 'prose',
		role: 'You are a narrative continuation assistant. Match the existing style and tone.',
	},
	rewrite: {
		taskType: 'rewrite',
		contextPolicy: 'scene_only',
		outputFormat: 'prose',
		role: 'You are a prose rewriting assistant. Improve clarity, rhythm, and impact.',
	},
	continuity_check: {
		taskType: 'continuity_check',
		contextPolicy: 'continuity_scope',
		outputFormat: 'structured_issues',
		role: 'You are a story continuity analyst. Identify factual inconsistencies and timeline conflicts.',
	},
	continuity_check_scene: {
		taskType: 'continuity_check',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_issue_list',
		role: 'You are a story continuity analyst reviewing a manuscript for logical inconsistencies.',
	},
	continuity_check_chapter: {
		taskType: 'continuity_check',
		contextPolicy: 'chapter_scope',
		outputFormat: 'json_issue_list',
		role: 'You are a story continuity analyst reviewing a manuscript chapter for logical inconsistencies.',
	},
	edit_developmental: {
		taskType: 'edit',
		contextPolicy: 'chapter_scope',
		outputFormat: 'json_edit_suggestions',
		role: 'You are a developmental editor reviewing a manuscript for structure, pacing, and scene goal clarity.',
	},
	edit_line: {
		taskType: 'edit',
		contextPolicy: 'scene_only',
		outputFormat: 'json_edit_suggestions',
		role: 'You are a line editor improving sentence clarity, word choice, rhythm, and redundancy in a manuscript.',
	},
	edit_proofread: {
		taskType: 'edit',
		contextPolicy: 'scene_only',
		outputFormat: 'json_edit_suggestions',
		role: 'You are a proofreader correcting grammar, punctuation, spelling, and factual consistency.',
	},
	style_check: {
		taskType: 'style_check',
		contextPolicy: 'scene_only',
		outputFormat: 'json_style_deviations',
		role: 'You are a professional manuscript editor analysing prose for stylistic consistency.',
	},
	rewrite_options: {
		taskType: 'rewrite',
		contextPolicy: 'scene_only',
		outputFormat: 'json_rewrite_options',
		role: 'You are a creative writing assistant offering alternative prose for an author to choose from.',
	},
};

const DEFAULT_TASK: TaskDefinition = TASK_MAP['continue'];

export function resolveTask(action: string, uiCtx: UiContext): AiTask {
	const def = TASK_MAP[action] ?? DEFAULT_TASK;
	const targetEntityId = uiCtx.activeSceneId ?? uiCtx.activeChapterId ?? uiCtx.activeProjectId;
	return {
		taskType: def.taskType,
		role: def.role,
		targetEntityId,
		contextPolicy: def.contextPolicy,
		outputFormat: def.outputFormat,
		instruction: uiCtx.instruction,
	};
}
