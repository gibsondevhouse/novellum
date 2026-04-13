import { db } from '$lib/db/index.js';
import type { LoreEntry } from '$lib/db/types.js';

export async function createLoreEntry(
	data: Omit<LoreEntry, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<LoreEntry> {
	const now = new Date().toISOString();
	const entry: LoreEntry = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
	await db.lore_entries.add(entry);
	return entry;
}

export async function getLoreEntryById(id: string): Promise<LoreEntry | undefined> {
	return db.lore_entries.get(id);
}

export async function getLoreEntriesByProjectId(projectId: string): Promise<LoreEntry[]> {
	return db.lore_entries.where('projectId').equals(projectId).toArray();
}

export async function getLoreEntriesByCategory(
	projectId: string,
	category: string,
): Promise<LoreEntry[]> {
	return db.lore_entries
		.where('projectId')
		.equals(projectId)
		.and((entry) => entry.category === category)
		.toArray();
}

export async function updateLoreEntry(
	id: string,
	data: Partial<Omit<LoreEntry, 'id' | 'createdAt'>>,
): Promise<void> {
	await db.lore_entries.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function removeLoreEntry(id: string): Promise<void> {
	await db.lore_entries.delete(id);
}
