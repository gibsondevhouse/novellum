import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { writePreMigrationSnapshot } from '$lib/server/db/snapshot.js';
import {
	runMigrations,
	MigrationFailedError,
	type Migration,
} from '$lib/server/db/migration-runner.js';
import { migration0001 } from '$lib/server/db/migrations/0001_baseline.js';
import { migration0002 } from '$lib/server/db/migrations/0002_add_backup_metadata.js';

let snapshotsDir: string;
let dbFile: string;
let db: Database.Database;

beforeEach(() => {
	snapshotsDir = mkdtempSync(join(tmpdir(), 'novellum-snap-'));
	dbFile = join(snapshotsDir, 'source.db');
	db = new Database(dbFile);
});

afterEach(() => {
	db.close();
	rmSync(snapshotsDir, { recursive: true, force: true });
});

function applyBaselineAndBackupTable(): void {
	runMigrations(db, [migration0001, migration0002]);
}

describe('writePreMigrationSnapshot', () => {
	it('produces a file copy of the source DB and registers it in backup_snapshots', () => {
		applyBaselineAndBackupTable();
		db.prepare(
			"INSERT INTO projects (id, title, createdAt, updatedAt) VALUES ('p1', 'Project One', '2026-01-01', '2026-01-01')",
		).run();

		const info = writePreMigrationSnapshot(db, 2, { root: snapshotsDir });

		expect(existsSync(info.path)).toBe(true);
		expect(info.path.startsWith(snapshotsDir)).toBe(true);

		const row = db
			.prepare('SELECT id, kind, schema_version, path FROM backup_snapshots WHERE id = ?')
			.get(info.id) as
			| { id: string; kind: string; schema_version: number; path: string }
			| undefined;
		expect(row?.kind).toBe('pre-migration');
		expect(row?.schema_version).toBe(2);
		expect(row?.path).toBe(info.path);

		const snapshotDb = new Database(info.path, { readonly: true });
		try {
			const project = snapshotDb
				.prepare("SELECT id, title FROM projects WHERE id = 'p1'")
				.get() as { id: string; title: string } | undefined;
			expect(project).toEqual({ id: 'p1', title: 'Project One' });
		} finally {
			snapshotDb.close();
		}
	});

	it('skips registry insert when backup_snapshots does not yet exist', () => {
		runMigrations(db, [migration0001]); // no migration 0002 → no backup_snapshots
		expect(() => writePreMigrationSnapshot(db, 1, { root: snapshotsDir })).not.toThrow();

		const files = readdirSync(snapshotsDir).filter((f) => f.endsWith('.sqlite'));
		expect(files.length).toBe(1);
	});
});

describe('runMigrations + beforeApply snapshot integration', () => {
	const m003ok: Migration = {
		version: 3,
		name: 'create_widgets',
		checksum: 'widgets-v1',
		up: (handle) => handle.exec('CREATE TABLE widgets (id TEXT PRIMARY KEY)'),
	};

	const m003broken: Migration = {
		version: 3,
		name: 'broken',
		checksum: 'broken-v1',
		up: () => {
			throw new Error('intentional');
		},
	};

	it('does NOT take a snapshot when no migrations are pending', () => {
		applyBaselineAndBackupTable();
		const calls: number[] = [];
		const result = runMigrations(db, [migration0001, migration0002], {
			beforeApply: ({ currentVersion }) => {
				calls.push(currentVersion);
				const { path } = writePreMigrationSnapshot(db, currentVersion, { root: snapshotsDir });
				return { snapshotPath: path };
			},
		});
		expect(calls).toEqual([]);
		expect(result.snapshotPath).toBeUndefined();
		const files = readdirSync(snapshotsDir).filter((f) => f.endsWith('.sqlite'));
		expect(files.length).toBe(0);
	});

	it('takes exactly one snapshot before pending migrations and exposes the path', () => {
		applyBaselineAndBackupTable();
		const result = runMigrations(db, [migration0001, migration0002, m003ok], {
			beforeApply: ({ currentVersion }) => {
				const { path } = writePreMigrationSnapshot(db, currentVersion, { root: snapshotsDir });
				return { snapshotPath: path };
			},
		});
		expect(result.applied.map((a) => a.version)).toEqual([3]);
		expect(result.snapshotPath).toBeDefined();
		expect(existsSync(result.snapshotPath ?? '')).toBe(true);

		const files = readdirSync(snapshotsDir).filter((f) => f.endsWith('.sqlite'));
		expect(files.length).toBe(1);

		const rows = db
			.prepare("SELECT kind, schema_version FROM backup_snapshots WHERE kind = 'pre-migration'")
			.all() as Array<{ kind: string; schema_version: number }>;
		expect(rows.length).toBe(1);
		expect(rows[0].schema_version).toBe(2);
	});

	it('attaches snapshotPath to MigrationFailedError when a migration throws', () => {
		applyBaselineAndBackupTable();
		try {
			runMigrations(db, [migration0001, migration0002, m003broken], {
				beforeApply: ({ currentVersion }) => {
					const { path } = writePreMigrationSnapshot(db, currentVersion, { root: snapshotsDir });
					return { snapshotPath: path };
				},
			});
			throw new Error('expected runMigrations to throw');
		} catch (err) {
			expect(err).toBeInstanceOf(MigrationFailedError);
			const failure = err as MigrationFailedError;
			expect(failure.version).toBe(3);
			expect(failure.snapshotPath).toBeDefined();
			expect(existsSync(failure.snapshotPath ?? '')).toBe(true);
		}
	});
});
