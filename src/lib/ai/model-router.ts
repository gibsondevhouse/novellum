import type { TaskType } from './types.js';
import { MODEL_MAP, DEFAULT_MODEL } from './constants.js';
import {
	validateModelForTask,
	getModelCapabilitiesOrUnknown,
	type CapabilityCheckResult,
} from './model-capabilities.js';

export function selectModel(taskType: TaskType): string {
	return MODEL_MAP[taskType] ?? DEFAULT_MODEL;
}

export function overrideModel(taskType: TaskType, model: string): void {
	MODEL_MAP[taskType] = model;
}

export function selectOutlineGenerationModel(): string {
	return selectModel('pipeline');
}

/**
 * Selects the model for a task and validates its capabilities.
 * Returns the model id and a capability check result so callers can
 * surface failures without silently falling back to an incapable model.
 */
export function selectModelWithCapabilityCheck(taskType: TaskType): {
	modelId: string;
	capabilityCheck: CapabilityCheckResult;
} {
	const modelId = selectModel(taskType);
	const capabilityCheck = validateModelForTask(modelId, taskType);
	return { modelId, capabilityCheck };
}

/**
 * Returns the capability snapshot for the model selected for a task.
 * Used by the run ledger to store a capability snapshot at run creation.
 */
export function getSelectedModelCapabilities(taskType: TaskType) {
	const modelId = selectModel(taskType);
	return getModelCapabilitiesOrUnknown(modelId);
}
