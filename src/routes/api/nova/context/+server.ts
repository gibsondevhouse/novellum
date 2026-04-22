import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { buildNovaContextHttpResponse } from './http.js';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body.' }, { status: 400 });
	}

	return buildNovaContextHttpResponse(body);
};
