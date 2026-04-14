import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, encodeJson, decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		entityIds: decodeJson<string[]>(row.entityIds as string),
	};
}

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId');
	const type = url.searchParams.get('type');
	const severity = url.searchParams.get('severity');
	const status = url.searchParams.get('status');

	const conditions: string[] = [];
	const params: unknown[] = [];

	if (projectId) {
		conditions.push('projectId = ?');
		params.push(projectId);
	}
	if (type) {
		conditions.push('type = ?');
		params.push(type);
	}
	if (severity) {
		conditions.push('severity = ?');
		params.push(severity);
	}
	if (status) {
		conditions.push('status = ?');
		params.push(status);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const rows = db
		.prepare(`SELECT * FROM consistency_issues ${where} ORDER BY createdAt DESC`)
		.all(...params) as Record<string, unknown>[];

	return json(rows.map(decodeRow));
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	if (!body.projectId || !body.type || !body.severity || !body.description) {
		return json(
			{ error: 'projectId, type, severity, and description are required' },
			{ status: 400 },
		);
	}

	const now = new Date().toISOString();
	const issue = {
		id: crypto.randomUUID(),
		projectId: body.projectId,
		type: body.type,
		severity: body.severity,
		description: body.description,
		entityIds: encodeJson(body.entityIds ?? []),
		sceneId: body.sceneId ?? null,
		status: body.status ?? 'open',
		createdAt: now,
		updatedAt: now,
	};

	db.prepare(
		`INSERT INTO consistency_issues (id, projectId, type, severity, description, entityIds, sceneId, status, createdAt, updatedAt)
		 VALUES (@id, @projectId, @type, @severity, @description, @entityIds, @sceneId, @status, @createdAt, @updatedAt)`,
	).run(issue);

	return json(decodeRow(issue), { status: 201 });
};
