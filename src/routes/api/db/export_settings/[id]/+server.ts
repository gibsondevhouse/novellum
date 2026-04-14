import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ params }) => {
	const row = db.prepare('SELECT * FROM export_settings WHERE id = ?').get(params.id) as
		| Record<string, unknown>
		| undefined;
	if (!row) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	row.titlePage = !!row.titlePage;
	return json(row);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const updates: Record<string, unknown> = {};
	const simpleAllowed = ['chapterStyle', 'fontFamily', 'fontSize', 'lineSpacing'];

	for (const key of simpleAllowed) {
		if (key in body) updates[key] = body[key];
	}

	if ('titlePage' in body) {
		updates.titlePage = body.titlePage ? 1 : 0;
	}

	updates.updatedAt = new Date().toISOString();

	const setClauses = Object.keys(updates).map((k) => `${k} = @${k}`);
	const stmt = db.prepare(`UPDATE export_settings SET ${setClauses.join(', ')} WHERE id = @id`);
	const result = stmt.run({ ...updates, id: params.id });

	if (result.changes === 0) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const updated = db.prepare('SELECT * FROM export_settings WHERE id = ?').get(params.id) as Record<
		string,
		unknown
	>;
	updated.titlePage = !!updated.titlePage;
	return json(updated);
};

export const DELETE: RequestHandler = async ({ params }) => {
	db.prepare('DELETE FROM export_settings WHERE id = ?').run(params.id);
	return new Response(null, { status: 204 });
};
