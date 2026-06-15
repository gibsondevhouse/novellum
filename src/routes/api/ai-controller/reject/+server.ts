import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createControllerArtifactService } from '$lib/server/ai/controller/index.js';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => null)) as
		| { projectId?: unknown; artifactId?: unknown; rejectedBy?: unknown; reason?: unknown }
		| null;
	const artifactId = typeof body?.artifactId === 'string' ? body.artifactId : '';
	const projectId = typeof body?.projectId === 'string' ? body.projectId : null;
	const rejectedBy = typeof body?.rejectedBy === 'string' ? body.rejectedBy : 'user';
	const reason = typeof body?.reason === 'string' && body.reason.trim() ? body.reason.trim() : '';
	if (!artifactId || !reason) {
		return json(
			{ error: { code: 'invalid_request', message: 'artifactId and reason are required.' } },
			{ status: 400 },
		);
	}
	try {
		const artifact = createControllerArtifactService().rejectArtifact(
			projectId,
			artifactId,
			rejectedBy,
			reason,
		);
		return json({ ok: true, artifact });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Artifact reject failed.';
		return json({ error: { code: 'invalid_transition', message } }, { status: 409 });
	}
};
