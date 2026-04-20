import { getTimelineEventsByProjectId } from '$modules/bible/services/timeline-event-repository.js';
import { getCharactersByProjectId } from '$modules/bible/services/character-repository.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const [timelineEvents, characters] = await Promise.all([
		getTimelineEventsByProjectId(params.id),
		getCharactersByProjectId(params.id),
	]);
	const sorted = [...timelineEvents].sort((a, b) => a.date.localeCompare(b.date));
	return { projectId: params.id, timelineEvents: sorted, characters };
};
