import type { OutlineDraftCheckpointRecord } from '$lib/ai/pipeline/outline-draft-contract.js';
import {
	OUTLINE_CHECKPOINT_OWNER_ID,
	assertOutlineCheckpointCanAccept,
	assertOutlineCheckpointCanReject,
	createOutlineCheckpointAcceptBody,
	createOutlineCheckpointRejectBody,
	createOutlineCheckpointReviewBody,
	normalizeOutlineCheckpointId,
	type OutlineCheckpointAcceptInput,
	type OutlineCheckpointRejectInput,
	type OutlineCheckpointReviewInput,
} from '$lib/ai/pipeline/outline-checkpoint-contract.js';

type FetchLike = typeof fetch;
type JsonRecord = Record<string, unknown>;

export class OutlineCheckpointActionError extends Error {
	readonly status: number;
	readonly code?: string;
	readonly meta?: unknown;

	constructor(status: number, message: string, code?: string, meta?: unknown) {
		super(message);
		this.name = 'OutlineCheckpointActionError';
		this.status = status;
		this.code = code;
		this.meta = meta;
	}
}

export interface OutlineCheckpointActionDeps {
	fetch?: FetchLike;
}

export interface OutlineCheckpointActionBaseInput {
	projectId: string;
	checkpoint: OutlineDraftCheckpointRecord;
	signal?: AbortSignal;
}

export type ReviewOutlineCheckpointActionInput = OutlineCheckpointActionBaseInput &
	OutlineCheckpointReviewInput;

export type AcceptOutlineCheckpointActionInput = OutlineCheckpointActionBaseInput &
	OutlineCheckpointAcceptInput;

export type RejectOutlineCheckpointActionInput = OutlineCheckpointActionBaseInput &
	OutlineCheckpointRejectInput;

export interface OutlineCheckpointActionResult {
	checkpoint: OutlineDraftCheckpointRecord;
}

export interface AcceptOutlineCheckpointActionResult extends OutlineCheckpointActionResult {
	materialization?: unknown;
}

export interface OutlineCheckpointActions {
	review(input: ReviewOutlineCheckpointActionInput): Promise<OutlineCheckpointActionResult>;
	accept(input: AcceptOutlineCheckpointActionInput): Promise<AcceptOutlineCheckpointActionResult>;
	reject(input: RejectOutlineCheckpointActionInput): Promise<OutlineCheckpointActionResult>;
}

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function resolveFetch(deps: OutlineCheckpointActionDeps): FetchLike {
	const fetcher = deps.fetch ?? globalThis.fetch;
	if (!fetcher) {
		throw new OutlineCheckpointActionError(
			500,
			'Outline checkpoint actions require a fetch-capable browser context.',
			'fetch_unavailable',
		);
	}
	return fetcher.bind(globalThis) as FetchLike;
}

function normalizeProjectId(projectId: string): string {
	const normalized = projectId.trim();
	if (!normalized) {
		throw new OutlineCheckpointActionError(400, 'Project id is required.', 'invalid_request');
	}
	return normalized;
}

function metadataEndpoint(projectId: string, checkpointId: string): string {
	return `/api/db/project-metadata/${encodeURIComponent(projectId)}/pipeline/${encodeURIComponent(
		OUTLINE_CHECKPOINT_OWNER_ID,
	)}/${encodeURIComponent(checkpointId)}`;
}

function acceptEndpoint(checkpointId: string): string {
	return `/api/outline/checkpoints/${encodeURIComponent(checkpointId)}/accept`;
}

function parseActionError(status: number, body: unknown): OutlineCheckpointActionError {
	const record = isRecord(body) ? body : {};
	const errorValue = record.error;
	const errorRecord = isRecord(errorValue) ? errorValue : {};
	const message =
		asString(errorRecord.message) ??
		asString(errorValue) ??
		asString(record.message) ??
		`Outline checkpoint action failed: ${status}`;
	const code = asString(errorRecord.code) ?? asString(record.code);
	const meta = errorRecord.meta ?? record.meta;
	return new OutlineCheckpointActionError(status, message, code, meta);
}

