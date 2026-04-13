import type { TaskType } from './types.js';

// Default model per task type — configurable, not hardcoded logic
const MODEL_MAP: Record<TaskType, string> = {
	brainstorm: 'openai/gpt-4o-mini',
	outline: 'openai/gpt-4o-mini',
	draft: 'openai/gpt-4o-mini',
	continue: 'openai/gpt-4o-mini',
	rewrite: 'openai/gpt-4o',
	continuity_check: 'openai/gpt-4o',
	summarize: 'openai/gpt-4o-mini',
	edit: 'openai/gpt-4o',
	style_check: 'openai/gpt-4o',
};

const DEFAULT_MODEL = 'openai/gpt-4o-mini';

export function selectModel(taskType: TaskType): string {
	return MODEL_MAP[taskType] ?? DEFAULT_MODEL;
}

export function overrideModel(taskType: TaskType, model: string): void {
	MODEL_MAP[taskType] = model;
}
