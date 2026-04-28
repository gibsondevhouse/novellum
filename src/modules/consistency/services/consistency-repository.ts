import { createRepository } from '$lib/factories/repository-factory.js';
import { apiGet, apiPut } from '$lib/api-client.js';
import type { ConsistencyIssue } from '$lib/db/domain-types';

const repo = createRepository<ConsistencyIssue>({
	endpoint: '/api/db/consistency_issues',
	entityName: 'ConsistencyIssue',
});

export const createIssue = repo.create;
export const getIssuesByProjectId = repo.getByProjectId;
export const removeIssue = repo.remove;

export async function getOpenIssuesByProjectId(projectId: string): Promise<ConsistencyIssue[]> {
	return apiGet<ConsistencyIssue[]>('/api/db/consistency_issues', { projectId, status: 'open' });
}

export async function updateIssueStatus(
	id: string,
	status: ConsistencyIssue['status'],
): Promise<void> {
	await apiPut(`/api/db/consistency_issues/${id}`, { status });
}
