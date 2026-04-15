import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { SystemPrompt } from '$lib/db/types.js';

export async function createSystemPrompt(
	data: Omit<SystemPrompt, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<SystemPrompt> {
	return apiPost<SystemPrompt>('/api/db/system_prompts', data);
}

export async function getSystemPromptById(id: string): Promise<SystemPrompt | undefined> {
	try {
		return await apiGet<SystemPrompt>(`/api/db/system_prompts/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getSystemPromptsByProjectId(projectId: string): Promise<SystemPrompt[]> {
	return apiGet<SystemPrompt[]>('/api/db/system_prompts', { projectId });
}

export async function updateSystemPrompt(
	id: string,
	data: Partial<Omit<SystemPrompt, 'id' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/system_prompts/${id}`, data);
}

export async function removeSystemPrompt(id: string): Promise<void> {
	await apiDel(`/api/db/system_prompts/${id}`);
}
