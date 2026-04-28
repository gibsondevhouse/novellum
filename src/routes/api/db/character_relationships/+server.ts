import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createGetHandler } from '$lib/server/api-helpers.js';
import { db } from '$lib/server/db/index.js';

const config = {
	table: 'character_relationships',
	orderBy: 'createdAt ASC',
	queryParams: ['projectId', 'characterAId', 'characterBId'],
};

export const GET = createGetHandler(config);

function normalizePair(aId: string, bId: string): [string, string] {
	return aId <= bId ? [aId, bId] : [bId, aId];
}

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Record<string, unknown>;

	const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : '';
	const characterAIdRaw = typeof body.characterAId === 'string' ? body.characterAId.trim() : '';
	const characterBIdRaw = typeof body.characterBId === 'string' ? body.characterBId.trim() : '';
	const type = typeof body.type === 'string' ? body.type : '';
	const status = typeof body.status === 'string' ? body.status : '';
	const description = typeof body.description === 'string' ? body.description : '';

	if (!projectId || !characterAIdRaw || !characterBIdRaw) {
		return json({ error: 'projectId, characterAId, and characterBId are required' }, { status: 400 });
	}

	if (characterAIdRaw === characterBIdRaw) {
		return json({ error: 'A character cannot be related to themselves' }, { status: 400 });
	}

	const [characterAId, characterBId] = normalizePair(characterAIdRaw, characterBIdRaw);
	const existing = db
		.prepare(
			'SELECT id FROM character_relationships WHERE projectId = ? AND characterAId = ? AND characterBId = ?',
		)
		.get(projectId, characterAId, characterBId) as { id: string } | undefined;

	if (existing) {
		return json({ error: 'Relationship already exists' }, { status: 409 });
	}

	const now = new Date().toISOString();
	const relationship = {
		id: crypto.randomUUID(),
		projectId,
		characterAId,
		characterBId,
		type,
		status,
		description,
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, status, description, createdAt, updatedAt)
		 VALUES (@id, @projectId, @characterAId, @characterBId, @type, @status, @description, @createdAt, @updatedAt)`,
	).run(relationship);

	return json(relationship, { status: 201 });
};
