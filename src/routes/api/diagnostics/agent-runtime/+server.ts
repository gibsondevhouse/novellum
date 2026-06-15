import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateSupportBundle } from '$lib/server/diagnostics/agent-runtime-diagnostics.js';

export const GET: RequestHandler = async ({ url }) => {
	const projectId = url.searchParams.get('projectId') ?? undefined;
	const bundle = await generateSupportBundle(projectId);
	return json(bundle);
};
