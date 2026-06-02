import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { buildSceneDraftContext } from '$lib/ai/pipeline/author-draft-context.js';

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId') ?? '';
	const sceneId = url.searchParams.get('sceneId') ?? '';
	if (!projectId || !sceneId) {
		return json({ error: 'missing projectId or sceneId' }, { status: 400 });
	}

	const context = buildSceneDraftContext(projectId, sceneId);
	if (!context) {
		return json({ error: 'not found' }, { status: 404 });
	}

	return json({ context });
};