async function readJson(response: Response): Promise<unknown> {
	try {
		return await response.json();
	} catch {
		return {};
	}
}

function checkpointFromPayload(payload: unknown): OutlineDraftCheckpointRecord {
	if (!isRecord(payload) || !isRecord(payload.checkpoint)) {
		throw new OutlineCheckpointActionError(
			502,
			'Outline checkpoint action response did not include a checkpoint.',
			'invalid_response',
		);
	}
	return payload.checkpoint as OutlineDraftCheckpointRecord;
}

async function fetchJson<T>(
	deps: OutlineCheckpointActionDeps,
	url: string,
	init: RequestInit,
): Promise<T> {
	const response = await resolveFetch(deps)(url, init);
	const payload = await readJson(response);
	if (!response.ok) throw parseActionError(response.status, payload);
	return payload as T;
}

export async function reviewOutlineDraftCheckpointAction(
	input: ReviewOutlineCheckpointActionInput,
	deps: OutlineCheckpointActionDeps = {},
): Promise<OutlineCheckpointActionResult> {
	const projectId = normalizeProjectId(input.projectId);
	const checkpointId = normalizeOutlineCheckpointId(input.checkpoint.id);
	const body = createOutlineCheckpointReviewBody({
		reviewer: input.reviewer,
		note: input.note,
	});
	const payload = await fetchJson<unknown>(deps, metadataEndpoint(projectId, checkpointId), {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
		signal: input.signal,
	});
	return { checkpoint: checkpointFromPayload(payload) };
}

export async function acceptOutlineDraftCheckpointAction(
	input: AcceptOutlineCheckpointActionInput,
	deps: OutlineCheckpointActionDeps = {},
): Promise<AcceptOutlineCheckpointActionResult> {
	assertOutlineCheckpointCanAccept(input.checkpoint);
	const projectId = normalizeProjectId(input.projectId);
	const checkpointId = normalizeOutlineCheckpointId(input.checkpoint.id);
	const { operation: _operation, ...body } = createOutlineCheckpointAcceptBody({
		acceptedBy: input.acceptedBy,
		note: input.note,
		expectedUpdatedAt: input.expectedUpdatedAt ?? input.checkpoint.updatedAt,
		expectedVersion: input.expectedVersion ?? input.checkpoint.version,
		selectedNodeIds: input.selectedNodeIds,
	});
	const payload = await fetchJson<unknown>(deps, acceptEndpoint(checkpointId), {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ projectId, ...body }),
		signal: input.signal,
	});
	const checkpoint = checkpointFromPayload(payload);
	return {
		checkpoint,
		materialization: isRecord(payload) ? payload.materialization : undefined,
	};
}

export async function rejectOutlineDraftCheckpointAction(
	input: RejectOutlineCheckpointActionInput,
	deps: OutlineCheckpointActionDeps = {},
): Promise<OutlineCheckpointActionResult> {
	assertOutlineCheckpointCanReject(input.checkpoint);
	const projectId = normalizeProjectId(input.projectId);
	const checkpointId = normalizeOutlineCheckpointId(input.checkpoint.id);
	const body = createOutlineCheckpointRejectBody({
		rejectedBy: input.rejectedBy,
		reason: input.reason,
	});
	const payload = await fetchJson<unknown>(deps, metadataEndpoint(projectId, checkpointId), {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
		signal: input.signal,
	});
	return { checkpoint: checkpointFromPayload(payload) };
}

export function createOutlineCheckpointActions(
	deps: OutlineCheckpointActionDeps = {},
): OutlineCheckpointActions {
	return {
		review: (input) => reviewOutlineDraftCheckpointAction(input, deps),
		accept: (input) => acceptOutlineDraftCheckpointAction(input, deps),
		reject: (input) => rejectOutlineDraftCheckpointAction(input, deps),
	};
}
