import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import {
	buildProjectBackup,
	ProjectNotFoundError,
} from '$lib/server/backup/build-project-backup.js';

export const POST: RequestHandler = async ({ params }) => {
	const projectId = params.id;
	if (!projectId) throw error(400, 'projectId is required');

	let result;
	try {
		result = await buildProjectBackup(db, projectId);
	} catch (cause) {
		if (cause instanceof ProjectNotFoundError) {
			return json({ error: 'project_not_found', projectId }, { status: 404 });
		}
		console.error('[backup] build failed', cause);
		return json(
			{ error: 'backup_failed', reason: cause instanceof Error ? cause.message : 'unknown' },
			{ status: 500 },
		);
	}

	const body = result.archive.buffer.slice(
		result.archive.byteOffset,
		result.archive.byteOffset + result.archive.byteLength,
	) as ArrayBuffer;
	return new Response(body, {
		status: 200,
		headers: {
			'Content-Type': 'application/x-zip-compressed',
			'Content-Disposition': `attachment; filename="${result.filename}"`,
			'Content-Length': String(result.archive.byteLength),
			'X-Novellum-Backup-Format': 'novellum.project.backup',
		},
	});
};
