import { createRepository } from '$lib/factories/repository-factory.js';
import type { WritingStyle } from '$lib/db/types.js';

const repo = createRepository<WritingStyle>({
	endpoint: '/api/db/writing_styles',
	entityName: 'WritingStyle',
});

export const createWritingStyle = repo.create;
export const getWritingStyleById = repo.getById;
export const getWritingStylesByProjectId = repo.getByProjectId;
export const updateWritingStyle = repo.update;
export const removeWritingStyle = repo.remove;
