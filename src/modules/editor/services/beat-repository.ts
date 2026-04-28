import { createRepository } from '$lib/factories/repository-factory.js';
import type { Beat } from '$lib/db/domain-types';

const repo = createRepository<Beat>({
	endpoint: '/api/db/beats',
	entityName: 'Beat',
	hasReorder: true,
	queries: { bySceneId: 'sceneId', byArcId: 'arcId', byProjectId: 'projectId' },
});

export const createBeat = repo.create;
export const getBeatById = repo.getById;
export const updateBeat = repo.update;
export const removeBeat = repo.remove;

export const getBeatsBySceneId = repo.queries.bySceneId;
export const getBeatsByArcId = repo.queries.byArcId;
export const getBeatsByProjectId = repo.queries.byProjectId;

export async function reorderBeats(_sceneId: string, orderedIds: string[]): Promise<void> {
	await repo.reorder!(orderedIds);
}
