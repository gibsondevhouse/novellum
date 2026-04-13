import { db } from '$lib/db/index.js';
import type { TimelineEvent } from '$lib/db/types.js';

export async function createTimelineEvent(
	data: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<TimelineEvent> {
	const now = new Date().toISOString();
	const event: TimelineEvent = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
	await db.timeline_events.add(event);
	return event;
}

export async function getTimelineEventById(id: string): Promise<TimelineEvent | undefined> {
	return db.timeline_events.get(id);
}

export async function getTimelineEventsByProjectId(projectId: string): Promise<TimelineEvent[]> {
	return db.timeline_events.where('projectId').equals(projectId).toArray();
}

export async function updateTimelineEvent(
	id: string,
	data: Partial<Omit<TimelineEvent, 'id' | 'createdAt'>>,
): Promise<void> {
	await db.timeline_events.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function removeTimelineEvent(id: string): Promise<void> {
	await db.timeline_events.delete(id);
}
