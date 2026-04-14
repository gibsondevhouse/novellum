import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ params }) => {
	const row = db.prepare('SELECT * FROM scene_snapshots WHERE id = ?').get(params.id);
	if (!row) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	return json(row);
};

export const DELETE: RequestHandler = async ({ params }) => {
	db.prepare('DELETE FROM scene_snapshots WHERE id = ?').run(params.id);
	return new Response(null, { status: 204 });
};
