import { apiGet, apiPost, apiDel } from '$lib/api-client.js';
import type { SceneSnapshot, SceneSnapshotSource } from '$lib/db/domain-types';

const MAX_SNAPSHOTS = 20;

interface CreateSnapshotOptions {
	source?: SceneSnapshotSource;
	label?: string;
	reason?: string;
}

function countWords(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}

export async function createSnapshot(
	sceneId: string,
	projectId: string,
	text: string,
	options: CreateSnapshotOptions = {},
): Promise<void> {
	await apiPost('/api/db/scene_snapshots', {
		sceneId,
		projectId,
		text,
		wordCount: countWords(text),
		source: options.source ?? 'autosave',
		label: options.label ?? '',
		reason: options.reason ?? '',
	});

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

export interface RestoreResult {
	restoredText: string;
	preRestoreSnapshotId: string;
}

/**
 * Restore a previous snapshot. The server takes a `pre-restore`
 * safety snapshot before returning the target text, so a misclick is
 * always recoverable from the version history.
 */
export async function restoreSnapshot(snapshotId: string): Promise<RestoreResult> {
	return apiPost<RestoreResult>(`/api/db/scene_snapshots/${snapshotId}/restore`, {});
}
