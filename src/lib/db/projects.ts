import { apiPost } from '$lib/api-client.js';
import type { Project } from './domain-types';

export async function createProject(title = 'Untitled Project'): Promise<string> {
	const project = await apiPost<Project>('/api/db/projects', { title });
	return project.id;
}
