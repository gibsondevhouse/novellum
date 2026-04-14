import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { TimelineEvent } from '$lib/db/types.js';

export async function createTimelineEvent(
	data: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<TimelineEvent> {
	return apiPost<TimelineEvent>('/api/db/timeline_events', data);
}

export async function getTimelineEventById(id: string): Promise<TimelineEvent | undefined> {
	try {
		return await apiGet<TimelineEvent>(`/api/db/timeline_events/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getTimelineEventsByProjectId(projectId: string): Promise<TimelineEvent[]> {
	return apiGet<TimelineEvent[]>('/api/db/timeline_events', { projectId });
}

export async function updateTimelineEvent(
	id: string,
	data: Partial<Omit<TimelineEvent, 'id' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/timeline_events/${id}`, data);
}

export async function removeTimelineEvent(id: string): Promise<void> {
	await apiDel(`/api/db/timeline_events/${id}`);
}
