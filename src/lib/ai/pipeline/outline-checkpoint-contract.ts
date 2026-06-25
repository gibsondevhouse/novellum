import {
	OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	type OutlineDraft,
	type OutlineDraftCheckpointRecord,
	type OutlineDraftLifecycle,
} from './outline-draft-contract.js';

export const OUTLINE_CHECKPOINT_OWNER_ID = OUTLINE_DRAFT_CHECKPOINT_OWNER_ID;

export const OUTLINE_CHECKPOINT_OPERATIONS = [
	'upsert',
	'review',
	'accept',
	'reject',
] as const;

export type OutlineCheckpointOperation = (typeof OUTLINE_CHECKPOINT_OPERATIONS)[number];

export interface OutlineCheckpointUpsertValue {
	draft: OutlineDraft;
	version: typeof OUTLINE_DRAFT_SCHEMA_VERSION;
}

export interface OutlineCheckpointReviewInput {
	reviewer?: string;
	note?: string;
}

export interface OutlineCheckpointAcceptInput {
	acceptedBy?: string;
	note?: string;
	expectedUpdatedAt?: string;
	expectedVersion?: string;
	selectedNodeIds?: OutlineMergeNodeKey[];
}

export interface OutlineCheckpointRejectInput {
	rejectedBy?: string;
	reason: string;
}

export type OutlineCheckpointUpsertBody = {
	operation: 'upsert';
	value: OutlineCheckpointUpsertValue;
};

export type OutlineCheckpointReviewBody = {
	operation: 'review';
	reviewer?: string;
	note?: string;
};

export type OutlineCheckpointAcceptBody = {
	operation: 'accept';
	acceptedBy?: string;
	note?: string;
	expectedUpdatedAt?: string;
	expectedVersion?: string;
	selectedNodeIds?: OutlineMergeNodeKey[];
};

export type OutlineCheckpointRejectBody = {
	operation: 'reject';
	rejectedBy?: string;
	reason: string;
};

export type OutlineCheckpointMutationBody =
	| OutlineCheckpointUpsertBody
	| OutlineCheckpointReviewBody
	| OutlineCheckpointAcceptBody
	| OutlineCheckpointRejectBody;

export type OutlineCheckpointLifecycleTarget = Pick<
	OutlineDraftCheckpointRecord,
	'id' | 'lifecycle'
>;

export type OutlineCheckpointAcceptTarget = OutlineCheckpointLifecycleTarget & {
	lifecycle: 'review';
	updatedAt: string;
	version: string;
};

export type OutlineCheckpointRejectTarget = OutlineCheckpointLifecycleTarget & {
	lifecycle: Extract<OutlineDraftLifecycle, 'draft' | 'review'>;
};

export class OutlineCheckpointHelperError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'OutlineCheckpointHelperError';
	}
}

export type OutlineMergeNodeKind = 'arc' | 'act' | 'chapter' | 'scene';
export type OutlineMergeNodeKey = `${OutlineMergeNodeKind}:${string}`;

function stripUndefined<T extends Record<string, unknown>>(body: T): T {
	return Object.fromEntries(
		Object.entries(body).filter(([, value]) => value !== undefined),
	) as T;
}

export function normalizeOutlineCheckpointId(checkpointId: string): string {
	const trimmed = checkpointId.trim();
	if (!trimmed) {
		throw new OutlineCheckpointHelperError('Outline checkpoint id is required.');
	}
	return trimmed;
}

export function createOutlineCheckpointUpsertBody(
	value: OutlineCheckpointUpsertValue,
): OutlineCheckpointUpsertBody {
	return {
		operation: 'upsert',
		value,
	};
}

export function createOutlineCheckpointReviewBody(
	input: OutlineCheckpointReviewInput = {},
): OutlineCheckpointReviewBody {
	return stripUndefined({
		operation: 'review',
		reviewer: input.reviewer?.trim() || undefined,
		note: input.note?.trim() || undefined,
	});
}

export function createOutlineCheckpointAcceptBody(
	input: OutlineCheckpointAcceptInput = {},
): OutlineCheckpointAcceptBody {
	return stripUndefined({
		operation: 'accept',
		acceptedBy: input.acceptedBy?.trim() || undefined,
		note: input.note?.trim() || undefined,
		expectedUpdatedAt: input.expectedUpdatedAt?.trim() || undefined,
		expectedVersion: input.expectedVersion?.trim() || undefined,
		selectedNodeIds: input.selectedNodeIds,
	});
}

export function createOutlineCheckpointRejectBody(
	input: OutlineCheckpointRejectInput,
): OutlineCheckpointRejectBody {
	const reason = input.reason.trim();
	if (!reason) {
		throw new OutlineCheckpointHelperError('Reject reason is required.');
	}
	return stripUndefined({
		operation: 'reject',
		rejectedBy: input.rejectedBy?.trim() || undefined,
		reason,
	});
}

export function canAcceptOutlineCheckpoint(
	checkpoint: OutlineCheckpointLifecycleTarget,
): checkpoint is OutlineCheckpointAcceptTarget {
	return checkpoint.lifecycle === 'review';
}

export function canRejectOutlineCheckpoint(
	checkpoint: OutlineCheckpointLifecycleTarget,
): checkpoint is OutlineCheckpointRejectTarget {
	return checkpoint.lifecycle === 'draft' || checkpoint.lifecycle === 'review';
}

export function assertOutlineCheckpointCanAccept(
	checkpoint: OutlineCheckpointLifecycleTarget,
): asserts checkpoint is OutlineCheckpointAcceptTarget {
	if (!canAcceptOutlineCheckpoint(checkpoint)) {
		throw new OutlineCheckpointHelperError(
			`Only review outline checkpoints can be accepted; received ${checkpoint.lifecycle}.`,
		);
	}
}

export function assertOutlineCheckpointCanReject(
	checkpoint: OutlineCheckpointLifecycleTarget,
): asserts checkpoint is OutlineCheckpointRejectTarget {
	if (!canRejectOutlineCheckpoint(checkpoint)) {
		throw new OutlineCheckpointHelperError(
			`Only draft or review outline checkpoints can be rejected; received ${checkpoint.lifecycle}.`,
		);
	}
}
