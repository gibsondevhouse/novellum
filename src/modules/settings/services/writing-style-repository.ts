import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { WritingStyle } from '$lib/db/types.js';

export async function createWritingStyle(
	data: Omit<WritingStyle, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<WritingStyle> {
	return apiPost<WritingStyle>('/api/db/writing_styles', data);
}

export async function getWritingStyleById(id: string): Promise<WritingStyle | undefined> {
	try {
		return await apiGet<WritingStyle>(`/api/db/writing_styles/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getWritingStylesByProjectId(projectId: string): Promise<WritingStyle[]> {
	return apiGet<WritingStyle[]>('/api/db/writing_styles', { projectId });
}

export async function updateWritingStyle(
	id: string,
	data: Partial<Omit<WritingStyle, 'id' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/writing_styles/${id}`, data);
}

export async function removeWritingStyle(id: string): Promise<void> {
	await apiDel(`/api/db/writing_styles/${id}`);
}
