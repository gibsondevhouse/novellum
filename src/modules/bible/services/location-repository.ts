import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { Location } from '$lib/db/types.js';

export async function createLocation(
	data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Location> {
	return apiPost<Location>('/api/db/locations', data);
}

export async function getLocationById(id: string): Promise<Location | undefined> {
	try {
		return await apiGet<Location>(`/api/db/locations/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getLocationsByProjectId(projectId: string): Promise<Location[]> {
	return apiGet<Location[]>('/api/db/locations', { projectId });
}

export async function updateLocation(
	id: string,
	data: Partial<Omit<Location, 'id' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/locations/${id}`, data);
}

export async function removeLocation(id: string): Promise<void> {
	await apiDel(`/api/db/locations/${id}`);
}
