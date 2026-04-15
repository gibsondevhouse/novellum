import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ params }) => {
	const row = db.prepare('SELECT * FROM writing_styles WHERE id = ?').get(params.id);
	if (!row) return json({ error: 'Not found' }, { status: 404 });
	return json(row);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const now = new Date().toISOString();

	const updates: string[] = [];
	const values: Record<string, unknown> = { id: params.id, updatedAt: now };

	if (body.title !== undefined) {
		updates.push('title = @title');
		values.title = body.title;
	}
	if (body.description !== undefined) {
		updates.push('description = @description');
		values.description = body.description;
	}
	if (body.exampleText !== undefined) {
		updates.push('exampleText = @exampleText');
		values.exampleText = body.exampleText;
	}

	if (updates.length === 0) {
		return json({ error: 'No fields to update' }, { status: 400 });
	}

	updates.push('updatedAt = @updatedAt');

	db.prepare(`UPDATE writing_styles SET ${updates.join(', ')} WHERE id = @id`).run(values);

	const row = db.prepare('SELECT * FROM writing_styles WHERE id = ?').get(params.id);
	return json(row);
};

export const DELETE: RequestHandler = async ({ params }) => {
	db.prepare('DELETE FROM writing_styles WHERE id = ?').run(params.id);
	return json({ success: true });
};
