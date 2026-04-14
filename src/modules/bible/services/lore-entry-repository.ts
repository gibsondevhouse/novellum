import { apiGet, apiPost, apiPut, apiDel, ApiError } from '$lib/api-client.js';
import type { LoreEntry } from '$lib/db/types.js';

export async function createLoreEntry(
	data: Omit<LoreEntry, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<LoreEntry> {
	return apiPost<LoreEntry>('/api/db/lore_entries', data);
}

export async function getLoreEntryById(id: string): Promise<LoreEntry | undefined> {
	try {
		return await apiGet<LoreEntry>(`/api/db/lore_entries/${id}`);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function getLoreEntriesByProjectId(projectId: string): Promise<LoreEntry[]> {
	return apiGet<LoreEntry[]>('/api/db/lore_entries', { projectId });
}

export async function getLoreEntriesByCategory(
	projectId: string,
	category: string,
): Promise<LoreEntry[]> {
	return apiGet<LoreEntry[]>('/api/db/lore_entries', { projectId, category });
}

export async function updateLoreEntry(
	id: string,
	data: Partial<Omit<LoreEntry, 'id' | 'createdAt'>>,
): Promise<void> {
	await apiPut(`/api/db/lore_entries/${id}`, data);
}

export async function removeLoreEntry(id: string): Promise<void> {
	await apiDel(`/api/db/lore_entries/${id}`);
}
