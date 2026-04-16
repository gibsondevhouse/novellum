import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ params }) => {
	const row = db.prepare('SELECT * FROM stages WHERE id = ?').get(params.id);
	if (!row) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	return json(row);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const updates: Record<string, unknown> = {};
	const allowed = ['title', 'description', 'order', 'status', 'beatId'];

	for (const key of allowed) {
		if (key in body) updates[key] = body[key];
	}
	updates.updatedAt = new Date().toISOString();

	const setClauses = Object.keys(updates).map((k) => {
		const col = k === 'order' ? `"order"` : k;
		return `${col} = @${k}`;
	});
	const stmt = db.prepare(`UPDATE stages SET ${setClauses.join(', ')} WHERE id = @id`);
	const result = stmt.run({ ...updates, id: params.id });

	if (result.changes === 0) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const updated = db.prepare('SELECT * FROM stages WHERE id = ?').get(params.id);
	return json(updated);
};

export const DELETE: RequestHandler = async ({ params }) => {
	db.prepare('DELETE FROM stages WHERE id = ?').run(params.id);
	return new Response(null, { status: 204 });
};
