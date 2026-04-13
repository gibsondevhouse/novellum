import { db } from '$lib/db/index.js';
import type { SceneSnapshot } from '$lib/db/types.js';

const MAX_SNAPSHOTS = 20;

export async function createSnapshot(
	sceneId: string,
	projectId: string,
	text: string,
): Promise<void> {
	const snapshot: SceneSnapshot = {
		id: crypto.randomUUID(),
		sceneId,
		projectId,
		text,
		createdAt: new Date().toISOString(),
	};
	await db.scene_snapshots.add(snapshot);

	const allSnapshots = await db.scene_snapshots
		.where('sceneId')
		.equals(sceneId)
		.sortBy('createdAt');

	if (allSnapshots.length > MAX_SNAPSHOTS) {
		const excess = allSnapshots.slice(0, allSnapshots.length - MAX_SNAPSHOTS);
		await db.scene_snapshots.bulkDelete(excess.map((s) => s.id));
	}
}

export async function listByScene(sceneId: string): Promise<SceneSnapshot[]> {
	const snapshots = await db.scene_snapshots.where('sceneId').equals(sceneId).sortBy('createdAt');
	return snapshots.reverse();
}
