import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AgentWorkerError, createAgentRuntimeWorker } from '$lib/server/agent-runtime/index.js';

interface CancelBody {
	reason?: unknown;
}

export const POST: RequestHandler = async ({ params, request }) => {
	const body = (await request.json().catch(() => ({}))) as CancelBody;
	const reason =
		typeof body.reason === 'string' && body.reason.trim()
			? body.reason.trim().slice(0, 500)
			: 'Cancelled by user.';

	try {
		const result = createAgentRuntimeWorker().cancelRun(params.runId, reason);
		return json(result);
	} catch (err) {
		if (err instanceof AgentWorkerError && err.code === 'run_not_found') {
			return json({ error: err.message, code: err.code }, { status: 404 });
		}
		throw err;
	}
};
