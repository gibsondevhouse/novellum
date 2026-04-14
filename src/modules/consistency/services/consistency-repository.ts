import { apiGet, apiPost, apiPut, apiDel } from '$lib/api-client.js';
import type { ConsistencyIssue } from '$lib/db/types.js';

export async function createIssue(
	data: Omit<ConsistencyIssue, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<ConsistencyIssue> {
	return apiPost<ConsistencyIssue>('/api/db/consistency_issues', data);
}

export async function getIssuesByProjectId(projectId: string): Promise<ConsistencyIssue[]> {
	return apiGet<ConsistencyIssue[]>('/api/db/consistency_issues', { projectId });
}

export async function getOpenIssuesByProjectId(projectId: string): Promise<ConsistencyIssue[]> {
	return apiGet<ConsistencyIssue[]>('/api/db/consistency_issues', { projectId, status: 'open' });
}

export async function updateIssueStatus(
	id: string,
	status: ConsistencyIssue['status'],
): Promise<void> {
	await apiPut(`/api/db/consistency_issues/${id}`, { status });
}

export async function removeIssue(id: string): Promise<void> {
	await apiDel(`/api/db/consistency_issues/${id}`);
}
