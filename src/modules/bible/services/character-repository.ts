import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { Character, CharacterRelationship } from '$lib/db/types.js';

export async function createCharacter(
	data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Character> {
	return apiPost<Character>('/api/db/characters', data);
}

export async function getCharacterById(id: string): Promise<Character | undefined> {
	try {
		return await apiGet<Character>(`/api/db/characters/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getCharactersByProjectId(projectId: string): Promise<Character[]> {
	return apiGet<Character[]>('/api/db/characters', { projectId });
}

export async function updateCharacter(
	id: string,
	data: Partial<Omit<Character, 'id' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/characters/${id}`, data);
}

export async function removeCharacter(id: string): Promise<void> {
	await apiDel(`/api/db/characters/${id}`);
}

export async function createRelationship(
	data: Omit<CharacterRelationship, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<CharacterRelationship> {
	return apiPost<CharacterRelationship>('/api/db/character_relationships', data);
}

export async function getRelationshipsByProjectId(
	projectId: string,
): Promise<CharacterRelationship[]> {
	return apiGet<CharacterRelationship[]>('/api/db/character_relationships', { projectId });
}

export async function removeRelationship(id: string): Promise<void> {
	await apiDel(`/api/db/character_relationships/${id}`);
}
