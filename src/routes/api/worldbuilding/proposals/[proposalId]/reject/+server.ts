import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	rejectProposalAtomically,
	worldbuildCheckpointService,
	WorldbuildCheckpointError,
} from '$lib/ai/pipeline/checkpoint-service.js';
import {
	WORLDBUILD_CHECKPOINT_OWNER_ID,
	WORLDBUILD_PROPOSAL_OWNER_ID,
} from '$lib/ai/pipeline/checkpoint-contract.js';
import { getProjectMetadata } from '$lib/server/project-metadata/project-metadata-service.js';
import type { WorldbuildCheckpointErrorCode } from '$lib/ai/pipeline/checkpoint-service.js';
import type { WorldbuildProposalRecord } from '$lib/ai/pipeline/worldbuild-proposal-schema.js';

function statusForProposalError(code: WorldbuildCheckpointErrorCode): number {
	if (code === 'not_found') return 404;
	return 422;
}

export const POST: RequestHandler = async ({ params, request }) => {
	const { proposalId } = params;
	if (!proposalId) error(400, 'proposalId is required');

	const body = await request.json().catch(() => ({})) as Record<string, unknown>;
	const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
	const projectId = typeof body.projectId === 'string' ? body.projectId : null;

	if (!reason) error(400, 'reason is required');

	if (projectId) {
		const proposal = getProjectMetadata<WorldbuildProposalRecord>(
			projectId,
			'pipeline',
			WORLDBUILD_PROPOSAL_OWNER_ID,
			proposalId,
		);
		if (proposal) {
			const result = rejectProposalAtomically(projectId, proposalId, { reason });
			if (result.ok) return json({ ok: true, proposal: result.proposal });
			error(statusForProposalError(result.code), result.error);
		}
	}

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
		const updated = worldbuildCheckpointService.rejectCheckpoint(
			checkpoint?.projectId ?? projectId ?? '',
			WORLDBUILD_CHECKPOINT_OWNER_ID,
			proposalId,
			{ reason },
		);
		return json({ ok: true, lifecycle: updated.lifecycle });
	} catch (e) {
		if (e instanceof WorldbuildCheckpointError) {
			error(422, e.message);
		}
		throw e;
	}
};
