import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

interface SnapshotRow {
	id: string;
	sceneId: string;
	projectId: string;
	text: string;
	createdAt: string;
	wordCount: number;
	label: string;
	source: string;
	reason: string;
}

interface SceneRow {
	id: string;
	projectId: string;
	content: string;
}

function countWords(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}

/**
 * Restore a previous scene snapshot.
 *
 * Captures a fresh `pre-restore` snapshot of the scene's current
 * content before returning the target snapshot text for the editor to
 * apply. The pre-restore snapshot's `reason` records the target
 * snapshot id so the version history reads as a paper trail.
 */
export const POST: RequestHandler = async ({ params }) => {
	const target = db
		.prepare('SELECT * FROM scene_snapshots WHERE id = ?')
		.get(params.id) as SnapshotRow | undefined;

	if (!target) {
		return json({ error: 'Snapshot not found' }, { status: 404 });
	}

	const scene = db
		.prepare('SELECT id, projectId, content FROM scenes WHERE id = ?')
		.get(target.sceneId) as SceneRow | undefined;

	if (!scene) {
		return json({ error: 'Scene not found' }, { status: 404 });
	}

	const now = new Date().toISOString();
	const preRestore: SnapshotRow = {
		id: crypto.randomUUID(),
		sceneId: scene.id,
		projectId: scene.projectId,
		text: scene.content ?? '',
		createdAt: now,
		wordCount: countWords(scene.content ?? ''),
		label: 'Pre-restore safety snapshot',
		source: 'pre-restore',
		reason: `restore_target=${target.id}`,
	};

	db.prepare(
		`INSERT INTO scene_snapshots
			(id, sceneId, projectId, text, createdAt, wordCount, label, source, reason)
		 VALUES
			(@id, @sceneId, @projectId, @text, @createdAt, @wordCount, @label, @source, @reason)`,
	).run(preRestore);

	return json({ restoredText: target.text, preRestoreSnapshotId: preRestore.id });
};
