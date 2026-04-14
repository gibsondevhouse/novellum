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
	const rows = db
		.prepare(`SELECT * FROM story_frames ${where} ORDER BY updatedAt DESC`)
		.all(...params);

	return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId) {
		return json({ error: 'projectId is required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const frame = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		premise: body.premise ?? '',
		theme: body.theme ?? '',
		toneNotes: body.toneNotes ?? '',
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO story_frames (id, projectId, premise, theme, toneNotes, updatedAt)
		 VALUES (@id, @projectId, @premise, @theme, @toneNotes, @updatedAt)`,
	).run(frame);

	return json(frame, { status: 201 });
};
