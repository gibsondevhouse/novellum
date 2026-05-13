import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { resolveAppDataDir } from '$lib/server/app-data/path.js';

/**
 * Pre-migration safety snapshot.
 *
 * Writes a complete copy of the live SQLite database to the snapshots root
 * before any pending migration runs. Uses `VACUUM INTO` so the operation is
 * fully synchronous and produces a single self-contained file (no WAL).
 *
 * The snapshot is registered in the `backup_snapshots` table created by
 * migration `0002_add_backup_metadata`. If that migration has not yet been
 * applied at the time of the call (e.g. very first boot of a legacy DB),
 * registration is skipped — the file on disk is still the source of truth.
 */

export interface SnapshotInfo {
	id: string;
	path: string;
}

function resolveSnapshotsRoot(): string {
	// Packaged Tauri builds have `process.cwd()` pointing at wherever the
	// OS launched Node from (often the user's home), which would scatter
	// pre-migration snapshots far from the live DB. Anchor to the active
	// app-data directory so the snapshot sits next to the database it
	// guards.
	return (
		process.env.NOVELLUM_SNAPSHOTS_DIR ?? join(resolveAppDataDir(), '.novellum-snapshots')
	);
}

function backupSnapshotsTableExists(db: Database.Database): boolean {
	const row = db
		.prepare(
			"SELECT 1 AS present FROM sqlite_master WHERE type = 'table' AND name = 'backup_snapshots'",
		)
		.get() as { present: number } | undefined;
	return row?.present === 1;
}

export interface WriteSnapshotOptions {
	root?: string;
	now?: () => Date;
	appVersion?: string;
	note?: string;
	/**
	 * Snapshot category recorded in `backup_snapshots.kind`. Used to
	 * distinguish pre-migration backups from pre-restore backups.
	 * Defaults to `'pre-migration'` for backwards compatibility.
	 */
	kind?: string;
}

function buildSnapshotFilenameFor(kind: string, currentVersion: number, now: Date): string {
	const iso = now.toISOString().replace(/[:.]/g, '-');
	return `${kind}-${iso}-v${currentVersion}.sqlite`;
}

export function writePreMigrationSnapshot(
	db: Database.Database,
	currentVersion: number,
	options: WriteSnapshotOptions = {},
): SnapshotInfo {
	const root = options.root ?? resolveSnapshotsRoot();
	mkdirSync(root, { recursive: true });

	const kind = options.kind ?? 'pre-migration';
	const now = options.now ? options.now() : new Date();
	let filename = buildSnapshotFilenameFor(kind, currentVersion, now);
	let path = join(root, filename);

	// Extremely rare: same-millisecond filename collision. Append a short
	// random suffix to disambiguate without overwriting.
	try {
		db.exec(`VACUUM INTO '${path.replaceAll("'", "''")}'`);
	} catch (cause) {
		const err = cause as Error;
		if (/file exists/i.test(err.message)) {
			const suffix = randomUUID().slice(0, 8);
			filename = `${filename.replace(/\.sqlite$/, '')}-${suffix}.sqlite`;
			path = join(root, filename);
			db.exec(`VACUUM INTO '${path.replaceAll("'", "''")}'`);
		} else {
			throw cause;
		}
	}

	const id = randomUUID();

	if (backupSnapshotsTableExists(db)) {
		db.prepare(
			`INSERT INTO backup_snapshots
				(id, kind, created_at, path, app_version, schema_version, note)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		).run(
			id,
			kind,
			now.toISOString(),
			path,
			options.appVersion ?? '',
			currentVersion,
			options.note ?? '',
		);
	}

	return { id, path };
}
