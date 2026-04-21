import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, encodeJson, decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		tags: decodeJson<string[]>(row.tags as string),
		notableFeatures: decodeJson<string[]>(row.notableFeatures as string),
		landmarkIds: decodeJson<string[]>(row.landmarkIds as string),
		factionIds: decodeJson<string[]>(row.factionIds as string),
		characterIds: decodeJson<string[]>(row.characterIds as string),
		threadIds: decodeJson<string[]>(row.threadIds as string),
	};
}

export const GET: RequestHandler = async ({ params }) => {
	const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(params.id) as
		| Record<string, unknown>
		| undefined;
	if (!row) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	return json(decodeRow(row));
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const current = db.prepare('SELECT * FROM locations WHERE id = ?').get(params.id) as
		| Record<string, unknown>
		| undefined;
	if (!current) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const body = await request.json();
	const updates: Record<string, unknown> = {};
	const simpleAllowed = [
		'name',
		'description',
		'kind',
		'realmType',
		'realityRules',
		'culturalBaseline',
		'powerStructure',
		'conflictPressure',
		'storyRole',
		'tone',
		'realmId',
		'environment',
		'purpose',
		'activityType',
		'emotionalTone',
		'changeOverTime',
	];

	for (const key of simpleAllowed) {
		if (key in body) updates[key] = body[key];
	}

	const jsonFields = ['tags', 'notableFeatures', 'landmarkIds', 'factionIds', 'characterIds', 'threadIds'];
	for (const key of jsonFields) {
		if (key in body) updates[key] = encodeJson(body[key]);
	}

	const nextKind = (body.kind ?? current.kind ?? '') as string;
	const nextRealmType = (body.realmType ?? current.realmType ?? '') as string;
	const nextRealmId = (body.realmId ?? current.realmId ?? '') as string;

	if (nextKind === 'realm' && !nextRealmType) {
		return json({ error: 'realmType is required for realms' }, { status: 400 });
	}

	if (nextKind === 'landmark' && !nextRealmId) {
		return json({ error: 'realmId is required for landmarks' }, { status: 400 });
	}

	updates.updatedAt = new Date().toISOString();

	const setClauses = Object.keys(updates).map((k) => `${k} = @${k}`);
	const stmt = db.prepare(`UPDATE locations SET ${setClauses.join(', ')} WHERE id = @id`);
	stmt.run({ ...updates, id: params.id });

	const updated = db.prepare('SELECT * FROM locations WHERE id = ?').get(params.id) as Record<
		string,
		unknown
	>;
	return json(decodeRow(updated));
};

export const DELETE: RequestHandler = async ({ params }) => {
	db.prepare('DELETE FROM locations WHERE id = ?').run(params.id);
	return new Response(null, { status: 204 });
};
