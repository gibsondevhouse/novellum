import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	OutlineMaterializationServiceError,
	acceptOutlineCheckpointMaterialization,
} from '$lib/server/outline/outline-materialization-service.js';

interface AcceptBody {
	projectId?: unknown;
	acceptedBy?: unknown;
	note?: unknown;
	expectedUpdatedAt?: unknown;
	expectedVersion?: unknown;
	selectedNodeIds?: unknown;
}

function asOptionalString(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function asOptionalStringArray(value: unknown): string[] | undefined {
	if (value === undefined) return undefined;
	if (!Array.isArray(value)) {
		throw new OutlineMaterializationServiceError(
			'invalid_request',
			'selectedNodeIds must be an array of outline node ids.',
			400,
		);
	}
	return value.map((item) => (typeof item === 'string' ? item : ''));
}

function errorResponse(error: OutlineMaterializationServiceError): Response {
	return json(
		{
			error: error.message,
			code: error.code,
			...(error.meta ? { meta: error.meta } : {}),
		},
		{ status: error.status },
	);
}

export const POST: RequestHandler = async ({ params, request }) => {
	let body: AcceptBody;
	try {
		body = (await request.json()) as AcceptBody;
	} catch {
		return json({ error: 'Invalid JSON body.', code: 'invalid_json' }, { status: 400 });
	}

	try {
		const result = acceptOutlineCheckpointMaterialization({
			projectId: asOptionalString(body.projectId) ?? '',
			checkpointId: params.checkpointId ?? '',
			acceptedBy: asOptionalString(body.acceptedBy),
			note: asOptionalString(body.note),
			expectedUpdatedAt: asOptionalString(body.expectedUpdatedAt),
			expectedVersion: asOptionalString(body.expectedVersion),
			selectedNodeIds: asOptionalStringArray(body.selectedNodeIds),
		});
		return json({
			ok: true,
			checkpoint: result.checkpoint,
			materialization: {
				counts: result.materialization.counts,
			},
		});
	} catch (error) {
		if (error instanceof OutlineMaterializationServiceError) {
			return errorResponse(error);
		}
		throw error;
	}
};
