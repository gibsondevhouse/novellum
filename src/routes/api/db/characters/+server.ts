import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, encodeJson, decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		traits: decodeJson<string[]>(row.traits as string),
		goals: decodeJson<string[]>(row.goals as string),
		flaws: decodeJson<string[]>(row.flaws as string),
		arcs: decodeJson<string[]>(row.arcs as string),
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
		.prepare(`SELECT * FROM characters ${where} ORDER BY createdAt ASC`)
		.all(...params) as Record<string, unknown>[];

	return json(rows.map(decodeRow));
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId || !body.name) {
		return json({ error: 'projectId and name are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const character = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		name: body.name,
		role: body.role ?? '',
		traits: encodeJson(body.traits ?? []),
		goals: encodeJson(body.goals ?? []),
		flaws: encodeJson(body.flaws ?? []),
		arcs: encodeJson(body.arcs ?? []),
		notes: body.notes ?? '',
		tags: encodeJson(body.tags ?? []),
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO characters (id, projectId, name, role, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt)
		 VALUES (@id, @projectId, @name, @role, @traits, @goals, @flaws, @arcs, @notes, @tags, @createdAt, @updatedAt)`,
	).run(character);

	return json(decodeRow({ ...character }), { status: 201 });
};
