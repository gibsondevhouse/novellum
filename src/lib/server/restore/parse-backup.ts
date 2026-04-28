/**
 * Read a `.novellum` ZIP archive into an in-memory representation.
 *
 * Pure parser: this module never validates manifest semantics or
 * checksums. Validation lives in `validate-backup.ts`. The archive
 * is parsed with JSZip (already used by the backup builder) so the
 * round-trip stays symmetric.
 */
import JSZip from 'jszip';

/**
 * Maximum accepted archive size, in bytes. 250MB matches the upload
 * cap used by the preview/restore HTTP routes.
 */
export const DEFAULT_BACKUP_SIZE_LIMIT = 250 * 1024 * 1024;

export interface ParsedTableFile {
	readonly rows: unknown[];
	readonly rawBytes: Uint8Array;
}

export interface ParsedBackup {
	/** Parsed `manifest.json` (as raw JSON; semantic validation happens elsewhere). */
	readonly manifest: unknown;
	/** Raw bytes of `manifest.json`, useful for re-checksumming. */
	readonly manifestBytes: Uint8Array;
	/** Map from table name → parsed rows + raw bytes. Keys derived from `db/<name>.json`. */
	readonly tableFiles: Readonly<Record<string, ParsedTableFile>>;
	/** Parsed `checksums.json`, or null if the file is missing. */
	readonly checksums: unknown;
	/** Names of files under the `assets/` folder, relative to that folder. */
	readonly assetPaths: readonly string[];
}

export class BackupParseError extends Error {
	constructor(
		message: string,
		readonly cause?: unknown,
	) {
		super(message);
		this.name = 'BackupParseError';
	}
}

export interface ParseBackupOptions {
	readonly maxBytes?: number;
}

/** Parse a `.novellum` archive's bytes. Never returns partial state. */
export async function parseBackup(
	bytes: Uint8Array,
	options: ParseBackupOptions = {},
): Promise<ParsedBackup> {
	const limit = options.maxBytes ?? DEFAULT_BACKUP_SIZE_LIMIT;
	if (bytes.byteLength > limit) {
		throw new BackupParseError(
			`archive exceeds size limit (${bytes.byteLength} > ${limit} bytes)`,
		);
	}

	let zip: JSZip;
	try {
		zip = await JSZip.loadAsync(bytes);
	} catch (cause) {
		throw new BackupParseError('archive is not a valid ZIP', cause);
	}

	const manifestEntry = zip.file('manifest.json');
	if (!manifestEntry) {
		throw new BackupParseError('archive is missing manifest.json');
	}
	const manifestBytes = await manifestEntry.async('uint8array');
	const manifestText = new TextDecoder('utf-8').decode(manifestBytes);
	let manifest: unknown;
	try {
		manifest = JSON.parse(manifestText);
	} catch (cause) {
		throw new BackupParseError('manifest.json is not valid JSON', cause);
	}

	let checksums: unknown = null;
	const checksumsEntry = zip.file('checksums.json');
	if (checksumsEntry) {
		const checksumsText = await checksumsEntry.async('string');
		try {
			checksums = JSON.parse(checksumsText);
		} catch (cause) {
			throw new BackupParseError('checksums.json is not valid JSON', cause);
		}
	}

	const tableFiles: Record<string, ParsedTableFile> = {};
	const dbEntries: { name: string; entry: JSZip.JSZipObject }[] = [];
	zip.folder('db')?.forEach((relativePath, entry) => {
		if (entry.dir) return;
		if (!relativePath.endsWith('.json')) return;
		const tableName = relativePath.slice(0, -'.json'.length);
		dbEntries.push({ name: tableName, entry });
	});

	for (const { name, entry } of dbEntries) {
		const rawBytes = await entry.async('uint8array');
		const text = new TextDecoder('utf-8').decode(rawBytes);
		let rows: unknown;
		try {
			rows = JSON.parse(text);
		} catch (cause) {
			throw new BackupParseError(`db/${name}.json is not valid JSON`, cause);
		}
		if (!Array.isArray(rows)) {
			throw new BackupParseError(`db/${name}.json must contain an array`);
		}
		tableFiles[name] = { rows, rawBytes };
	}

	const assetPaths: string[] = [];
	zip.folder('assets')?.forEach((relativePath, entry) => {
		if (entry.dir) return;
		assetPaths.push(relativePath);
	});

	return {
		manifest,
		manifestBytes,
		tableFiles,
		checksums,
		assetPaths,
	};
}
