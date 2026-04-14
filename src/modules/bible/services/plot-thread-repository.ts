import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { PlotThread } from '$lib/db/types.js';

export async function createPlotThread(
	data: Omit<PlotThread, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<PlotThread> {
	return apiPost<PlotThread>('/api/db/plot_threads', data);
}

export async function getPlotThreadById(id: string): Promise<PlotThread | undefined> {
	try {
		return await apiGet<PlotThread>(`/api/db/plot_threads/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getPlotThreadsByProjectId(projectId: string): Promise<PlotThread[]> {
	return apiGet<PlotThread[]>('/api/db/plot_threads', { projectId });
}

export async function updatePlotThread(
	id: string,
	data: Partial<Omit<PlotThread, 'id' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/plot_threads/${id}`, data);
}

export async function removePlotThread(id: string): Promise<void> {
	await apiDel(`/api/db/plot_threads/${id}`);
}
