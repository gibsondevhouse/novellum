import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const OPENROUTER_AUTH_URL = 'https://openrouter.ai/api/v1/auth/key';

export const POST: RequestHandler = async ({ request }) => {
	let body: { apiKey?: unknown } | null = null;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
	if (!apiKey) {
		error(400, 'Missing API key');
	}

	try {
		const res = await fetch(OPENROUTER_AUTH_URL, {
			method: 'GET',
			headers: { Authorization: `Bearer ${apiKey}` },
		});

		if (!res.ok) {
			return json({ valid: false }, { status: 200 });
		}

		return json({ valid: true });
	} catch {
		error(502, 'Unable to reach OpenRouter for validation');
	}
};
