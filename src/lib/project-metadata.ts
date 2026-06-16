import type { WorldbuildCheckpointRecord } from '$lib/ai/pipeline/checkpoint-contract.js';
import { WORLDBUILD_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';
import type { OutlineDraftCheckpointRecord } from '$lib/ai/pipeline/outline-draft-contract.js';
import {
	OUTLINE_CHECKPOINT_OWNER_ID,
	assertOutlineCheckpointCanAccept,
	assertOutlineCheckpointCanReject,
	createOutlineCheckpointAcceptBody,
	createOutlineCheckpointRejectBody,
	createOutlineCheckpointReviewBody,
	createOutlineCheckpointUpsertBody,
	normalizeOutlineCheckpointId,
	type OutlineCheckpointAcceptInput,
	type OutlineCheckpointAcceptTarget,
	type OutlineCheckpointRejectInput,
	type OutlineCheckpointRejectTarget,
	type OutlineCheckpointReviewInput,
	type OutlineCheckpointUpsertValue,
} from '$lib/ai/pipeline/outline-checkpoint-contract.js';

/**
 * Client wrapper for the SQLite-canonical project metadata store.
 *
 * Stores JSON blobs keyed by (projectId, scope, ownerId, key). Used by
 * outliner planning panels and editor scene side-cars.
 *
 * SSR-safe: server-side calls return the default and skip fetch.
 */

export type MetadataScope = 'scene' | 'chapter' | 'project' | 'pipeline';

type PipelineOperation = 'upsert' | 'review' | 'accept' | 'reject';

const BASE = '/api/db/project-metadata';

function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof fetch !== 'undefined';
}

function url(projectId: string, scope: MetadataScope, ownerId: string, key?: string): string {
	const segments = [projectId, scope, ownerId];
	if (key !== undefined) segments.push(key);
	return `${BASE}/${segments.map(encodeURIComponent).join('/')}`;
}

function outlineAcceptUrl(checkpointId: string): string {
	return `/api/outline/checkpoints/${encodeURIComponent(checkpointId)}/accept`;
}

export async function getProjectMetadata<T>(
	projectId: string,
	scope: MetadataScope,
	ownerId: string,
	key: string,
	defaultValue: T,
): Promise<T> {
	if (!isBrowser()) return defaultValue;
	try {
		const res = await fetch(url(projectId, scope, ownerId, key), { method: 'GET' });
		if (!res.ok) return defaultValue;
		const body = (await res.json()) as { value: unknown };
		if (body.value === null || body.value === undefined) return defaultValue;
		return body.value as T;
	} catch {
		return defaultValue;
	}
}

export async function listProjectMetadata(
	projectId: string,
	scope: MetadataScope,
	ownerId: string,
): Promise<Record<string, unknown>> {
	if (!isBrowser()) return {};
	try {
		const res = await fetch(url(projectId, scope, ownerId), { method: 'GET' });
		if (!res.ok) return {};
		const body = (await res.json()) as { data: Record<string, unknown> };
		return body.data ?? {};
	} catch {
		return {};
	}
}

export async function listProjectMetadataStrict(
	projectId: string,
	scope: MetadataScope,
	ownerId: string,
): Promise<Record<string, unknown>> {
	if (!isBrowser()) return {};

	const res = await fetch(url(projectId, scope, ownerId), { method: 'GET' });
	if (!res.ok) {
		const payload = (await res.json().catch(() => ({}))) as { error?: string };
		throw new Error(payload.error ?? `Failed to load project metadata: ${res.status}`);
	}

	const body = (await res.json()) as { data?: Record<string, unknown> };
	return body.data ?? {};
}

export async function setProjectMetadata<T>(
	projectId: string,
	scope: MetadataScope,
	ownerId: string,
	key: string,
	value: T,
): Promise<void> {
	if (!isBrowser()) return;
	try {
		await fetch(url(projectId, scope, ownerId, key), {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ value }),
		});
	} catch {
		/* swallow — best-effort */
	}
}

async function mutatePipelineCheckpoint(
	projectId: string,
	ownerId: string,
	checkpointId: string,
	operation: PipelineOperation,
	body: Record<string, unknown>,
): Promise<WorldbuildCheckpointRecord>;
async function mutatePipelineCheckpoint<TCheckpoint>(
	projectId: string,
	ownerId: string,
	checkpointId: string,
	operation: PipelineOperation,
	body: Record<string, unknown>,
): Promise<TCheckpoint>;
async function mutatePipelineCheckpoint<TCheckpoint>(
	projectId: string,
	ownerId: string,
	checkpointId: string,
	operation: PipelineOperation,
	body: Record<string, unknown>,
): Promise<TCheckpoint> {
	if (!isBrowser()) {
		throw new Error('Pipeline checkpoint mutations require a browser context.');
	}

	const res = await fetch(url(projectId, 'pipeline', ownerId, checkpointId), {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ operation, ...body }),
	});

	if (!res.ok) {
		const payload = (await res.json().catch(() => ({}))) as { error?: string };
		throw new Error(payload.error ?? `Pipeline checkpoint mutation failed: ${res.status}`);
	}

	const payload = (await res.json()) as { checkpoint: TCheckpoint };
	return payload.checkpoint;
}

export async function upsertWorldbuildCheckpoint(
	projectId: string,
	checkpointId: string,
	value: unknown,
	ownerId = WORLDBUILD_CHECKPOINT_OWNER_ID,
): Promise<WorldbuildCheckpointRecord> {
	return mutatePipelineCheckpoint(projectId, ownerId, checkpointId, 'upsert', { value });
}

