import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ params }) => {
	const row = db.prepare('SELECT * FROM themes WHERE id = ?').get(params.id);
	if (!row) return json({ error: 'Not found' }, { status: 404 });
	return json(row);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const now = new Date().toISOString();

	const updates: string[] = [];
	const values: Record<string, unknown> = { id: params.id, updatedAt: now };

	const fields = ['title', 'description', 'tensionPair', 'imagery'];
	for (const field of fields) {
		if (body[field] !== undefined) {
			updates.push(`${field} = @${field}`);
			values[field] = body[field];
		}
	}

	if (updates.length === 0) {
		return json({ error: 'No fields to update' }, { status: 400 });
	}

	updates.push('updatedAt = @updatedAt');

	db.prepare(`UPDATE themes SET ${updates.join(', ')} WHERE id = @id`).run(values);

	const row = db.prepare('SELECT * FROM themes WHERE id = ?').get(params.id);
	return json(row);
};

export const DELETE: RequestHandler = async ({ params }) => {
	db.prepare('DELETE FROM themes WHERE id = ?').run(params.id);
	return json({ success: true });
};
