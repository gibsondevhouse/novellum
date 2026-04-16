import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { Stage } from '$lib/db/types.js';

export async function createStage(
	data: Omit<Stage, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Stage> {
	return apiPost<Stage>('/api/db/stages', data);
}

export async function getStageById(id: string): Promise<Stage | undefined> {
	try {
		return await apiGet<Stage>(`/api/db/stages/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getStagesByBeatId(beatId: string): Promise<Stage[]> {
	return apiGet<Stage[]>('/api/db/stages', { beatId });
}

export async function getStagesByProjectId(projectId: string): Promise<Stage[]> {
	return apiGet<Stage[]>('/api/db/stages', { projectId });
}

export async function updateStage(
	id: string,
	data: Partial<Omit<Stage, 'id' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/stages/${id}`, data);
}

export async function removeStage(id: string): Promise<void> {
	await apiDel(`/api/db/stages/${id}`);
}

export async function reorderStages(_beatId: string, orderedIds: string[]): Promise<void> {
	await apiPut('/api/db/stages/reorder', { orderedIds });
}
