import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createRunLedgerRepository } from '$lib/server/agent-runtime/index.js';

export const GET: RequestHandler = async ({ params }) => {
	const details = createRunLedgerRepository().getRunDetails(params.runId);
	if (!details) {
		return json(
			{ error: `Agent run "${params.runId}" was not found.`, code: 'run_not_found' },
			{ status: 404 },
		);
	}
	return json(details);
};
