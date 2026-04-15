import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { Template } from '$lib/db/types.js';

export async function createTemplate(
	data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Template> {
	return apiPost<Template>('/api/db/templates', data);
}

export async function getTemplateById(id: string): Promise<Template | undefined> {
	try {
		return await apiGet<Template>(`/api/db/templates/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getTemplatesByProjectId(projectId: string): Promise<Template[]> {
	return apiGet<Template[]>('/api/db/templates', { projectId });
}

export async function updateTemplate(
	id: string,
	data: Partial<Omit<Template, 'id' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/templates/${id}`, data);
}

export async function removeTemplate(id: string): Promise<void> {
	await apiDel(`/api/db/templates/${id}`);
}
