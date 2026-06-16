import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';

export const NOVA_ARTIFACT_ACTION_OWNER_ID = 'nova-artifact-actions';

export type NovaInlineArtifactKind =
	| 'author-scene-draft'
	| 'author-revision-pack'
	| 'author-outline';

export type NovaArtifactActionKind = 'accept' | 'reject' | 'acknowledge' | 'copy';

export type NovaArtifactActionClassification =
	| 'review_decision'
	| 'non_mutating_acknowledgement'
	| 'local_utility';

export type NovaArtifactActionDurability = 'not_started' | 'local_only' | 'durable';

export type NovaArtifactActionStatus =
	| 'idle'
	| 'running'
	| 'succeeded'
	| 'failed'
	| 'insufficient_context'
	| 'stale_target'
	| 'cancelled';

export interface NovaArtifactActionTarget {
	artifactId: string;
	artifactKind: NovaInlineArtifactKind;
	taskKey: string;
	projectId?: string | null;
	sceneId?: string | null;
	checkpointId?: string | null;
	issueId?: string | null;
	producedAt?: string | null;
}

export interface NovaArtifactActionAuditMetadata {
	intent?: 'artifact.accept' | 'artifact.reject' | 'artifact.acknowledge' | 'artifact.copy';
	runId?: string | null;
	jobId?: string | null;
	controllerArtifactId?: string | null;
	[key: string]: unknown;
}

export interface NovaArtifactActionResult<TData = unknown> {
	action: NovaArtifactActionKind;
	classification: NovaArtifactActionClassification;
	status: NovaArtifactActionStatus;
	durability: NovaArtifactActionDurability;
	target: NovaArtifactActionTarget;
	message: string;
	data?: TData;
	errorCode?: string;
	audit?: NovaArtifactActionAuditMetadata;
}

export interface NovaArtifactActionInput<TPayload = unknown> {
	action: NovaArtifactActionKind;
	classification: NovaArtifactActionClassification;
	artifactKind: NovaInlineArtifactKind;
	envelope: PipelineArtifactEnvelope<TPayload>;
	projectId?: string | null;
	sceneId?: string | null;
	checkpointId?: string | null;
	issueId?: string | null;
	audit?: NovaArtifactActionAuditMetadata;
}

export function classifyNovaArtifactAction(
	artifactKind: NovaInlineArtifactKind,
	action: NovaArtifactActionKind,
): NovaArtifactActionClassification {
	if (action === 'copy') return 'local_utility';
	if (artifactKind === 'author-revision-pack' && action === 'acknowledge') {
		return 'non_mutating_acknowledgement';
	}
	return 'review_decision';
}

export function actionRequiresDurableWrite(
	classification: NovaArtifactActionClassification,
): boolean {
	return classification === 'review_decision' || classification === 'non_mutating_acknowledgement';
}

export function createNovaArtifactActionTarget<TPayload>(
	input: Omit<NovaArtifactActionInput<TPayload>, 'action' | 'classification'>,
): NovaArtifactActionTarget {
	return {
		artifactId: input.envelope.id,
		artifactKind: input.artifactKind,
		taskKey: input.envelope.taskKey,
		projectId: input.projectId ?? null,
		sceneId: input.sceneId ?? null,
		checkpointId: input.checkpointId ?? null,
		issueId: input.issueId ?? null,
		producedAt: input.envelope.producedAt ?? null,
	};
}

export function createNovaArtifactActionResult<TData = unknown, TPayload = unknown>(
	input: NovaArtifactActionInput<TPayload> & {
		status: NovaArtifactActionStatus;
		durability: NovaArtifactActionDurability;
		message: string;
		data?: TData;
		errorCode?: string;
	},
): NovaArtifactActionResult<TData> {
	return {
		action: input.action,
		classification: input.classification,
		status: input.status,
		durability: input.durability,
		target: createNovaArtifactActionTarget(input),
		message: input.message,
		data: input.data,
		errorCode: input.errorCode,
		audit: input.audit,
	};
}

export function createInsufficientContextResult<TData = unknown, TPayload = unknown>(
	input: NovaArtifactActionInput<TPayload> & { reason: string },
): NovaArtifactActionResult<TData> {
	return createNovaArtifactActionResult<TData, TPayload>({
		...input,
		status: 'insufficient_context',
		durability: 'not_started',
		errorCode: 'insufficient_context',
		message: input.reason,
	});
}

export function createStaleTargetResult<TData = unknown, TPayload = unknown>(
	input: NovaArtifactActionInput<TPayload> & { message?: string },
): NovaArtifactActionResult<TData> {
	return createNovaArtifactActionResult<TData, TPayload>({
		...input,
		status: 'stale_target',
		durability: 'not_started',
		errorCode: 'stale_target',
		message:
			input.message ??
			'This artifact target changed before the action completed. Review the current draft and try again.',
	});
}
