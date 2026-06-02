import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	AUTHOR_DRAFT_LIFECYCLE_VALUES,
	type AuthorDraftCheckpoint,
} from '$lib/ai/pipeline/author-draft-contract.js';
import { listAuthorDraftCheckpoints } from '$lib/ai/pipeline/author-draft-checkpoint-service.js';

function isLifecycle(value: string): value is AuthorDraftCheckpoint['lifecycle'] {
	return (AUTHOR_DRAFT_LIFECYCLE_VALUES as readonly string[]).includes(value);
}

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId') ?? '';
	if (!projectId) return json({ error: 'missing projectId' }, { status: 400 });

	const chapterId = url.searchParams.get('chapterId');
	const sceneId = url.searchParams.get('sceneId');
	const lifecycleParam = url.searchParams.get('lifecycle');

	const lifecycle = lifecycleParam && isLifecycle(lifecycleParam) ? lifecycleParam : null;

	const checkpoints = listAuthorDraftCheckpoints(projectId).filter((checkpoint) => {
		if (chapterId && checkpoint.chapterId !== chapterId) return false;
		if (sceneId && checkpoint.sceneId !== sceneId) return false;
		if (lifecycle && checkpoint.lifecycle !== lifecycle) return false;
		return true;
	});

	return json({ checkpoints });
};

