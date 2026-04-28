import { createRepository } from '$lib/factories/repository-factory.js';
import type { Chapter } from '$lib/db/types.js';

const repo = createRepository<Chapter>({
	endpoint: '/api/db/chapters',
	entityName: 'Chapter',
	hasReorder: true,
	queries: { byActId: 'actId', byProjectId: 'projectId' },
});

export const createChapter = repo.create;
export const getChapterById = repo.getById;
export const getChaptersByProjectId = repo.getByProjectId;
export const updateChapter = repo.update;
export const removeChapter = repo.remove;

export const getChaptersByActId = repo.queries.byActId;

export async function reorderChapters(_projectId: string, orderedIds: string[]): Promise<void> {
	await repo.reorder!(orderedIds);
}
