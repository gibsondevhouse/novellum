import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { worldbuildCheckpointService, WorldbuildCheckpointError } from '$lib/ai/pipeline/checkpoint-service.js';
import { WORLDBUILD_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';

export const POST: RequestHandler = async ({ params, request }) => {
	const { proposalId } = params;
	if (!proposalId) error(400, 'proposalId is required');

	const body = await request.json().catch(() => ({})) as Record<string, unknown>;
	const projectId = typeof body.projectId === 'string' ? body.projectId : null;

	const checkpoint = worldbuildCheckpointService.getCheckpoint(
		projectId ?? '',
		WORLDBUILD_CHECKPOINT_OWNER_ID,
		proposalId,
	);

	if (!checkpoint) {
		const all = worldbuildCheckpointService.listCheckpoints(
			projectId ?? '%',
			WORLDBUILD_CHECKPOINT_OWNER_ID,
		);
		const found = all.find((c) => c.id === proposalId);
		if (!found) error(404, `Proposal ${proposalId} not found`);
	}

	try {
		const updated = worldbuildCheckpointService.acceptCheckpoint(
			checkpoint?.projectId ?? projectId ?? '',
			WORLDBUILD_CHECKPOINT_OWNER_ID,
			proposalId,
		);
		return json({ ok: true, lifecycle: updated.lifecycle });
	} catch (e) {
		if (e instanceof WorldbuildCheckpointError) {
			error(422, e.message);
		}
		throw e;
	}
};
