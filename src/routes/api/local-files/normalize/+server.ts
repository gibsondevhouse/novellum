import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { normalizeWorkspaceRelativePath } from '$modules/bible/services/character-dossier-files.js';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as { path?: string };

	if (!body.path?.trim()) {
		return json({ error: 'Path is required.' }, { status: 400 });
	}

	try {
		return json({ path: normalizeWorkspaceRelativePath(body.path) });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Could not normalize path.' },
			{ status: 400 },
		);
	}
};