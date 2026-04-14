import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

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
	const body = await request.json();

	if (!body.sceneId || !body.projectId || !body.text) {
		return json({ error: 'sceneId, projectId, and text are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const snapshot = {
		id: crypto.randomUUID(),
		sceneId: body.sceneId,
		projectId: body.projectId,
		text: body.text,
		createdAt: now,
	};

	db.prepare(
		`INSERT INTO scene_snapshots (id, sceneId, projectId, text, createdAt)
		 VALUES (@id, @sceneId, @projectId, @text, @createdAt)`,
	).run(snapshot);

	return json(snapshot, { status: 201 });
};
