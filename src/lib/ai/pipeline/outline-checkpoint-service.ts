import type Database from 'better-sqlite3';
import { db } from '$lib/server/db/index.js';
import { PIPELINE_METADATA_SCOPE } from './checkpoint-contract.js';
import {
	OUTLINE_DRAFT_SCHEMA_VERSION,
	OUTLINE_DRAFT_TASK_KEY,
	outlineDraftCheckpointSchema,
	outlineDraftSchema,
	type OutlineDraftCheckpointRecord,
	type OutlineDraftReviewState,
	type OutlineDraftRejectionState,
} from './outline-draft-contract.js';
import { OUTLINE_CHECKPOINT_OWNER_ID } from './outline-checkpoint-contract.js';

type JsonObject = Record<string, unknown>;

export type OutlineCheckpointErrorCode =
	| 'invalid_payload'
	| 'not_found'
	| 'invalid_transition'
	| 'invalid_version';

export class OutlineCheckpointError extends Error {
	readonly code: OutlineCheckpointErrorCode;

	constructor(code: OutlineCheckpointErrorCode, message: string) {
		super(message);
		this.name = 'OutlineCheckpointError';
		this.code = code;
	}
}

interface MetadataRow {
	value: string;
}

export interface ReviewOutlineCheckpointInput {
	reviewer?: string | null;
	note?: string;
}

export interface RejectOutlineCheckpointInput {
	rejectedBy?: string | null;
	reason: string;
}

function nowIso(): string {
	return new Date().toISOString();
}

