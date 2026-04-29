import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId');

	// No projectId → list mode (used by the legacy migration runner and
	// any other caller that needs the full collection). Returns an
	// array shape consistent with the other /api/db/<resource> list
	// endpoints.
	if (!projectId) {
		const rows = db.prepare('SELECT * FROM export_settings').all() as Record<string, unknown>[];
		for (const row of rows) row.titlePage = !!row.titlePage;
		return json(rows);
	}

	const row = db.prepare('SELECT * FROM export_settings WHERE projectId = ?').get(projectId) as
		| Record<string, unknown>
		| undefined;

	if (!row) {
		return json({ data: null });
	}

	row.titlePage = !!row.titlePage;
	return json({ data: row });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId) {
		return json({ error: 'projectId is required' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const settings = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		titlePage: body.titlePage !== false ? 1 : 0,
		chapterStyle: body.chapterStyle ?? 'heading',
		fontFamily: body.fontFamily ?? 'Georgia',
		fontSize: body.fontSize ?? 12,
		lineSpacing: body.lineSpacing ?? 1.5,
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT OR REPLACE INTO export_settings (id, projectId, titlePage, chapterStyle, fontFamily, fontSize, lineSpacing, createdAt, updatedAt)
		 VALUES (@id, @projectId, @titlePage, @chapterStyle, @fontFamily, @fontSize, @lineSpacing, @createdAt, @updatedAt)`,
	).run(settings);

	return json({ data: { ...settings, titlePage: !!settings.titlePage } }, { status: 201 });
};
