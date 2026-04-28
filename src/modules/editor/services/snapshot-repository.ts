import { apiGet, apiPost, apiDel } from '$lib/api-client.js';
import type { SceneSnapshot } from '$lib/db/domain-types';

const MAX_SNAPSHOTS = 20;

export async function createSnapshot(
	sceneId: string,
	projectId: string,
	text: string,
): Promise<void> {
	await apiPost('/api/db/scene_snapshots', { sceneId, projectId, text });

	const allSnapshots = await apiGet<SceneSnapshot[]>('/api/db/scene_snapshots', { sceneId });

	if (allSnapshots.length > MAX_SNAPSHOTS) {
		const excess = allSnapshots.slice(MAX_SNAPSHOTS);
		for (const s of excess) {
			await apiDel(`/api/db/scene_snapshots/${s.id}`);
		}
	}
}

export async function listByScene(sceneId: string): Promise<SceneSnapshot[]> {
	return apiGet<SceneSnapshot[]>('/api/db/scene_snapshots', { sceneId });
}
