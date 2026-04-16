import { createRepository } from '$lib/factories/repository-factory.js';
import { apiGet } from '$lib/api-client.js';
import type { LoreEntry } from '$lib/db/types.js';

const repo = createRepository<LoreEntry>({
	endpoint: '/api/db/lore_entries',
	entityName: 'LoreEntry',
});

export const createLoreEntry = repo.create;
export const getLoreEntryById = repo.getById;
export const getLoreEntriesByProjectId = repo.getByProjectId;
export const updateLoreEntry = repo.update;
export const removeLoreEntry = repo.remove;

export async function getLoreEntriesByCategory(
	projectId: string,
	category: string,
): Promise<LoreEntry[]> {
	return apiGet<LoreEntry[]>('/api/db/lore_entries', { projectId, category });
}
