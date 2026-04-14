import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, encodeJson, decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		relatedSceneIds: decodeJson<string[]>(row.relatedSceneIds as string),
		relatedCharacterIds: decodeJson<string[]>(row.relatedCharacterIds as string),
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
		.prepare(`SELECT * FROM plot_threads ${where} ORDER BY createdAt ASC`)
		.all(...params) as Record<string, unknown>[];

	return json(rows.map(decodeRow));
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId || !body.title) {
		return json({ error: 'projectId and title are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const thread = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		title: body.title,
		description: body.description ?? '',
		status: body.status ?? '',
		relatedSceneIds: encodeJson(body.relatedSceneIds ?? []),
		relatedCharacterIds: encodeJson(body.relatedCharacterIds ?? []),
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO plot_threads (id, projectId, title, description, status, relatedSceneIds, relatedCharacterIds, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @description, @status, @relatedSceneIds, @relatedCharacterIds, @createdAt, @updatedAt)`,
	).run(thread);

	return json(decodeRow({ ...thread }), { status: 201 });
};
