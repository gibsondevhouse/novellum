import { createRepository } from '$lib/factories/repository-factory.js';
import type { Scene } from '$lib/db/types.js';

const repo = createRepository<Scene>({
	endpoint: '/api/db/scenes',
	entityName: 'Scene',
	hasReorder: true,
	queries: { byChapterId: 'chapterId', byProjectId: 'projectId' },
});

export const createScene = repo.create;
export const getSceneById = repo.getById;
export const updateScene = repo.update;
export const removeScene = repo.remove;

export const getScenesByChapterId = repo.queries.byChapterId;
export const getScenesByProjectId = repo.queries.byProjectId;

export async function reorderScenes(_chapterId: string, orderedIds: string[]): Promise<void> {
	await repo.reorder!(orderedIds);
}
