import { db } from '$lib/db/index.js';
import type { ConsistencyIssue } from '$lib/db/types.js';

export async function createIssue(
	data: Omit<ConsistencyIssue, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<ConsistencyIssue> {
	const now = new Date().toISOString();
	const issue: ConsistencyIssue = {
		...data,
		id: crypto.randomUUID(),
		createdAt: now,
		updatedAt: now,
	};
	await db.consistency_issues.add(issue);
	return issue;
}

export async function getIssuesByProjectId(projectId: string): Promise<ConsistencyIssue[]> {
	return db.consistency_issues.where('projectId').equals(projectId).sortBy('createdAt');
}

export async function getOpenIssuesByProjectId(projectId: string): Promise<ConsistencyIssue[]> {
	return db.consistency_issues
		.where('projectId')
		.equals(projectId)
		.filter((i) => i.status === 'open')
		.sortBy('createdAt');
}

export async function updateIssueStatus(
	id: string,
	status: ConsistencyIssue['status'],
): Promise<void> {
	await db.consistency_issues.update(id, { status, updatedAt: new Date().toISOString() });
}

export async function removeIssue(id: string): Promise<void> {
	await db.consistency_issues.delete(id);
}
