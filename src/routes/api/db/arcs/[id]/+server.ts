import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ params }) => {
	const row = db.prepare('SELECT * FROM arcs WHERE id = ?').get(params.id);
	if (!row) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	return json(row);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const updates: Record<string, unknown> = {};
	const simpleAllowed = ['title', 'description', 'purpose', 'arcType'];

	for (const key of simpleAllowed) {
		if (key in body) updates[key] = body[key];
	}

	if ('order' in body) updates.order = body.order;

	updates.updatedAt = new Date().toISOString();

	const setClauses = Object.keys(updates).map((k) =>
		k === 'order' ? `"order" = @${k}` : `${k} = @${k}`,
	);
	const stmt = db.prepare(`UPDATE arcs SET ${setClauses.join(', ')} WHERE id = @id`);
	const result = stmt.run({ ...updates, id: params.id });

	if (result.changes === 0) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const updated = db.prepare('SELECT * FROM arcs WHERE id = ?').get(params.id);
	return json(updated);
};

export const DELETE: RequestHandler = async ({ params }) => {
	db.prepare('DELETE FROM arcs WHERE id = ?').run(params.id);
	return new Response(null, { status: 204 });
};
