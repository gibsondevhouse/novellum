import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { ChatInstruction } from '$lib/db/types.js';

export async function createChatInstruction(
	data: Omit<ChatInstruction, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<ChatInstruction> {
	return apiPost<ChatInstruction>('/api/db/chat_instructions', data);
}

export async function getChatInstructionById(id: string): Promise<ChatInstruction | undefined> {
	try {
		return await apiGet<ChatInstruction>(`/api/db/chat_instructions/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getChatInstructionsByProjectId(projectId: string): Promise<ChatInstruction[]> {
	return apiGet<ChatInstruction[]>('/api/db/chat_instructions', { projectId });
}

export async function updateChatInstruction(
	id: string,
	data: Partial<Omit<ChatInstruction, 'id' | 'projectId' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/chat_instructions/${id}`, data);
}

export async function removeChatInstruction(id: string): Promise<void> {
	await apiDel(`/api/db/chat_instructions/${id}`);
}
