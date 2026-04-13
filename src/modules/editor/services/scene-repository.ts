import { db } from '$lib/db/index.js';
import type { Scene } from '$lib/db/types.js';

export async function createScene(
	data: Omit<Scene, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Scene> {
	const now = new Date().toISOString();
	const scene: Scene = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
	await db.scenes.add(scene);
	return scene;
}

export async function getSceneById(id: string): Promise<Scene | undefined> {
	return db.scenes.get(id);
}

export async function getScenesByChapterId(chapterId: string): Promise<Scene[]> {
	return db.scenes.where('chapterId').equals(chapterId).sortBy('order');
}

export async function getScenesByProjectId(projectId: string): Promise<Scene[]> {
	return db.scenes.where('projectId').equals(projectId).sortBy('order');
}

export async function updateScene(
	id: string,
	data: Partial<Omit<Scene, 'id' | 'createdAt'>>,
): Promise<void> {
	await db.scenes.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function removeScene(id: string): Promise<void> {
	await db.scenes.delete(id);
}

export async function reorderScenes(_chapterId: string, orderedIds: string[]): Promise<void> {
	await db.transaction('rw', db.scenes, async () => {
		for (let i = 0; i < orderedIds.length; i++) {
			await db.scenes.update(orderedIds[i], { order: i, updatedAt: new Date().toISOString() });
		}
	});
}
