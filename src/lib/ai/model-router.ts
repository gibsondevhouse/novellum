import type { TaskType } from './types.js';
import { MODEL_MAP, DEFAULT_MODEL } from './constants.js';

export function selectModel(taskType: TaskType): string {
	return MODEL_MAP[taskType] ?? DEFAULT_MODEL;
}

export function overrideModel(taskType: TaskType, model: string): void {
	MODEL_MAP[taskType] = model;
}
