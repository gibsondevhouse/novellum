import { createRepository } from '$lib/factories/repository-factory.js';
import type { ChatInstruction } from '$lib/db/domain-types';

const repo = createRepository<ChatInstruction>({
	endpoint: '/api/db/chat_instructions',
	entityName: 'ChatInstruction',
});

export const createChatInstruction = repo.create;
export const getChatInstructionById = repo.getById;
export const getChatInstructionsByProjectId = repo.getByProjectId;
export const updateChatInstruction = repo.update;
export const removeChatInstruction = repo.remove;
