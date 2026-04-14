import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { Project } from '$lib/db/types.js';

export async function createProject(
	data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Project> {
	return apiPost<Project>('/api/db/projects', data);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
	try {
		return await apiGet<Project>(`/api/db/projects/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getAllProjects(): Promise<Project[]> {
	return apiGet<Project[]>('/api/db/projects');
}

export async function updateProject(
	id: string,
	data: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/projects/${id}`, data);
}

export async function removeProject(id: string): Promise<void> {
	await apiDel(`/api/db/projects/${id}`);
}
