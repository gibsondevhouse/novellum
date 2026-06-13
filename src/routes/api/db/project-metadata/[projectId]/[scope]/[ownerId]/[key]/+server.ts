import { json } from '@sveltejs/kit';
import {
	deleteProjectMetadata,
	getProjectMetadata,
	setProjectMetadata,
	type MetadataScope,
} from '$lib/server/project-metadata/project-metadata-service.js';
import {
	acceptWorldbuildCheckpoint,
	rejectWorldbuildCheckpoint,
	reviewWorldbuildCheckpoint,
	upsertWorldbuildCheckpoint,
	WorldbuildCheckpointError,
} from '$lib/ai/pipeline/checkpoint-service.js';
import { OUTLINE_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/outline-checkpoint-contract.js';
import {
	OutlineCheckpointError,
	rejectOutlineDraftCheckpoint,
	reviewOutlineDraftCheckpoint,
	upsertOutlineDraftCheckpoint,
} from '$lib/ai/pipeline/outline-checkpoint-service.js';
import type { RequestHandler } from './$types';

const ALLOWED: ReadonlySet<MetadataScope> = new Set(['scene', 'chapter', 'project', 'pipeline']);

type ValidateOk = {
	ok: true;
	projectId: string;
	scope: MetadataScope;
	ownerId: string;
	key: string;
};
type ValidateErr = { ok: false; response: Response };

type PipelineOperation = 'upsert' | 'review' | 'accept' | 'reject';

interface PipelineMutationBody {
	operation?: unknown;
	value?: unknown;
	reviewer?: unknown;
	note?: unknown;
	acceptedBy?: unknown;
	rejectedBy?: unknown;
	reason?: unknown;
}

function validate(params: Partial<Record<string, string>>): ValidateOk | ValidateErr {
	const { projectId, scope, ownerId, key } = params;
	if (!projectId || !scope || !ownerId || !key) {
		return { ok: false, response: json({ error: 'missing param' }, { status: 400 }) };
	}
	if (!ALLOWED.has(scope as MetadataScope)) {
		return { ok: false, response: json({ error: 'invalid scope' }, { status: 400 }) };
	}
	return { ok: true, projectId, scope: scope as MetadataScope, ownerId, key };
}

function asOptionalString(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function parsePipelineOperation(value: unknown): PipelineOperation {
	if (typeof value !== 'string') return 'upsert';
	if (value === 'upsert' || value === 'review' || value === 'accept' || value === 'reject') {
		return value;
	}
	throw new WorldbuildCheckpointError(
		'invalid_payload',
		`Unsupported pipeline checkpoint operation: ${value}`,
	);
}

function statusForCheckpointError(error: WorldbuildCheckpointError): number {
	// Plan-046 keeps these generic pipeline metadata status codes stable for client branching.
	switch (error.code) {
		case 'not_found':
			return 404;
		case 'invalid_transition':
			return 409;
		case 'invalid_version':
		case 'invalid_payload':
		case 'projection_failed':
		default:
			return 400;
	}
}

function statusForOutlineCheckpointError(error: OutlineCheckpointError): number {
	switch (error.code) {
		case 'not_found':
			return 404;
		case 'invalid_transition':
			return 409;
		case 'invalid_version':
		case 'invalid_payload':
		default:
			return 400;
	}
}

export const GET: RequestHandler = async ({ params }) => {
	const v = validate(params);
	if (!v.ok) return v.response;
	const value = getProjectMetadata<unknown>(v.projectId, v.scope, v.ownerId, v.key);
	if (value === undefined) return json({ value: null });
	return json({ value });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const v = validate(params);
	if (!v.ok) return v.response;

	let body: PipelineMutationBody;
	try {
		body = (await request.json()) as PipelineMutationBody;
	} catch {
		return json({ error: 'invalid json' }, { status: 400 });
	}

	if (v.scope === 'pipeline') {
		try {
			const operation = parsePipelineOperation(body.operation);

			if (v.ownerId === OUTLINE_CHECKPOINT_OWNER_ID) {
				switch (operation) {
					case 'upsert': {
						if (body.value === undefined) {
							return json({ error: 'value is required for upsert operation' }, { status: 400 });
						}
						const checkpoint = upsertOutlineDraftCheckpoint(
							v.projectId,
							v.ownerId,
							v.key,
							body.value,
						);
						return json({ ok: true, checkpoint });
					}
					case 'review': {
						const checkpoint = reviewOutlineDraftCheckpoint(v.projectId, v.ownerId, v.key, {
							reviewer: asOptionalString(body.reviewer),
							note: asOptionalString(body.note),
						});
						return json({ ok: true, checkpoint });
					}
					case 'reject': {
						const checkpoint = rejectOutlineDraftCheckpoint(v.projectId, v.ownerId, v.key, {
							rejectedBy: asOptionalString(body.rejectedBy),
							reason: asOptionalString(body.reason) ?? '',
						});
						return json({ ok: true, checkpoint });
					}
					case 'accept':
						return json(
							{
								error:
									'Outline checkpoint acceptance requires the outline materialization route.',
								code: 'invalid_transition',
							},
							{ status: 409 },
						);
				}
			}

			switch (operation) {
				case 'upsert': {
					if (body.value === undefined) {
						return json({ error: 'value is required for upsert operation' }, { status: 400 });
					}
					const checkpoint = upsertWorldbuildCheckpoint(
						v.projectId,
						v.ownerId,
						v.key,
						body.value,
					);
					return json({ ok: true, checkpoint });
				}
				case 'review': {
					const checkpoint = reviewWorldbuildCheckpoint(v.projectId, v.ownerId, v.key, {
						reviewer: asOptionalString(body.reviewer),
						note: asOptionalString(body.note),
					});
					return json({ ok: true, checkpoint });
				}
				case 'accept': {
					const checkpoint = acceptWorldbuildCheckpoint(v.projectId, v.ownerId, v.key, {
						acceptedBy: asOptionalString(body.acceptedBy),
						note: asOptionalString(body.note),
					});
					return json({ ok: true, checkpoint });
				}
				case 'reject': {
					const checkpoint = rejectWorldbuildCheckpoint(v.projectId, v.ownerId, v.key, {
						rejectedBy: asOptionalString(body.rejectedBy),
						reason: asOptionalString(body.reason) ?? '',
					});
					return json({ ok: true, checkpoint });
				}
			}
		} catch (error) {
			if (error instanceof WorldbuildCheckpointError) {
				return json(
					{ error: error.message, code: error.code },
					{ status: statusForCheckpointError(error) },
				);
			}
			if (error instanceof OutlineCheckpointError) {
				return json(
					{ error: error.message, code: error.code },
					{ status: statusForOutlineCheckpointError(error) },
				);
			}
			throw error;
		}
	}

	setProjectMetadata(v.projectId, v.scope, v.ownerId, v.key, body.value);
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const v = validate(params);
	if (!v.ok) return v.response;
	deleteProjectMetadata(v.projectId, v.scope, v.ownerId, v.key);
	return json({ ok: true });
};
