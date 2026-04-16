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
		genre: typeof body.genre === 'string' ? body.genre : '',
		logline: typeof body.logline === 'string' ? body.logline : '',
		synopsis: typeof body.synopsis === 'string' ? body.synopsis : '',
		targetWordCount: typeof body.targetWordCount === 'number' ? body.targetWordCount : 0,
		status: typeof body.status === 'string' ? body.status : 'planning',
		systemPrompt: typeof body.systemPrompt === 'string' ? body.systemPrompt : '',
		negativePrompt: typeof body.negativePrompt === 'string' ? body.negativePrompt : '',
		projectType: typeof body.projectType === 'string' ? body.projectType : 'novel',
		lastOpenedAt: typeof body.lastOpenedAt === 'string' ? body.lastOpenedAt : now,
		stylePresetId: typeof body.stylePresetId === 'string' ? body.stylePresetId : '',
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO projects (id, title, coverUrl, genre, logline, synopsis, targetWordCount, status, systemPrompt, negativePrompt, projectType, lastOpenedAt, stylePresetId, createdAt, updatedAt)
		 VALUES (@id, @title, @coverUrl, @genre, @logline, @synopsis, @targetWordCount, @status, @systemPrompt, @negativePrompt, @projectType, @lastOpenedAt, @stylePresetId, @createdAt, @updatedAt)`,
	).run(project);

	return json(project, { status: 201 });
};
