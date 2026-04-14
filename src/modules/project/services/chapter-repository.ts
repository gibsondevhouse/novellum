import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { Chapter } from '$lib/db/types.js';

export async function createChapter(
	data: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Chapter> {
	return apiPost<Chapter>('/api/db/chapters', data);
}

export async function getChapterById(id: string): Promise<Chapter | undefined> {
	try {
		return await apiGet<Chapter>(`/api/db/chapters/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getChaptersByProjectId(projectId: string): Promise<Chapter[]> {
	return apiGet<Chapter[]>('/api/db/chapters', { projectId });
}

export async function updateChapter(
	id: string,
	data: Partial<Omit<Chapter, 'id' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/chapters/${id}`, data);
}

export async function removeChapter(id: string): Promise<void> {
	await apiDel(`/api/db/chapters/${id}`);
}

export async function reorderChapters(_projectId: string, orderedIds: string[]): Promise<void> {
	await apiPut('/api/db/chapters/reorder', { orderedIds });
}
