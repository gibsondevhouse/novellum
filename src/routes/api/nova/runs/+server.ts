import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	AgentRunLedgerError,
	createRunLedgerRepository,
	type AgentRunStatus,
} from '$lib/server/agent-runtime/index.js';

function parseLimit(value: string | null): number | undefined {
	if (!value) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

export const GET: RequestHandler = async ({ url }) => {
	const repository = createRunLedgerRepository();
	try {
		const runs = repository.listRuns({
			projectId: url.searchParams.get('projectId') ?? undefined,
			status: (url.searchParams.get('status') ?? undefined) as AgentRunStatus | undefined,
			family: url.searchParams.get('family') ?? undefined,
			limit: parseLimit(url.searchParams.get('limit')),
		});
		return json({ runs });
	} catch (err) {
		if (err instanceof AgentRunLedgerError && err.code === 'invalid_status') {
			return json({ error: err.message, code: err.code }, { status: 400 });
		}
		throw err;
	}
};
