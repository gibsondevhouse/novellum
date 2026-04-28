import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index.js';
import {
	parseBackup,
	BackupParseError,
	DEFAULT_BACKUP_SIZE_LIMIT,
} from '$lib/server/restore/parse-backup.js';
import { validateBackup } from '$lib/server/restore/validate-backup.js';
import {
	restoreProject,
	type RestoreMode,
} from '$lib/server/restore/restore-project.js';

interface RestorePayload {
	readonly bytes: Uint8Array;
	readonly mode: RestoreMode;
	readonly targetProjectId?: string;
	readonly newProjectId?: string;
}

async function readPayload(request: Request): Promise<RestorePayload | { error: string }> {
	const contentType = request.headers.get('content-type') ?? '';
	if (contentType.startsWith('multipart/form-data')) {
		const form = await request.formData();
		const file = form.get('file');
		if (!(file instanceof Blob)) return { error: 'multipart upload missing "file" field' };
		const mode = form.get('mode');
		if (mode !== 'overwrite' && mode !== 'copy') {
			return { error: 'mode must be "overwrite" or "copy"' };
		}
		const targetProjectId = form.get('targetProjectId');
		const newProjectId = form.get('newProjectId');
		return {
			bytes: new Uint8Array(await file.arrayBuffer()),
			mode,
			targetProjectId: typeof targetProjectId === 'string' ? targetProjectId : undefined,
			newProjectId: typeof newProjectId === 'string' ? newProjectId : undefined,
		};
	}
	if (
		contentType.startsWith('application/octet-stream') ||
		contentType.includes('zip') ||
		contentType === ''
	) {
		const url = new URL(request.url);
		const mode = url.searchParams.get('mode');
		if (mode !== 'overwrite' && mode !== 'copy') {
			return { error: 'mode must be "overwrite" or "copy"' };
		}
		const bytes = new Uint8Array(await request.arrayBuffer());
		return {
			bytes,
			mode,
			targetProjectId: url.searchParams.get('targetProjectId') ?? undefined,
			newProjectId: url.searchParams.get('newProjectId') ?? undefined,
		};
	}
	return { error: `unsupported content-type: ${contentType}` };
}

export const POST: RequestHandler = async ({ request }) => {
	const payload = await readPayload(request);
	if ('error' in payload) {
		return json({ error: 'restore_refused', reason: payload.error }, { status: 400 });
	}
	if (payload.bytes.byteLength > DEFAULT_BACKUP_SIZE_LIMIT) {
		return json(
			{ error: 'restore_refused', reason: 'archive exceeds size limit' },
			{ status: 400 },
		);
	}

	let parsed;
	try {
		parsed = await parseBackup(payload.bytes);
	} catch (cause) {
		if (cause instanceof BackupParseError) {
			return json({ error: 'restore_refused', reason: cause.message }, { status: 400 });
		}
		return json({ error: 'restore_failed' }, { status: 500 });
	}

	const preview = validateBackup(parsed);
	if (!preview.compatibility.canRestore) {
		return json(
			{ error: 'restore_refused', warnings: preview.warnings },
			{ status: 422 },
		);
	}

	const result = restoreProject(db, parsed, {
		mode: payload.mode,
		targetProjectId: payload.targetProjectId,
		newProjectId: payload.newProjectId,
	});

	if (result.ok) {
		return json({
			projectId: result.projectId,
			mode: result.mode,
			snapshotPath: result.snapshotPath,
			tableRowCounts: result.tableRowCounts,
		});
	}

	const refusalCodes = new Set(['project_id_mismatch', 'project_id_collision', 'unknown_table']);
	if (refusalCodes.has(result.code)) {
		return json(
			{ error: 'restore_refused', code: result.code, reason: result.message },
			{ status: 422 },
		);
	}

	return json(
		{ error: 'restore_failed', reason: result.message, snapshotPath: result.snapshotPath },
		{ status: 500 },
	);
};
