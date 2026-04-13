import { db } from '$lib/db/index.js';
import type { Beat } from '$lib/db/types.js';

export async function createBeat(
	data: Omit<Beat, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Beat> {
	const now = new Date().toISOString();
	const beat: Beat = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
	await db.beats.add(beat);
	return beat;
}

export async function getBeatById(id: string): Promise<Beat | undefined> {
	return db.beats.get(id);
}

export async function getBeatsBySceneId(sceneId: string): Promise<Beat[]> {
	return db.beats.where('sceneId').equals(sceneId).sortBy('order');
}

export async function getBeatsByProjectId(projectId: string): Promise<Beat[]> {
	return db.beats.where('projectId').equals(projectId).sortBy('order');
}

export async function updateBeat(
	id: string,
	data: Partial<Omit<Beat, 'id' | 'createdAt'>>,
): Promise<void> {
	await db.beats.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function removeBeat(id: string): Promise<void> {
	await db.beats.delete(id);
}

export async function reorderBeats(_sceneId: string, orderedIds: string[]): Promise<void> {
	await db.transaction('rw', db.beats, async () => {
		for (let i = 0; i < orderedIds.length; i++) {
			await db.beats.update(orderedIds[i], { order: i, updatedAt: new Date().toISOString() });
		}
	});
}
