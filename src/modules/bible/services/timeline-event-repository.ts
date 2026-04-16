import { createRepository } from '$lib/factories/repository-factory.js';
import type { TimelineEvent } from '$lib/db/types.js';

const repo = createRepository<TimelineEvent>({
	endpoint: '/api/db/timeline_events',
	entityName: 'TimelineEvent',
});

export const createTimelineEvent = repo.create;
export const getTimelineEventById = repo.getById;
export const getTimelineEventsByProjectId = repo.getByProjectId;
export const updateTimelineEvent = repo.update;
export const removeTimelineEvent = repo.remove;
