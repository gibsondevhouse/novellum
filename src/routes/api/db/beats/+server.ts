import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ url }) => {
	const sceneId = url.searchParams.get('sceneId');
	const projectId = url.searchParams.get('projectId');

	const conditions: string[] = [];
	const params: unknown[] = [];

	if (sceneId) {
		conditions.push('sceneId = ?');
		params.push(sceneId);
	}
	if (projectId) {
		conditions.push('projectId = ?');
		params.push(projectId);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const rows = db.prepare(`SELECT * FROM beats ${where} ORDER BY "order" ASC`).all(...params);

	return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.sceneId || !body.projectId || !body.title) {
		return json({ error: 'sceneId, projectId, and title are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const beat = {
		id: crypto.randomUUID(),
		sceneId: body.sceneId,
		projectId: body.projectId,
		title: body.title,
		type: body.type ?? '',
		order: body.order ?? 0,
		notes: body.notes ?? '',
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO beats (id, sceneId, projectId, title, type, "order", notes, createdAt, updatedAt)
		 VALUES (@id, @sceneId, @projectId, @title, @type, @order, @notes, @createdAt, @updatedAt)`,
	).run(beat);

	return json(beat, { status: 201 });
};
