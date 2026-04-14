import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { Scene } from '$lib/db/types.js';

export async function createScene(
	data: Omit<Scene, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Scene> {
	return apiPost<Scene>('/api/db/scenes', data);
}

export async function getSceneById(id: string): Promise<Scene | undefined> {
	try {
		return await apiGet<Scene>(`/api/db/scenes/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getScenesByChapterId(chapterId: string): Promise<Scene[]> {
	return apiGet<Scene[]>('/api/db/scenes', { chapterId });
}

export async function getScenesByProjectId(projectId: string): Promise<Scene[]> {
	return apiGet<Scene[]>('/api/db/scenes', { projectId });
}

export async function updateScene(
	id: string,
	data: Partial<Omit<Scene, 'id' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/scenes/${id}`, data);
}

export async function removeScene(id: string): Promise<void> {
	await apiDel(`/api/db/scenes/${id}`);
}

export async function reorderScenes(_chapterId: string, orderedIds: string[]): Promise<void> {
	await apiPut('/api/db/scenes/reorder', { orderedIds });
}
