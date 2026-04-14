import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async () => {
	const rows = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();
	return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
		return json({ error: 'title is required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const project = {
		id: crypto.randomUUID(),
		title: body.title,
		coverUrl: typeof body.coverUrl === 'string' ? body.coverUrl : '',
		genre: '',
		logline: '',
		synopsis: '',
		targetWordCount: 0,
		status: '',
		systemPrompt: '',
		negativePrompt: '',
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO projects (id, title, coverUrl, genre, logline, synopsis, targetWordCount, status, systemPrompt, negativePrompt, createdAt, updatedAt)
		 VALUES (@id, @title, @coverUrl, @genre, @logline, @synopsis, @targetWordCount, @status, @systemPrompt, @negativePrompt, @createdAt, @updatedAt)`,
	).run(project);

	return json(project, { status: 201 });
};
