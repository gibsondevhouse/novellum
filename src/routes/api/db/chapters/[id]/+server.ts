import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, encodeJson, decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		arcRefs: decodeJson<{ arcId: string; role: string }[]>(row.arcRefs as string),
	};
}

export const GET: RequestHandler = async ({ params }) => {
	const row = db.prepare('SELECT * FROM chapters WHERE id = ?').get(params.id) as
		| Record<string, unknown>
		| undefined;
	if (!row) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	return json(decodeRow(row));
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const updates: Record<string, unknown> = {};
	const allowed = ['title', 'order', 'summary', 'wordCount', 'actId'];

	for (const key of allowed) {
		if (key in body) updates[key] = body[key];
	}
	if ('arcRefs' in body) updates.arcRefs = encodeJson(body.arcRefs);
	updates.updatedAt = new Date().toISOString();

	const setClauses = Object.keys(updates).map((k) => {
		const col = k === 'order' ? `"order"` : k;
		return `${col} = @${k}`;
	});
	const stmt = db.prepare(`UPDATE chapters SET ${setClauses.join(', ')} WHERE id = @id`);
	const result = stmt.run({ ...updates, id: params.id });

	if (result.changes === 0) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const updated = db.prepare('SELECT * FROM chapters WHERE id = ?').get(params.id) as Record<
		string,
		unknown
	>;
	return json(decodeRow(updated));
};

export const DELETE: RequestHandler = async ({ params }) => {
	db.prepare('DELETE FROM chapters WHERE id = ?').run(params.id);
	return new Response(null, { status: 204 });
};
