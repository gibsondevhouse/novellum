import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId');
	const type = url.searchParams.get('type');

	const conditions: string[] = [];
	const params: unknown[] = [];

	if (projectId) {
		conditions.push('projectId = ?');
		params.push(projectId);
	}
	if (type) {
		conditions.push('type = ?');
		params.push(type);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const rows = db.prepare(`SELECT * FROM templates ${where} ORDER BY createdAt ASC`).all(...params);

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
		description: body.description ?? '',
		content: body.content ?? '',
		type: body.type ?? '',
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO templates (id, projectId, name, description, content, type, createdAt, updatedAt)
		 VALUES (@id, @projectId, @name, @description, @content, @type, @createdAt, @updatedAt)`,
	).run(item);

	return json(item, { status: 201 });
};
