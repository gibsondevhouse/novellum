import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId');
	const conditions: string[] = [];
	const params: unknown[] = [];

	if (projectId) {
		conditions.push('projectId = ?');
		params.push(projectId);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const rows = db.prepare(`SELECT * FROM writing_styles ${where} ORDER BY createdAt ASC`).all(...params);

	return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId || !body.title) {
		return json({ error: 'projectId and title are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const item = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		title: body.title,
		description: body.description ?? '',
		exampleText: body.exampleText ?? '',
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO writing_styles (id, projectId, title, description, exampleText, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @description, @exampleText, @createdAt, @updatedAt)`,
	).run(item);

	return json(item, { status: 201 });
};
