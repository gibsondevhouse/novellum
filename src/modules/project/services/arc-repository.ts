import { createRepository } from '$lib/factories/repository-factory.js';
import type { Arc } from '$lib/db/types.js';

const repo = createRepository<Arc>({
	endpoint: '/api/db/arcs',
	entityName: 'Arc',
	hasReorder: true,
});

export const createArc = repo.create;
export const getArcById = repo.getById;
export const getArcsByProjectId = repo.getByProjectId;
export const updateArc = repo.update;
export const removeArc = repo.remove;

export async function reorderArcs(projectId: string, orderedIds: string[]): Promise<void> {
	await repo.reorder!(orderedIds);
}
