import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, encodeJson, decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		characterIds: decodeJson<string[]>(row.characterIds as string),
		locationIds: decodeJson<string[]>(row.locationIds as string),
		arcRefs: decodeJson<{ arcId: string; role: string }[]>(row.arcRefs as string),
	};
}

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId');
	const chapterId = url.searchParams.get('chapterId');

	const conditions: string[] = [];
	const params: unknown[] = [];

	if (projectId) {
		conditions.push('projectId = ?');
		params.push(projectId);
	}
	if (chapterId) {
		conditions.push('chapterId = ?');
		params.push(chapterId);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const rows = db
		.prepare(`SELECT * FROM scenes ${where} ORDER BY "order" ASC`)
		.all(...params) as Record<string, unknown>[];

	return json(rows.map(decodeRow));
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.chapterId || !body.projectId || !body.title) {
		return json({ error: 'chapterId, projectId, and title are required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const scene = {
		id: crypto.randomUUID(),
		chapterId: body.chapterId,
		projectId: body.projectId,
		title: body.title,
		summary: body.summary ?? '',
		povCharacterId: body.povCharacterId ?? null,
		locationId: body.locationId ?? null,
		timelineEventId: body.timelineEventId ?? null,
		order: body.order ?? 0,
		content: body.content ?? '',
		wordCount: body.wordCount ?? 0,
		characterIds: encodeJson(body.characterIds ?? []),
		locationIds: encodeJson(body.locationIds ?? []),
		arcRefs: encodeJson(body.arcRefs ?? []),
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO scenes (id, chapterId, projectId, title, summary, povCharacterId, locationId, timelineEventId, "order", content, wordCount, characterIds, locationIds, arcRefs, createdAt, updatedAt)
		 VALUES (@id, @chapterId, @projectId, @title, @summary, @povCharacterId, @locationId, @timelineEventId, @order, @content, @wordCount, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
	).run(scene);

	return json(decodeRow({ ...scene }), { status: 201 });
};
