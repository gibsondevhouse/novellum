import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, encodeJson, decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		arcRefs: decodeJson<{ arcId: string; role: string }[]>(row.arcRefs as string),
	};
}

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId');
	if (!projectId) {
		return json({ error: 'projectId is required' }, { status: 400 });
	}

	const rows = db
		.prepare('SELECT * FROM chapters WHERE projectId = ? ORDER BY "order" ASC')
		.all(projectId) as Record<string, unknown>[];

	return json(rows.map(decodeRow));
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId || !body.title) {
		return json({ error: 'projectId and title are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const chapter = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		title: body.title,
		order: body.order ?? 0,
		summary: body.summary ?? '',
		wordCount: body.wordCount ?? 0,
		actId: body.actId ?? null,
		arcRefs: encodeJson(body.arcRefs ?? []),
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, actId, arcRefs, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @actId, @arcRefs, @createdAt, @updatedAt)`,
	).run(chapter);

	return json(decodeRow({ ...chapter }), { status: 201 });
};
