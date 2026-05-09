import { executeContinuityCheck } from '$lib/ai/continuity-agent.js';
import { resolveTask } from '$lib/ai/task-resolver.js';
import { apiPost } from '$lib/api-client.js';
import type { ConsistencyIssue } from '$lib/db/domain-types';
import type { UiContext } from '$lib/ai/types.js';

export interface RunCheckResult {
	created: number;
	issues: ConsistencyIssue[];
}

/**
 * Runs an AI continuity check for the project and persists any new
 * issues to the database. Returns the list of newly created issues.
 */
export async function runContinuityCheck(projectId: string): Promise<RunCheckResult> {
	const uiCtx: UiContext = {
		activeProjectId: projectId,
		activeSceneId: null,
		activeChapterId: null,
		activeBeatId: null,
	};
	const task = resolveTask('continuity_check', uiCtx);
	const partials = await executeContinuityCheck(projectId, task);

	const created: ConsistencyIssue[] = [];
	for (const partial of partials) {
		const issue = await apiPost<ConsistencyIssue>('/api/db/consistency_issues', {
			projectId,
			...partial,
			entityIds: partial.entityIds ?? [],
		});
		created.push(issue);
	}

	return { created: created.length, issues: created };
}
