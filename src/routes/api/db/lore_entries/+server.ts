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
	const category = url.searchParams.get('category');

	const conditions: string[] = [];
	const params: unknown[] = [];

	if (projectId) {
		conditions.push('projectId = ?');
		params.push(projectId);
	}
	if (category) {
		conditions.push('category = ?');
		params.push(category);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const rows = db
		.prepare(`SELECT * FROM lore_entries ${where} ORDER BY createdAt ASC`)
		.all(...params) as Record<string, unknown>[];

	return json(rows.map(decodeRow));
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId || !body.title) {
		return json({ error: 'projectId and title are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const entry = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		title: body.title,
		category: body.category ?? '',
		content: body.content ?? '',
		tags: encodeJson(body.tags ?? []),
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO lore_entries (id, projectId, title, category, content, tags, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @category, @content, @tags, @createdAt, @updatedAt)`,
	).run(entry);

	return json(decodeRow({ ...entry }), { status: 201 });
};
