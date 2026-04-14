import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId');
	const characterAId = url.searchParams.get('characterAId');
	const characterBId = url.searchParams.get('characterBId');

	const conditions: string[] = [];
	const params: unknown[] = [];

	if (projectId) {
		conditions.push('projectId = ?');
		params.push(projectId);
	}
	if (characterAId) {
		conditions.push('characterAId = ?');
		params.push(characterAId);
	}
	if (characterBId) {
		conditions.push('characterBId = ?');
		params.push(characterBId);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const rows = db
		.prepare(`SELECT * FROM character_relationships ${where} ORDER BY createdAt ASC`)
		.all(...params) as Record<string, unknown>[];

	return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId || !body.characterAId || !body.characterBId) {
		return json(
			{ error: 'projectId, characterAId, and characterBId are required' },
			{ status: 400 },
		);
	}

	const now = new Date().toISOString();
	const relationship = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		characterAId: body.characterAId,
		characterBId: body.characterBId,
		type: body.type ?? '',
		description: body.description ?? '',
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, description, createdAt, updatedAt)
		 VALUES (@id, @projectId, @characterAId, @characterBId, @type, @description, @createdAt, @updatedAt)`,
	).run(relationship);

	return json(relationship, { status: 201 });
};
