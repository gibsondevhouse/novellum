import { db } from '$lib/db/index.js';
import type { Character, CharacterRelationship } from '$lib/db/types.js';

export async function createCharacter(
	data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Character> {
	const now = new Date().toISOString();
	const character: Character = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
	await db.characters.add(character);
	return character;
}

export async function getCharacterById(id: string): Promise<Character | undefined> {
	return db.characters.get(id);
}

export async function getCharactersByProjectId(projectId: string): Promise<Character[]> {
	return db.characters.where('projectId').equals(projectId).toArray();
}

export async function updateCharacter(
	id: string,
	data: Partial<Omit<Character, 'id' | 'createdAt'>>,
): Promise<void> {
	await db.characters.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function removeCharacter(id: string): Promise<void> {
	await db.characters.delete(id);
}

export async function createRelationship(
	data: Omit<CharacterRelationship, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<CharacterRelationship> {
	const now = new Date().toISOString();
	const relationship: CharacterRelationship = {
		...data,
		id: crypto.randomUUID(),
		createdAt: now,
		updatedAt: now,
	};
	await db.character_relationships.add(relationship);
	return relationship;
}

export async function getRelationshipsByProjectId(
	projectId: string,
): Promise<CharacterRelationship[]> {
	return db.character_relationships.where('projectId').equals(projectId).toArray();
}

export async function removeRelationship(id: string): Promise<void> {
	await db.character_relationships.delete(id);
}
