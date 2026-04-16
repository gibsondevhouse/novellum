import { createRepository } from '$lib/factories/repository-factory.js';
import type { SystemPrompt } from '$lib/db/types.js';

const repo = createRepository<SystemPrompt>({
	endpoint: '/api/db/system_prompts',
	entityName: 'SystemPrompt',
});

export const createSystemPrompt = repo.create;
export const getSystemPromptById = repo.getById;
export const getSystemPromptsByProjectId = repo.getByProjectId;
export const updateSystemPrompt = repo.update;
export const removeSystemPrompt = repo.remove;