export async function reviewWorldbuildCheckpoint(
	projectId: string,
	checkpointId: string,
	input: { reviewer?: string; note?: string } = {},
	ownerId = WORLDBUILD_CHECKPOINT_OWNER_ID,
): Promise<WorldbuildCheckpointRecord> {
	return mutatePipelineCheckpoint(projectId, ownerId, checkpointId, 'review', input);
}

export async function acceptWorldbuildCheckpoint(
	projectId: string,
	checkpointId: string,
	input: { acceptedBy?: string; note?: string } = {},
	ownerId = WORLDBUILD_CHECKPOINT_OWNER_ID,
): Promise<WorldbuildCheckpointRecord> {
	return mutatePipelineCheckpoint(projectId, ownerId, checkpointId, 'accept', input);
}

export async function rejectWorldbuildCheckpoint(
	projectId: string,
	checkpointId: string,
	input: { rejectedBy?: string; reason: string },
	ownerId = WORLDBUILD_CHECKPOINT_OWNER_ID,
): Promise<WorldbuildCheckpointRecord> {
	return mutatePipelineCheckpoint(projectId, ownerId, checkpointId, 'reject', input);
}

export async function listOutlineCheckpoints(
	projectId: string,
	ownerId = OUTLINE_CHECKPOINT_OWNER_ID,
): Promise<Record<string, OutlineDraftCheckpointRecord>> {
	const entries = await listProjectMetadata(projectId, 'pipeline', ownerId);
	return Object.fromEntries(
		Object.entries(entries).map(([key, value]) => [key, value as OutlineDraftCheckpointRecord]),
	);
}

export async function upsertOutlineCheckpoint(
	projectId: string,
	checkpointId: string,
	value: OutlineCheckpointUpsertValue,
	ownerId = OUTLINE_CHECKPOINT_OWNER_ID,
): Promise<OutlineDraftCheckpointRecord> {
	const body = createOutlineCheckpointUpsertBody(value);
	return mutatePipelineCheckpoint<OutlineDraftCheckpointRecord>(
		projectId,
		ownerId,
		normalizeOutlineCheckpointId(checkpointId),
		body.operation,
		{ value: body.value },
	);
}

export async function reviewOutlineCheckpoint(
	projectId: string,
	checkpointId: string,
	input: OutlineCheckpointReviewInput = {},
	ownerId = OUTLINE_CHECKPOINT_OWNER_ID,
): Promise<OutlineDraftCheckpointRecord> {
	const body = createOutlineCheckpointReviewBody(input);
	return mutatePipelineCheckpoint<OutlineDraftCheckpointRecord>(
		projectId,
		ownerId,
		normalizeOutlineCheckpointId(checkpointId),
		body.operation,
		body,
	);
}

export async function acceptOutlineCheckpoint(
	projectId: string,
	checkpoint: OutlineCheckpointAcceptTarget,
	input: OutlineCheckpointAcceptInput = {},
	ownerId = OUTLINE_CHECKPOINT_OWNER_ID,
): Promise<OutlineDraftCheckpointRecord> {
	assertOutlineCheckpointCanAccept(checkpoint);
	if (ownerId !== OUTLINE_CHECKPOINT_OWNER_ID) {
		throw new Error('Outline checkpoint acceptance requires the outline checkpoint owner.');
	}
	const bodyWithPrecondition = createOutlineCheckpointAcceptBody({
		...input,
		expectedUpdatedAt: input.expectedUpdatedAt ?? checkpoint.updatedAt,
		expectedVersion: input.expectedVersion ?? checkpoint.version,
	});
	if (!isBrowser()) {
		throw new Error('Pipeline checkpoint mutations require a browser context.');
	}

	const { operation: _operation, ...requestBody } = bodyWithPrecondition;
	const checkpointId = normalizeOutlineCheckpointId(checkpoint.id);
	const res = await fetch(outlineAcceptUrl(checkpointId), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ projectId, ...requestBody }),
	});

	if (!res.ok) {
		const payload = (await res.json().catch(() => ({}))) as { error?: string };
		throw new Error(payload.error ?? `Pipeline checkpoint mutation failed: ${res.status}`);
	}

	const payload = (await res.json()) as { checkpoint: OutlineDraftCheckpointRecord };
	return payload.checkpoint;
}

export async function rejectOutlineCheckpoint(
	projectId: string,
	checkpoint: OutlineCheckpointRejectTarget,
	input: OutlineCheckpointRejectInput,
	ownerId = OUTLINE_CHECKPOINT_OWNER_ID,
): Promise<OutlineDraftCheckpointRecord> {
	assertOutlineCheckpointCanReject(checkpoint);
	const body = createOutlineCheckpointRejectBody(input);
	return mutatePipelineCheckpoint<OutlineDraftCheckpointRecord>(
		projectId,
		ownerId,
		normalizeOutlineCheckpointId(checkpoint.id),
		body.operation,
		body,
	);
}

export async function deleteProjectMetadata(
	projectId: string,
	scope: MetadataScope,
	ownerId: string,
	key: string,
): Promise<void> {
	if (!isBrowser()) return;
	try {
		await fetch(url(projectId, scope, ownerId, key), { method: 'DELETE' });
	} catch {
		/* swallow */
	}
}
