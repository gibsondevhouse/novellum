import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { Beat } from '$lib/db/types.js';

export async function createBeat(
	data: Omit<Beat, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Beat> {
	return apiPost<Beat>('/api/db/beats', data);
}

export async function getBeatById(id: string): Promise<Beat | undefined> {
	try {
		return await apiGet<Beat>(`/api/db/beats/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getBeatsBySceneId(sceneId: string): Promise<Beat[]> {
	return apiGet<Beat[]>('/api/db/beats', { sceneId });
}

export async function getBeatsByArcId(arcId: string): Promise<Beat[]> {
	return apiGet<Beat[]>('/api/db/beats', { arcId });
}

export async function getBeatsByProjectId(projectId: string): Promise<Beat[]> {
	return apiGet<Beat[]>('/api/db/beats', { projectId });
}

export async function updateBeat(
	id: string,
	data: Partial<Omit<Beat, 'id' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/beats/${id}`, data);
}

export async function removeBeat(id: string): Promise<void> {
	await apiDel(`/api/db/beats/${id}`);
}

export async function reorderBeats(_sceneId: string, orderedIds: string[]): Promise<void> {
	await apiPut('/api/db/beats/reorder', { orderedIds });
}
