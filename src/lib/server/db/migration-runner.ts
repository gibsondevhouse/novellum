import type Database from 'better-sqlite3';

/**
 * Versioned, idempotent SQLite migration runner.
 *
 * Each registered migration is applied exactly once, in version order, inside
 * its own `BEGIN IMMEDIATE` transaction. Successful application is recorded in
 * `schema_migrations(version, name, applied_at, checksum, app_version)`.
 *
 * Failure modes:
 * - duplicate `version` in the registry → throws at call time before any DDL.
 * - migration body throws → transaction rolls back; no row recorded; rethrown
 *   as a `MigrationFailedError` with `{ version, name, cause, snapshotPath? }`.
 * - DB records a version higher than any bundled migration → throws
 *   `MigrationVersionAheadError` (DB came from a newer app build).
 */

export interface Migration {
	version: number;
	name: string;
	checksum: string;
	up: (db: Database.Database) => void;
}

export class MigrationVersionAheadError extends Error {
	readonly recordedVersion: number;
	readonly bundledVersion: number;
	constructor(recordedVersion: number, bundledVersion: number) {
		super(
			`Database schema version ${recordedVersion} is ahead of bundled max ${bundledVersion}. ` +
				'This database was created by a newer build of Novellum. ' +
				'Update the application or restore from a backup.',
		);
		this.name = 'MigrationVersionAheadError';
		this.recordedVersion = recordedVersion;
		this.bundledVersion = bundledVersion;
	}
}

export class MigrationFailedError extends Error {
	readonly version: number;
	readonly migrationName: string;
	snapshotPath?: string;
	constructor(version: number, migrationName: string, cause: unknown) {
		super(
			`Migration ${version} (${migrationName}) failed: ${
				cause instanceof Error ? cause.message : String(cause)
			}`,
			{ cause },
		);
		this.name = 'MigrationFailedError';
		this.version = version;
		this.migrationName = migrationName;
	}
}

interface AppliedRow {
	version: number;
	name: string;
	applied_at: string;
	checksum: string;
}

function ensureRegistryTable(db: Database.Database): void {
	db.exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			applied_at TEXT NOT NULL,
			checksum TEXT NOT NULL,
			app_version TEXT NOT NULL DEFAULT ''
		);
	`);
}

function assertNoDuplicateVersions(migrations: readonly Migration[]): void {
	const seen = new Set<number>();
	for (const m of migrations) {
		if (seen.has(m.version)) {
			throw new Error(`Duplicate migration version ${m.version} in registry`);
		}
		seen.add(m.version);
	}
}

export function getAppliedMigrations(db: Database.Database): AppliedRow[] {
	ensureRegistryTable(db);
	return db
		.prepare(
			'SELECT version, name, applied_at, checksum FROM schema_migrations ORDER BY version ASC',
		)
		.all() as AppliedRow[];
}

export interface RunMigrationsOptions {
	appVersion?: string;
	now?: () => string;
	beforeApply?: (info: {
		pending: Migration[];
		currentVersion: number;
	}) => { snapshotPath?: string } | void;
}

export interface RunMigrationsResult {
	applied: Array<{ version: number; name: string }>;
	skipped: Array<{ version: number; name: string }>;
	snapshotPath?: string;
}

/**
 * Apply pending migrations in version order. Idempotent: a second call with
 * the same registry is a no-op.
 */
export function runMigrations(
	db: Database.Database,
	migrations: readonly Migration[],
	options: RunMigrationsOptions = {},
): RunMigrationsResult {
	assertNoDuplicateVersions(migrations);

	const sorted = [...migrations].sort((a, b) => a.version - b.version);
	const bundledMax = sorted.length === 0 ? 0 : sorted[sorted.length - 1].version;

	ensureRegistryTable(db);
	const applied = getAppliedMigrations(db);
	const appliedVersions = new Set(applied.map((row) => row.version));
	const recordedMax = applied.reduce((max, row) => (row.version > max ? row.version : max), 0);

	if (recordedMax > bundledMax) {
		throw new MigrationVersionAheadError(recordedMax, bundledMax);
	}

	const pending = sorted.filter((m) => !appliedVersions.has(m.version));
	const skipped = sorted
		.filter((m) => appliedVersions.has(m.version))
		.map((m) => ({ version: m.version, name: m.name }));

	if (pending.length === 0) {
		return { applied: [], skipped };
	}

	let snapshotPath: string | undefined;
	if (options.beforeApply) {
		const result = options.beforeApply({ pending, currentVersion: recordedMax });
		if (result && typeof (result as Promise<unknown>).then === 'function') {
			throw new Error(
				'runMigrations.beforeApply returned a Promise; use the synchronous form. ' +
					'Perform async pre-flight work before calling runMigrations.',
			);
		}
		if (result && typeof result === 'object' && 'snapshotPath' in result) {
			snapshotPath = result.snapshotPath;
		}
	}

	const now = options.now ?? (() => new Date().toISOString());
	const appVersion = options.appVersion ?? '';
	const appliedNow: Array<{ version: number; name: string }> = [];

	const insert = db.prepare(
		'INSERT INTO schema_migrations (version, name, applied_at, checksum, app_version) VALUES (?, ?, ?, ?, ?)',
	);

	for (const migration of pending) {
		try {
			db.exec('BEGIN IMMEDIATE');
			migration.up(db);
			insert.run(migration.version, migration.name, now(), migration.checksum, appVersion);
			db.exec('COMMIT');
			appliedNow.push({ version: migration.version, name: migration.name });
		} catch (cause) {
			try {
				db.exec('ROLLBACK');
			} catch {
				// Best-effort rollback. If the inner error already aborted the txn,
				// SQLite will report "no transaction is active" — safe to ignore.
			}
			const error = new MigrationFailedError(migration.version, migration.name, cause);
			error.snapshotPath = snapshotPath;
			throw error;
		}
	}

	return { applied: appliedNow, skipped, snapshotPath };
}
