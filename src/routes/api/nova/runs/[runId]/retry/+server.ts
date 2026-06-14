import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AgentWorkerError, createAgentRuntimeWorker } from '$lib/server/agent-runtime/index.js';

interface RetryBody {
	runAfter?: unknown;
}

export const POST: RequestHandler = async ({ params, request }) => {
	const body = (await request.json().catch(() => ({}))) as RetryBody;
	const runAfter = typeof body.runAfter === 'string' && body.runAfter.trim() ? body.runAfter : null;

	try {
		const result = createAgentRuntimeWorker().retryRun(params.runId, runAfter);
		return json(result, { status: 202 });
	} catch (err) {
		if (err instanceof AgentWorkerError) {
			const status = err.code === 'run_not_found' ? 404 : 409;
			return json({ error: err.message, code: err.code }, { status });
		}
		throw err;
	}
};
