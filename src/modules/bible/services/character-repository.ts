import { createRepository } from '$lib/factories/repository-factory.js';
import { apiGet, apiPost, apiPut, apiDel } from '$lib/api-client.js';
import type { Character, CharacterRelationship } from '$lib/db/types.js';

const repo = createRepository<Character>({
	endpoint: '/api/db/characters',
	entityName: 'Character',
});

export const createCharacter = repo.create;
export const getCharacterById = repo.getById;
export const getCharactersByProjectId = repo.getByProjectId;
export const updateCharacter = repo.update;
export const removeCharacter = repo.remove;

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

export async function updateRelationship(
	id: string,
	data: { type: string; description: string; status?: string },
): Promise<CharacterRelationship> {
	return apiPut<CharacterRelationship>(`/api/db/character_relationships/${id}`, data);
}
