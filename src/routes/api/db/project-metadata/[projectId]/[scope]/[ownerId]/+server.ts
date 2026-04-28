import { json } from '@sveltejs/kit';
import {
	listProjectMetadata,
	type MetadataScope,
} from '$lib/server/project-metadata/project-metadata-service.js';
import type { RequestHandler } from './$types';

const ALLOWED: ReadonlySet<MetadataScope> = new Set(['scene', 'chapter', 'project']);

export const GET: RequestHandler = async ({ params }) => {
	const { projectId, scope, ownerId } = params;
	if (!projectId || !scope || !ownerId) return json({ error: 'missing param' }, { status: 400 });
	if (!ALLOWED.has(scope as MetadataScope)) return json({ error: 'invalid scope' }, { status: 400 });
	const data = listProjectMetadata(projectId, scope as MetadataScope, ownerId);
	return json({ data });
};
