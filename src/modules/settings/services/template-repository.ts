import { createRepository } from '$lib/factories/repository-factory.js';
import type { Template } from '$lib/db/types.js';

const repo = createRepository<Template>({
	endpoint: '/api/db/templates',
	entityName: 'Template',
});

export const createTemplate = repo.create;
export const getTemplateById = repo.getById;
export const getTemplatesByProjectId = repo.getByProjectId;
export const updateTemplate = repo.update;
export const removeTemplate = repo.remove;