function isObject(value: unknown): value is JsonObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function asOptionalString(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function assertOutlineOwner(ownerId: string): asserts ownerId is typeof OUTLINE_CHECKPOINT_OWNER_ID {
	if (ownerId !== OUTLINE_CHECKPOINT_OWNER_ID) {
		throw new OutlineCheckpointError(
			'invalid_payload',
			`Owner ${ownerId} is not an outline checkpoint owner.`,
		);
	}
}

function deserializeCheckpoint(raw: string): OutlineDraftCheckpointRecord | null {
	try {
		const parsed = JSON.parse(raw) as unknown;
		const result = outlineDraftCheckpointSchema.safeParse(parsed);
		return result.success ? result.data : null;
	} catch {
		return null;
	}
}

function getRow(
	database: Database.Database,
	projectId: string,
	ownerId: string,
	key: string,
): MetadataRow | undefined {
	return database
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get(projectId, PIPELINE_METADATA_SCOPE, ownerId, key) as MetadataRow | undefined;
}

function writeRow(database: Database.Database, record: OutlineDraftCheckpointRecord): void {
	database
		.prepare(
			`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
			 VALUES (?, ?, ?, ?, ?, ?)
			 ON CONFLICT(projectId, scope, ownerId, key) DO UPDATE SET
			 value = excluded.value,
			 updatedAt = excluded.updatedAt`,
		)
		.run(
			record.projectId,
			PIPELINE_METADATA_SCOPE,
			record.ownerId,
			record.id,
			JSON.stringify(record),
			record.updatedAt,
		);
}

function loadCheckpointOrThrow(
	database: Database.Database,
	projectId: string,
	ownerId: string,
	key: string,
): OutlineDraftCheckpointRecord {
	const row = getRow(database, projectId, ownerId, key);
	if (!row) {
		throw new OutlineCheckpointError('not_found', `Outline checkpoint ${key} was not found.`);
	}

	const parsed = deserializeCheckpoint(row.value);
	if (!parsed) {
		throw new OutlineCheckpointError(
			'invalid_payload',
			`Outline checkpoint ${key} payload is malformed and cannot be processed.`,
		);
	}
	return parsed;
}

function parseUpsertInput(
	projectId: string,
	ownerId: string,
	key: string,
	input: unknown,
	existing: OutlineDraftCheckpointRecord | undefined,
): OutlineDraftCheckpointRecord {
	assertOutlineOwner(ownerId);
	if (!isObject(input)) {
		throw new OutlineCheckpointError('invalid_payload', 'Outline checkpoint value must be an object.');
	}

	const version = typeof input.version === 'string' ? input.version : OUTLINE_DRAFT_SCHEMA_VERSION;
	if (version !== OUTLINE_DRAFT_SCHEMA_VERSION) {
		throw new OutlineCheckpointError('invalid_version', `Unsupported outline checkpoint version ${version}.`);
	}

	const draftResult = outlineDraftSchema.safeParse(input.draft);
	if (!draftResult.success) {
		const issue = draftResult.error.issues[0];
		const suffix = issue ? ` ${issue.path.join('.')}: ${issue.message}` : '';
		throw new OutlineCheckpointError('invalid_payload', `Outline draft payload is invalid.${suffix}`);
	}

	const draft = draftResult.data;
	if (draft.projectId !== projectId) {
		throw new OutlineCheckpointError(
			'invalid_payload',
			`Outline draft projectId ${draft.projectId} does not match ${projectId}.`,
		);
	}

	const updatedAt = nowIso();
	return {
		id: key,
		projectId,
		ownerId,
		taskKey: OUTLINE_DRAFT_TASK_KEY,
		version: OUTLINE_DRAFT_SCHEMA_VERSION,
		lifecycle: 'draft',
		draft,
		createdAt: existing?.createdAt ?? updatedAt,
		updatedAt,
		review: null,
		acceptance: null,
		rejection: null,
	};
}

export interface OutlineCheckpointService {
	upsertCheckpoint(projectId: string, ownerId: string, key: string, value: unknown): OutlineDraftCheckpointRecord;
	moveToReview(
		projectId: string,
		ownerId: string,
		key: string,
		input?: ReviewOutlineCheckpointInput,
	): OutlineDraftCheckpointRecord;
	rejectCheckpoint(
		projectId: string,
		ownerId: string,
		key: string,
		input: RejectOutlineCheckpointInput,
	): OutlineDraftCheckpointRecord;
}

export function createOutlineCheckpointService(
	database: Database.Database = db,
): OutlineCheckpointService {
	function upsertCheckpoint(
		projectId: string,
		ownerId: string,
		key: string,
		value: unknown,
	): OutlineDraftCheckpointRecord {
		assertOutlineOwner(ownerId);
		const existingRow = getRow(database, projectId, ownerId, key);
		const existing = existingRow ? deserializeCheckpoint(existingRow.value) ?? undefined : undefined;
		const record = parseUpsertInput(projectId, ownerId, key, value, existing);
		writeRow(database, record);
		return record;
	}

	function moveToReview(
		projectId: string,
		ownerId: string,
		key: string,
		input: ReviewOutlineCheckpointInput = {},
	): OutlineDraftCheckpointRecord {
		assertOutlineOwner(ownerId);
		const tx = database.transaction(() => {
			const checkpoint = loadCheckpointOrThrow(database, projectId, ownerId, key);
			if (checkpoint.version !== OUTLINE_DRAFT_SCHEMA_VERSION) {
				throw new OutlineCheckpointError(
					'invalid_version',
					`Unsupported outline checkpoint version ${checkpoint.version}.`,
				);
			}
			if (checkpoint.lifecycle === 'accepted' || checkpoint.lifecycle === 'rejected') {
				throw new OutlineCheckpointError(
					'invalid_transition',
					`Cannot move ${checkpoint.lifecycle} outline checkpoint ${key} back to review.`,
				);
			}

			const updatedAt = nowIso();
			const review: OutlineDraftReviewState = {
				reviewedAt: updatedAt,
				reviewer: asOptionalString(input.reviewer),
				note: asString(input.note).trim(),
			};
			const next: OutlineDraftCheckpointRecord = {
				...checkpoint,
				lifecycle: 'review',
				review,
				rejection: null,
				updatedAt,
			};
			writeRow(database, next);
			return next;
		});
		return tx();
	}

	function rejectCheckpoint(
		projectId: string,
		ownerId: string,
		key: string,
		input: RejectOutlineCheckpointInput,
	): OutlineDraftCheckpointRecord {
		assertOutlineOwner(ownerId);
		const reason = input.reason.trim();
		if (!reason) {
			throw new OutlineCheckpointError('invalid_payload', 'Reject reason is required.');
		}

		const tx = database.transaction(() => {
			const checkpoint = loadCheckpointOrThrow(database, projectId, ownerId, key);
			if (checkpoint.lifecycle === 'accepted') {
				throw new OutlineCheckpointError(
					'invalid_transition',
					`Accepted outline checkpoint ${key} cannot be rejected.`,
				);
			}
			if (checkpoint.lifecycle === 'rejected') {
				return checkpoint;
			}

			const updatedAt = nowIso();
			const rejection: OutlineDraftRejectionState = {
				rejectedAt: updatedAt,
				rejectedBy: asOptionalString(input.rejectedBy),
				reason,
			};
			const next: OutlineDraftCheckpointRecord = {
				...checkpoint,
				lifecycle: 'rejected',
				rejection,
				updatedAt,
			};
			writeRow(database, next);
			return next;
		});
		return tx();
	}

	return {
		upsertCheckpoint,
		moveToReview,
		rejectCheckpoint,
	};
}

export function upsertOutlineDraftCheckpoint(
	projectId: string,
	ownerId: string,
	key: string,
	value: unknown,
): OutlineDraftCheckpointRecord {
	return createOutlineCheckpointService().upsertCheckpoint(projectId, ownerId, key, value);
}

export function reviewOutlineDraftCheckpoint(
	projectId: string,
	ownerId: string,
	key: string,
	input?: ReviewOutlineCheckpointInput,
): OutlineDraftCheckpointRecord {
	return createOutlineCheckpointService().moveToReview(projectId, ownerId, key, input);
}

export function rejectOutlineDraftCheckpoint(
	projectId: string,
	ownerId: string,
	key: string,
	input: RejectOutlineCheckpointInput,
): OutlineDraftCheckpointRecord {
	return createOutlineCheckpointService().rejectCheckpoint(projectId, ownerId, key, input);
}
