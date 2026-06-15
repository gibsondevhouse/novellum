export type AiControllerJsonPrimitive = string | number | boolean | null;
export type AiControllerJsonValue =
	| AiControllerJsonPrimitive
	| { readonly [key: string]: AiControllerJsonValue }
	| readonly AiControllerJsonValue[];

export const AI_CONTROLLER_TASK_STATUSES = [
	'received',
	'resolving_intent',
	'policy_check',
	'building_context',
	'routing_workflow',
	'calling_model',
	'validating_output',
	'persisting_artifact',
	'awaiting_review',
	'accepted',
	'rejected',
	'completed',
	'blocked',
	'failed',
	'cancelled',
] as const;

export type AiControllerTaskStatus = (typeof AI_CONTROLLER_TASK_STATUSES)[number];

export const TERMINAL_AI_CONTROLLER_TASK_STATUSES = [
	'accepted',
	'rejected',
	'completed',
	'blocked',
	'failed',
	'cancelled',
] as const;

export type TerminalAiControllerTaskStatus =
	(typeof TERMINAL_AI_CONTROLLER_TASK_STATUSES)[number];

const TERMINAL_STATUS_SET = new Set<AiControllerTaskStatus>(TERMINAL_AI_CONTROLLER_TASK_STATUSES);

export function isTerminalAiControllerTaskStatus(
	status: AiControllerTaskStatus,
): status is TerminalAiControllerTaskStatus {
	return TERMINAL_STATUS_SET.has(status);
}

export const AI_CONTROLLER_REQUEST_SOURCES = [
	'nova',
	'editor',
	'outline',
	'worldbuilding',
	'api',
	'system',
] as const;

export type AiControllerRequestSource = (typeof AI_CONTROLLER_REQUEST_SOURCES)[number];

export const AI_CONTROLLER_TARGET_KINDS = [
	'project',
	'arc',
	'act',
	'milestone',
	'chapter',
	'scene',
	'beat',
	'worldbuilding_entity',
	'selection',
	'pipeline',
	'unknown',
] as const;

export type AiControllerTargetKind = (typeof AI_CONTROLLER_TARGET_KINDS)[number];

export const AI_CONTROLLER_ARTIFACT_STATUSES = [
	'draft',
	'review',
	'accepted',
	'rejected',
	'failed',
] as const;

export type AiControllerArtifactStatus = (typeof AI_CONTROLLER_ARTIFACT_STATUSES)[number];

export const AI_CONTROLLER_ERROR_CODES = [
	'unsupported_intent',
	'ambiguous_intent',
	'policy_denied',
	'missing_context',
	'model_unavailable',
	'invalid_model_output',
	'artifact_persistence_failed',
	'runtime_cancelled',
	'unexpected_error',
] as const;

export type AiControllerErrorCode = (typeof AI_CONTROLLER_ERROR_CODES)[number];

export interface AiControllerTargetRef {
	kind: AiControllerTargetKind;
	id?: string | null;
	projectId?: string | null;
	label?: string;
}

export interface AiControllerContextRef {
	kind: AiControllerTargetKind;
	id: string;
	projectId?: string | null;
	relevance: 'required' | 'optional';
	reason?: string;
}

export interface AiControllerUserAction {
	source: AiControllerRequestSource;
	id: string;
	instruction?: string;
	mode?: string;
	payload?: AiControllerJsonValue;
}

export interface AiControllerRequest {
	requestId: string;
	projectId: string | null;
	requestedBy: 'user' | 'system' | 'worker';
	action: AiControllerUserAction;
	target: AiControllerTargetRef;
	contextRefs?: AiControllerContextRef[];
	createdAt: string;
	metadata?: AiControllerJsonValue;
}

export interface AiControllerRuntimeRef {
	runId: string;
	jobId?: string | null;
	stepId?: string | null;
}

export interface AiControllerArtifactRef {
	id: string;
	type: string;
	status: AiControllerArtifactStatus;
	projectId?: string | null;
	ownerId?: string | null;
	key?: string | null;
	schemaVersion?: string;
	summary?: string;
}

export interface AiControllerWarning {
	code: string;
	message: string;
	details?: AiControllerJsonValue;
}

export interface AiControllerError {
	code: AiControllerErrorCode;
	message: string;
	retryable: boolean;
	details?: AiControllerJsonValue;
}

export interface AiControllerUsageEstimate {
	providerId: string;
	modelId: string;
	promptTokens?: number;
	completionTokens?: number;
	totalTokens?: number;
	estimatedCostUsd?: number;
}

export interface AiControllerSuccessResponse<TOutput = unknown> {
	ok: true;
	requestId: string;
	status: AiControllerTaskStatus;
	runtime?: AiControllerRuntimeRef;
	artifact?: AiControllerArtifactRef;
	output?: TOutput;
	usage?: AiControllerUsageEstimate;
	warnings?: AiControllerWarning[];
	metadata?: AiControllerJsonValue;
}

export interface AiControllerFailureResponse {
	ok: false;
	requestId?: string;
	status: 'blocked' | 'failed' | 'cancelled';
	error: AiControllerError;
	runtime?: AiControllerRuntimeRef;
	warnings?: AiControllerWarning[];
	metadata?: AiControllerJsonValue;
}

export type AiControllerResponse<TOutput = unknown> =
	| AiControllerSuccessResponse<TOutput>
	| AiControllerFailureResponse;
