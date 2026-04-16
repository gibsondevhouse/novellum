import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ url }) => {
	const beatId = url.searchParams.get('beatId');
	const projectId = url.searchParams.get('projectId');

	const conditions: string[] = [];
	const params: unknown[] = [];

	if (beatId) {
		conditions.push('beatId = ?');
		params.push(beatId);
	}
	if (projectId) {
		conditions.push('projectId = ?');
		params.push(projectId);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const rows = db.prepare(`SELECT * FROM stages ${where} ORDER BY "order" ASC`).all(...params);

	return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.beatId || !body.projectId || !body.title) {
		return json({ error: 'beatId, projectId, and title are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const stage = {
		id: crypto.randomUUID(),
		beatId: body.beatId,
		projectId: body.projectId,
		title: body.title,
		description: body.description ?? '',
		order: body.order ?? 0,
		status: body.status ?? 'planned',
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO stages (id, beatId, projectId, title, description, "order", status, createdAt, updatedAt)
		 VALUES (@id, @beatId, @projectId, @title, @description, @order, @status, @createdAt, @updatedAt)`,
	).run(stage);

	return json(stage, { status: 201 });
};
