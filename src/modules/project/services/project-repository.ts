import { createRepository } from '$lib/factories/repository-factory.js';
import { apiGet } from '$lib/api-client.js';
import type { Project } from '$lib/db/domain-types';

const repo = createRepository<Project>({
	endpoint: '/api/db/projects',
	entityName: 'Project',
});

export const createProject = repo.create;
export const getProjectById = repo.getById;
export const updateProject = repo.update;
export const removeProject = repo.remove;

export async function getAllProjects(): Promise<Project[]> {
	return apiGet<Project[]>('/api/db/projects');
}
