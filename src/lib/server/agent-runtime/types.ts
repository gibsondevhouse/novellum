export const AGENT_RUN_STATUSES = [
	'pending',
	'running',
	'retrying',
	'waiting_for_review',
	'completed',
	'failed',
	'cancelled',
	'expired',
] as const;

export type AgentRunStatus = (typeof AGENT_RUN_STATUSES)[number];

export const TERMINAL_AGENT_RUN_STATUSES = ['completed', 'failed', 'cancelled', 'expired'] as const;

export type TerminalAgentRunStatus = (typeof TERMINAL_AGENT_RUN_STATUSES)[number];

export const AGENT_JOB_STATUSES = [
	'queued',
	'running',
	'retry_scheduled',
	'completed',
	'failed',
	'cancelled',
] as const;

export type AgentJobStatus = (typeof AGENT_JOB_STATUSES)[number];

export interface RuntimeRedaction {
	fieldPath: string;
	redactionType: 'credential' | 'manuscript_text' | 'raw_model_output' | 'custom';
	replacement: string;
	reason: string;
}

export interface RuntimeJsonRedactionResult {
	redacted: unknown;
	redactions: RuntimeRedaction[];
}

export interface AgentRunRecord {
	id: string;
	projectId: string | null;
	family: string;
	entrypoint: string;
	status: AgentRunStatus;
	requestedBy: string;
	targetKind: string;
	targetId: string;
	modelProvider: string;
	modelId: string;
	modelCapabilitySnapshotId: string | null;
	targetJson: unknown;
	inputHash: string;
	contextHash: string;
	statusReason: string;
	errorCode: string;
	errorMessageRedacted: string;
	retryOfRunId: string | null;
	startedAt: string | null;
	completedAt: string | null;
	cancelledAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AgentRunStepRecord {
	id: string;
	runId: string;
	sequence: number;
	parentStepId: string | null;
	kind: string;
	status: string;
	source: string;
	inputHash: string;
	outputHash: string;
	usageId: string | null;
	artifactId: string | null;
	errorCode: string;
	errorMessageRedacted: string;
	startedAt: string | null;
	completedAt: string | null;
	elapsedMs: number;
	createdAt: string;
	updatedAt: string;
}

export interface AgentToolCallRecord {
	id: string;
	runId: string;
	stepId: string | null;
	invocationId: string;
	toolId: string;
	capability: string;
	caller: string;
	status: string;
	sourceStatus: string;
	inputRedactedJson: unknown;
	outputRedactedJson: unknown;
	inputHash: string;
	outputHash: string;
	artifactId: string | null;
	errorCode: string;
	errorMessageRedacted: string;
	startedAt: string | null;
	completedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AgentArtifactRecord {
	id: string;
	runId: string;
	stepId: string | null;
	artifactType: string;
	reviewState: string;
	storageKind: string;
	storageProjectId: string | null;
	storageOwnerId: string | null;
	storageKey: string;
	storageRefJson: unknown;
	domainType: string;
	domainId: string;
	domainVersion: string;
	schemaVersion: string;
	summary: string;
	contentHash: string;
	sourceStatus: string;
	createdAt: string;
	updatedAt: string;
}

export interface AgentUsageRecord {
	id: string;
	runId: string;
	stepId: string | null;
	providerId: string;
	modelId: string;
	usageKind: string;
	promptChars: number;
	completionChars: number;
	estimatedPromptTokens: number;
	estimatedCompletionTokens: number;
	estimatedTotalTokens: number;
	estimatedCostUsd: number;
	providerPromptTokens: number | null;
	providerCompletionTokens: number | null;
	providerTotalTokens: number | null;
	providerCostUsd: number | null;
	finishReason: string;
	usageConfidence: string;
	createdAt: string;
}

export interface AgentRunErrorRecord {
	id: string;
	runId: string;
	stepId: string | null;
	jobId: string | null;
	errorCode: string;
	errorKind: string;
	errorMessageRedacted: string;
	retryable: boolean;
	detailsRedactedJson: unknown;
	createdAt: string;
}

export interface AgentJobRecord {
	id: string;
	runId: string | null;
	projectId: string | null;
	jobType: string;
	status: AgentJobStatus;
	priority: number;
	runAfter: string | null;
	lockedAt: string | null;
	lockedBy: string;
	lockExpiresAt: string | null;
	heartbeatAt: string | null;
	attempt: number;
	maxAttempts: number;
	retryOfJobId: string | null;
	payloadRedactedJson: unknown;
	payloadHash: string;
	resultArtifactId: string | null;
	progressCurrent: number;
	progressTotal: number;
	progressLabel: string;
	startedAt: string | null;
	completedAt: string | null;
	cancelledAt: string | null;
	errorCode: string;
	errorMessageRedacted: string;
	createdAt: string;
	updatedAt: string;
}

export interface AgentTraceEventRecord {
	id: string;
	runId: string;
	stepId: string | null;
	sequence: number;
	eventType: string;
	severity: string;
	message: string;
	metadataRedactedJson: unknown;
	redactionState: string;
	createdAt: string;
}

export interface AgentTraceRedactionRecord {
	id: string;
	runId: string;
	traceEventId: string | null;
	fieldPath: string;
	redactionType: RuntimeRedaction['redactionType'];
	replacement: string;
	reason: string;
	createdAt: string;
}

export interface AgentRunDetails {
	run: AgentRunRecord;
	steps: AgentRunStepRecord[];
	toolCalls: AgentToolCallRecord[];
	artifacts: AgentArtifactRecord[];
	usage: AgentUsageRecord[];
	errors: AgentRunErrorRecord[];
	jobs: AgentJobRecord[];
	traceEvents: AgentTraceEventRecord[];
	traceRedactions: AgentTraceRedactionRecord[];
}
