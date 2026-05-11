import { json } from '@sveltejs/kit';
import JSZip from 'jszip';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import {
	buildProjectBackup,
	ProjectNotFoundError,
} from '$lib/server/backup/build-project-backup.js';
import { APP_VERSION } from '$lib/version.js';

interface AllProjectsManifest {
	formatVersion: 1;
	exportedAt: string;
	appVersion: string;
	projectCount: number;
	projects: Array<{
		id: string;
		title: string;
		archive: string;
	}>;
}

function todayIso(): string {
	return new Date().toISOString().slice(0, 10);
}

/**
 * Build a single `.novellum.zip` containing per-project `.novellum`
 * archives for every project in the SQLite database. Used by the
 * `Settings → Backup → Create backup` action.
 *
 * Archive layout:
 *
 *     manifest.json                # top-level inventory
 *     projects/<projectId>/<title>_<date>.novellum   # one per project
 *
 * Returns `application/zip` with `Content-Disposition` set so the
 * browser triggers a file download.
 */
export const POST: RequestHandler = async () => {
	const projectRows = db
		.prepare('SELECT id, title FROM projects ORDER BY createdAt ASC')
		.all() as Array<{ id: string; title: string }>;

	const zip = new JSZip();
	const manifestProjects: AllProjectsManifest['projects'] = [];

	for (const project of projectRows) {
		try {
			const result = await buildProjectBackup(db, project.id);
			const archivePath = `projects/${project.id}/${result.filename}`;
			zip.file(archivePath, result.archive);
			manifestProjects.push({
				id: project.id,
				title: project.title,
				archive: archivePath,
			});
		} catch (cause) {
			if (cause instanceof ProjectNotFoundError) {
				// Project disappeared between SELECT and read — skip.
				continue;
			}
			console.error('[backup/all] project archive failed', {
				projectId: project.id,
				cause,
			});
			return json(
				{
					error: 'backup_failed',
					projectId: project.id,
					reason: cause instanceof Error ? cause.message : 'unknown',
				},
				{ status: 500 },
			);
		}
	}

	const manifest: AllProjectsManifest = {
		formatVersion: 1,
		exportedAt: new Date().toISOString(),
		appVersion: APP_VERSION,
		projectCount: manifestProjects.length,
		projects: manifestProjects,
	};
	zip.file('manifest.json', JSON.stringify(manifest, null, 2));

	const archive = await zip.generateAsync({
		type: 'uint8array',
		compression: 'DEFLATE',
		compressionOptions: { level: 6 },
	});

	const filename = `novellum-backup-${todayIso()}.novellum.zip`;

	const body = archive.buffer.slice(
		archive.byteOffset,
		archive.byteOffset + archive.byteLength,
	) as ArrayBuffer;
	return new Response(body, {
		status: 200,
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Content-Length': String(archive.byteLength),
			'X-Novellum-Backup-Format': 'novellum.all-projects.backup',
			'X-Novellum-Project-Count': String(manifestProjects.length),
		},
	});
};
