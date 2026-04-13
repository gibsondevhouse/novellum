import { db } from '$lib/db/index.js';
import type { Chapter } from '$lib/db/types.js';

export async function createChapter(
	data: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Chapter> {
	const now = new Date().toISOString();
	const chapter: Chapter = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
	await db.chapters.add(chapter);
	return chapter;
}

export async function getChapterById(id: string): Promise<Chapter | undefined> {
	return db.chapters.get(id);
}

export async function getChaptersByProjectId(projectId: string): Promise<Chapter[]> {
	return db.chapters.where('projectId').equals(projectId).sortBy('order');
}

export async function updateChapter(
	id: string,
	data: Partial<Omit<Chapter, 'id' | 'createdAt'>>,
): Promise<void> {
	await db.chapters.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function removeChapter(id: string): Promise<void> {
	await db.chapters.delete(id);
}

export async function reorderChapters(_projectId: string, orderedIds: string[]): Promise<void> {
	await db.transaction('rw', db.chapters, async () => {
		for (let i = 0; i < orderedIds.length; i++) {
			await db.chapters.update(orderedIds[i], { order: i, updatedAt: new Date().toISOString() });
		}
	});
}
