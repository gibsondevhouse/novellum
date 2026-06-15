import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createControllerArtifactService } from '$lib/server/ai/controller/index.js';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => null)) as
		| { projectId?: unknown; artifactId?: unknown; acceptedBy?: unknown }
		| null;
	const artifactId = typeof body?.artifactId === 'string' ? body.artifactId : '';
	const projectId = typeof body?.projectId === 'string' ? body.projectId : null;
	const acceptedBy = typeof body?.acceptedBy === 'string' ? body.acceptedBy : 'user';
	if (!artifactId) {
		return json({ error: { code: 'invalid_request', message: 'artifactId is required.' } }, { status: 400 });
	}
	try {
		const artifact = createControllerArtifactService().acceptArtifact(projectId, artifactId, acceptedBy);
		return json({ ok: true, artifact });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Artifact accept failed.';
		return json({ error: { code: 'invalid_transition', message } }, { status: 409 });
	}
};
