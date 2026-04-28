import { json } from '@sveltejs/kit';
import {
	deletePreference,
	getPreference,
	setPreference,
} from '$lib/server/preferences/preferences-service.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const key = params.key;
	if (!key) return json({ error: 'missing key' }, { status: 400 });
	const value = getPreference<unknown>(key);
	if (value === undefined) return json({ value: null }, { status: 200 });
	return json({ value });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const key = params.key;
	if (!key) return json({ error: 'missing key' }, { status: 400 });
	let body: { value: unknown };
	try {
		body = (await request.json()) as { value: unknown };
	} catch {
		return json({ error: 'invalid json' }, { status: 400 });
	}
	setPreference(key, body.value);
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const key = params.key;
	if (!key) return json({ error: 'missing key' }, { status: 400 });
	deletePreference(key);
	return json({ ok: true });
};
