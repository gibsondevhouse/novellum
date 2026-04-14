import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { Arc } from '$lib/db/types.js';

export async function createArc(data: Omit<Arc, 'id' | 'createdAt' | 'updatedAt'>): Promise<Arc> {
	return apiPost<Arc>('/api/db/arcs', data);
}

export async function getArcById(id: string): Promise<Arc | undefined> {
	try {
		return await apiGet<Arc>(`/api/db/arcs/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getArcsByProjectId(projectId: string): Promise<Arc[]> {
	return apiGet<Arc[]>('/api/db/arcs', { projectId });
}

export async function updateArc(
	id: string,
	data: Partial<Omit<Arc, 'id' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/arcs/${id}`, data);
}

export async function removeArc(id: string): Promise<void> {
	await apiDel(`/api/db/arcs/${id}`);
}

export async function reorderArcs(projectId: string, orderedIds: string[]): Promise<void> {
	await apiPut('/api/db/arcs/reorder', { orderedIds });
}
