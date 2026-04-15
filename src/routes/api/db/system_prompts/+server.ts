import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId');
	const isDefault = url.searchParams.get('isDefault');

	const conditions: string[] = [];
	const params: unknown[] = [];

	if (projectId) {
		conditions.push('projectId = ?');
		params.push(projectId);
	}
	if (isDefault) {
		conditions.push('isDefault = ?');
		params.push(parseInt(isDefault, 10));
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const rows = db.prepare(`SELECT * FROM system_prompts ${where} ORDER BY createdAt ASC`).all(...params);

	return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId || !body.name) {
		return json({ error: 'projectId and name are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const item = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		name: body.name,
		content: body.content ?? '',
		isDefault: body.isDefault ? 1 : 0,
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO system_prompts (id, projectId, name, content, isDefault, createdAt, updatedAt)
		 VALUES (@id, @projectId, @name, @content, @isDefault, @createdAt, @updatedAt)`,
	).run(item);

	return json(item, { status: 201 });
};
