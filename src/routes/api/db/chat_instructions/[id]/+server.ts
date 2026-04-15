import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ params }) => {
	const row = db.prepare('SELECT * FROM chat_instructions WHERE id = ?').get(params.id);
	if (!row) return json({ error: 'Not found' }, { status: 404 });
	return json(row);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const now = new Date().toISOString();

	const updates: string[] = [];
	const values: Record<string, unknown> = { id: params.id, updatedAt: now };

	if (body.name !== undefined) {
		updates.push('name = @name');
		values.name = body.name;
	}
	if (body.content !== undefined) {
		updates.push('content = @content');
		values.content = body.content;
	}
	if (body.isDefault !== undefined) {
		updates.push('isDefault = @isDefault');
		values.isDefault = body.isDefault ? 1 : 0;
	}

	if (updates.length === 0) {
		return json({ error: 'No fields to update' }, { status: 400 });
	}

	updates.push('updatedAt = @updatedAt');

	db.prepare(`UPDATE chat_instructions SET ${updates.join(', ')} WHERE id = @id`).run(values);

	const row = db.prepare('SELECT * FROM chat_instructions WHERE id = ?').get(params.id);
	return json(row);
};

export const DELETE: RequestHandler = async ({ params }) => {
	db.prepare('DELETE FROM chat_instructions WHERE id = ?').run(params.id);
	return json({ success: true });
};
