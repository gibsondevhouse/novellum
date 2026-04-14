import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, encodeJson, decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		tags: decodeJson<string[]>(row.tags as string),
	};
}

export const GET: RequestHandler = async ({ params }) => {
	const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(params.id) as
		| Record<string, unknown>
		| undefined;
	if (!row) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	return json(decodeRow(row));
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const updates: Record<string, unknown> = {};
	const simpleAllowed = ['name', 'description'];

	for (const key of simpleAllowed) {
		if (key in body) updates[key] = body[key];
	}

	const jsonFields = ['tags'];
	for (const key of jsonFields) {
		if (key in body) updates[key] = encodeJson(body[key]);
	}

	updates.updatedAt = new Date().toISOString();

	const setClauses = Object.keys(updates).map((k) => `${k} = @${k}`);
	const stmt = db.prepare(`UPDATE locations SET ${setClauses.join(', ')} WHERE id = @id`);
	const result = stmt.run({ ...updates, id: params.id });

	if (result.changes === 0) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const updated = db.prepare('SELECT * FROM locations WHERE id = ?').get(params.id) as Record<
		string,
		unknown
	>;
	return json(decodeRow(updated));
};

export const DELETE: RequestHandler = async ({ params }) => {
	db.prepare('DELETE FROM locations WHERE id = ?').run(params.id);
	return new Response(null, { status: 204 });
};
