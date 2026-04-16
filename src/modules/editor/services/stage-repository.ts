import { createRepository } from '$lib/factories/repository-factory.js';
import type { Stage } from '$lib/db/types.js';

const repo = createRepository<Stage>({
	endpoint: '/api/db/stages',
	entityName: 'Stage',
	hasReorder: true,
	queries: { byBeatId: 'beatId', byProjectId: 'projectId' },
});

export const createStage = repo.create;
export const getStageById = repo.getById;
export const updateStage = repo.update;
export const removeStage = repo.remove;

export const getStagesByBeatId = repo.queries.byBeatId;
export const getStagesByProjectId = repo.queries.byProjectId;

export async function reorderStages(_beatId: string, orderedIds: string[]): Promise<void> {
	await repo.reorder!(orderedIds);
}
