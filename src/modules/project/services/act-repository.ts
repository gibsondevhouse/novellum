import { createRepository } from '$lib/factories/repository-factory.js';
import type { Act } from '$lib/db/types.js';

const repo = createRepository<Act>({
	endpoint: '/api/db/acts',
	entityName: 'Act',
	hasReorder: true,
	queries: { byArcId: 'arcId', byProjectId: 'projectId' },
});

export const createAct = repo.create;
export const getActById = repo.getById;
export const getActsByProjectId = repo.getByProjectId;
export const updateAct = repo.update;
export const removeAct = repo.remove;

export const getActsByArcId = repo.queries.byArcId;

export async function reorderActs(_projectId: string, orderedIds: string[]): Promise<void> {
	await repo.reorder!(orderedIds);
}
