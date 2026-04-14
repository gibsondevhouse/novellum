import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, encodeJson, decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		tags: decodeJson<string[]>(row.tags as string),
	};
}

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
		.prepare(`SELECT * FROM locations ${where} ORDER BY createdAt ASC`)
		.all(...params) as Record<string, unknown>[];

	return json(rows.map(decodeRow));
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId || !body.name) {
		return json({ error: 'projectId and name are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const location = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		name: body.name,
		description: body.description ?? '',
		tags: encodeJson(body.tags ?? []),
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO locations (id, projectId, name, description, tags, createdAt, updatedAt)
		 VALUES (@id, @projectId, @name, @description, @tags, @createdAt, @updatedAt)`,
	).run(location);

	return json(decodeRow({ ...location }), { status: 201 });
};
