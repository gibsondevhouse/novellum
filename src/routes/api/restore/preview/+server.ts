import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	parseBackup,
	BackupParseError,
	DEFAULT_BACKUP_SIZE_LIMIT,
} from '$lib/server/restore/parse-backup.js';
import { validateBackup } from '$lib/server/restore/validate-backup.js';

export const POST: RequestHandler = async ({ request }) => {
	const contentType = request.headers.get('content-type') ?? '';
	let bytes: Uint8Array;

	if (contentType.startsWith('multipart/form-data')) {
		const form = await request.formData();
		const file = form.get('file');
		if (!(file instanceof Blob)) {
			return json(
				{ error: 'parse_failed', reason: 'multipart upload missing "file" field' },
				{ status: 400 },
			);
		}
		bytes = new Uint8Array(await file.arrayBuffer());
	} else if (contentType.startsWith('application/octet-stream') || contentType.includes('zip')) {
		bytes = new Uint8Array(await request.arrayBuffer());
	} else {
		return json(
			{ error: 'parse_failed', reason: `unsupported content-type: ${contentType}` },
			{ status: 400 },
		);
	}

	if (bytes.byteLength > DEFAULT_BACKUP_SIZE_LIMIT) {
		return json(
			{
				error: 'parse_failed',
				reason: `archive exceeds size limit (${bytes.byteLength} > ${DEFAULT_BACKUP_SIZE_LIMIT} bytes)`,
			},
			{ status: 400 },
		);
	}

	let preview;
	try {
		const parsed = await parseBackup(bytes);
		preview = validateBackup(parsed);
	} catch (cause) {
		if (cause instanceof BackupParseError) {
			return json({ error: 'parse_failed', reason: cause.message }, { status: 400 });
		}
		console.error('[restore.preview] unexpected failure', cause);
		return json({ error: 'preview_failed' }, { status: 500 });
	}

	return json(preview);
};
