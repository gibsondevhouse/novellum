/**
 * Thin client for the new SQLite-backed `.novellum` backup APIs.
 *
 * Wraps the HTTP routes added in plan-017 stage-004 phases 002–004 so
 * UI components don't have to know about `Content-Disposition`,
 * multipart shapes, or restore-mode plumbing.
 *
 * Belongs deliberately under `src/modules/export/services/` so the
 * legacy Dexie-backed `portability/` siblings can be retired without
 * disturbing this module.
 */

export interface DownloadProjectBackupResult {
	readonly filename: string;
	readonly archive: Blob;
	readonly contentType: string;
}

export class ProjectBackupClientError extends Error {
	constructor(
		message: string,
		readonly status: number,
	) {
		super(message);
		this.name = 'ProjectBackupClientError';
	}
}

function parseFilenameFromContentDisposition(header: string | null): string | null {
	if (!header) return null;
	const match = /filename="([^"]+)"/i.exec(header);
	return match ? match[1] : null;
}

/**
 * POST /api/backup/projects/[id] and resolve to the downloadable
 * archive. Callers are expected to drive the actual save dialog
 * (browser download) themselves so this stays testable.
 */
export async function downloadProjectBackup(
	projectId: string,
	fetchImpl: typeof fetch = fetch,
): Promise<DownloadProjectBackupResult> {
	const response = await fetchImpl(
		`/api/backup/projects/${encodeURIComponent(projectId)}`,
		{ method: 'POST' },
	);
	if (!response.ok) {
		let message = `backup failed (HTTP ${response.status})`;
		try {
			const body = (await response.json()) as { error?: string; reason?: string };
			if (body.reason) message = body.reason;
			else if (body.error) message = body.error;
		} catch {
			// ignore JSON parse failure; fall back to status-based message
		}
		throw new ProjectBackupClientError(message, response.status);
	}
	const archive = await response.blob();
	const filename =
		parseFilenameFromContentDisposition(response.headers.get('content-disposition')) ??
		`project-${projectId}.novellum`;
	return {
		filename,
		archive,
		contentType: response.headers.get('content-type') ?? 'application/octet-stream',
	};
}

export interface RestorePreviewResponse {
	readonly manifest: unknown;
	readonly tableCounts: Readonly<Record<string, number>>;
	readonly checksumStatus: 'ok' | 'mismatch' | 'absent';
	readonly compatibility: {
		readonly canRestore: boolean;
		readonly bundledSchemaVersion: number;
		readonly archiveSchemaVersion: number;
	};
	readonly warnings: readonly { code: string; message: string }[];
}

/** POST /api/restore/preview with a file upload, returning the structured preview. */
export async function previewProjectBackup(
	file: Blob,
	fetchImpl: typeof fetch = fetch,
): Promise<RestorePreviewResponse> {
	const response = await fetchImpl('/api/restore/preview', {
		method: 'POST',
		headers: { 'content-type': 'application/octet-stream' },
		body: file,
	});
	if (!response.ok) {
		const body = (await response.json().catch(() => null)) as
			| { error?: string; reason?: string }
			| null;
		throw new ProjectBackupClientError(
			body?.reason ?? body?.error ?? `preview failed (HTTP ${response.status})`,
			response.status,
		);
	}
	return (await response.json()) as RestorePreviewResponse;
}

export type RestoreMode = 'overwrite' | 'copy';

export interface RestoreProjectResult {
	readonly projectId: string;
	readonly mode: RestoreMode;
	readonly snapshotPath: string;
	readonly tableRowCounts: Readonly<Record<string, number>>;
}

/** POST /api/restore/project to apply a backup to the live database. */
export async function restoreProjectBackup(
	file: Blob,
	options: { mode: RestoreMode; targetProjectId?: string; newProjectId?: string },
	fetchImpl: typeof fetch = fetch,
): Promise<RestoreProjectResult> {
	const params = new URLSearchParams({ mode: options.mode });
	if (options.targetProjectId) params.set('targetProjectId', options.targetProjectId);
	if (options.newProjectId) params.set('newProjectId', options.newProjectId);
	const response = await fetchImpl(`/api/restore/project?${params.toString()}`, {
		method: 'POST',
		headers: { 'content-type': 'application/octet-stream' },
		body: file,
	});
	if (!response.ok) {
		const body = (await response.json().catch(() => null)) as
			| { error?: string; reason?: string }
			| null;
		throw new ProjectBackupClientError(
			body?.reason ?? body?.error ?? `restore failed (HTTP ${response.status})`,
			response.status,
		);
	}
	return (await response.json()) as RestoreProjectResult;
}

/**
 * Browser-side helper that triggers a download of the given archive
 * blob. Kept here so call sites stay tiny.
 */
export function triggerArchiveDownload(result: DownloadProjectBackupResult): void {
	const url = URL.createObjectURL(result.archive);
	const a = document.createElement('a');
	a.href = url;
	a.download = result.filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
