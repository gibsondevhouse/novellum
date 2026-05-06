import type { ConsistencyIssue } from '$lib/db/domain-types';
import { getIssuesByProjectId, updateIssueStatus } from '../services/continuity-repository.js';

let issues: ConsistencyIssue[] = $state([]);
const openIssues: ConsistencyIssue[] = $derived(issues.filter((i) => i.status === 'open'));
const openCount: number = $derived(openIssues.length);

export async function loadIssues(projectId: string): Promise<void> {
	issues = await getIssuesByProjectId(projectId);
}

export async function refreshIssues(projectId: string): Promise<void> {
	return loadIssues(projectId);
}

export async function resolveIssue(id: string): Promise<void> {
	await updateIssueStatus(id, 'resolved');
	issues = issues.map(
		(i) => (i.id === id ? { ...i, status: 'resolved', updatedAt: new Date().toISOString() } : i), // eslint-disable-line svelte/prefer-svelte-reactivity
	);
}

export async function dismissIssue(id: string): Promise<void> {
	await updateIssueStatus(id, 'dismissed');
	issues = issues.map(
		(i) => (i.id === id ? { ...i, status: 'dismissed', updatedAt: new Date().toISOString() } : i), // eslint-disable-line svelte/prefer-svelte-reactivity
	);
}

export async function reopenIssue(id: string): Promise<void> {
	await updateIssueStatus(id, 'open');
	issues = issues.map(
		(i) => (i.id === id ? { ...i, status: 'open', updatedAt: new Date().toISOString() } : i), // eslint-disable-line svelte/prefer-svelte-reactivity
	);
}

export function getIssues(): ConsistencyIssue[] {
	return issues;
}

export function getOpenIssues(): ConsistencyIssue[] {
	return openIssues;
}

export function getOpenCount(): number {
	return openCount;
}
