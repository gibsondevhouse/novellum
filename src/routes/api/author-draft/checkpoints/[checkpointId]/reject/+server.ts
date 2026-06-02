import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	rejectAuthorDraftCheckpoint,
	AuthorDraftCheckpointError,
} from '$lib/ai/pipeline/author-draft-checkpoint-service.js';

function statusForError(err: AuthorDraftCheckpointError): number {
	switch (err.code) {
		case 'not_found':
		case 'scene_not_found':
			return 404;
		case 'invalid_transition':
			return 409;
		case 'invalid_payload':
			return 422;
		default:
			return 500;
	}
}

export const POST: RequestHandler = async ({ params, request }) => {
	const checkpointId = params.checkpointId;
	if (!checkpointId) error(400, 'checkpointId is required');

	const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
	const projectId = typeof body.projectId === 'string' ? body.projectId : '';
	const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

	if (!projectId) error(400, 'projectId is required');
	if (!reason) error(400, 'reason is required');

	try {
		const checkpoint = rejectAuthorDraftCheckpoint({ projectId, checkpointId, reason });
		return json({ ok: true, checkpoint });
	} catch (err) {
		if (err instanceof AuthorDraftCheckpointError) {
			const status = statusForError(err);
			return json(
				{ ok: false, error: { code: err.code, message: err.message, meta: err.meta } },
				{ status },
			);
		}
		throw err;
	}
};

