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

const VALID_SOURCES = new Set(['autosave', 'manual', 'pre-restore', 'pre-migration']);

function countWords(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}

export const GET: RequestHandler = async ({ url }) => {
	const sceneId = url.searchParams.get('sceneId');
	if (!sceneId) {
		return json({ error: 'sceneId is required' }, { status: 400 });
	}

	const rows = db
		.prepare('SELECT * FROM scene_snapshots WHERE sceneId = ? ORDER BY createdAt DESC')
		.all(sceneId);

	return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Partial<SnapshotRow>;

	if (!body.sceneId || !body.projectId || typeof body.text !== 'string') {
		return json({ error: 'sceneId, projectId, and text are required' }, { status: 400 });
	}

	const source =
		typeof body.source === 'string' && VALID_SOURCES.has(body.source) ? body.source : 'autosave';

	// Near-duplicate suppression: skip an autosave snapshot when the
	// most recent snapshot for this scene already holds the same text.
	// Manual / pre-restore / pre-migration always insert because each
	// of those represents an explicit safety event.
	if (source === 'autosave') {
		const last = db
			.prepare(
				'SELECT text FROM scene_snapshots WHERE sceneId = ? ORDER BY createdAt DESC LIMIT 1',
			)
			.get(body.sceneId) as { text: string } | undefined;
		if (last && last.text === body.text) {
			return json({ skipped: true }, { status: 200 });
		}
	}

	const now = new Date().toISOString();
	const snapshot: SnapshotRow = {
		id: crypto.randomUUID(),
		sceneId: body.sceneId,
		projectId: body.projectId,
		text: body.text,
		createdAt: now,
		wordCount: typeof body.wordCount === 'number' ? body.wordCount : countWords(body.text),
		label: typeof body.label === 'string' ? body.label : '',
		source,
		reason: typeof body.reason === 'string' ? body.reason : '',
	};

	db.prepare(
		`INSERT INTO scene_snapshots
			(id, sceneId, projectId, text, createdAt, wordCount, label, source, reason)
		 VALUES
			(@id, @sceneId, @projectId, @text, @createdAt, @wordCount, @label, @source, @reason)`,
	).run(snapshot);

	return json(snapshot, { status: 201 });
};
