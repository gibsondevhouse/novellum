import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import {
	runMigrations,
	getAppliedMigrations,
	MigrationVersionAheadError,
	MigrationFailedError,
	type Migration,
} from '$lib/server/db/migration-runner.js';

function makeMigration(version: number, name: string, up: (db: Database.Database) => void): Migration {
	return { version, name, checksum: `sha-${version}-${name}`, up };
}

const m001 = makeMigration(1, 'create_widgets', (db) => {
	db.exec('CREATE TABLE widgets (id TEXT PRIMARY KEY, name TEXT NOT NULL)');
});

const m002 = makeMigration(2, 'add_widget_color', (db) => {
	db.exec("ALTER TABLE widgets ADD COLUMN color TEXT NOT NULL DEFAULT ''");
});

const m003 = makeMigration(3, 'create_index', (db) => {
	db.exec('CREATE INDEX idx_widgets_name ON widgets(name)');
});

let db: Database.Database;

beforeEach(() => {
	db = new Database(':memory:');
});

describe('migration-runner', () => {
	it('applies all migrations in order on an empty database', () => {
		const result = runMigrations(db, [m001, m002, m003]);
		expect(result.applied.map((a) => a.version)).toEqual([1, 2, 3]);
		expect(result.skipped).toEqual([]);

		const applied = getAppliedMigrations(db);
		expect(applied.map((a) => a.version)).toEqual([1, 2, 3]);
		expect(applied[0].name).toBe('create_widgets');
		expect(applied[0].checksum).toBe('sha-1-create_widgets');
	});

	it('is idempotent: a second run is a no-op', () => {
		runMigrations(db, [m001, m002]);
		const before = getAppliedMigrations(db);
		const result = runMigrations(db, [m001, m002]);

		expect(result.applied).toEqual([]);
		expect(result.skipped.map((s) => s.version)).toEqual([1, 2]);

		const after = getAppliedMigrations(db);
		expect(after).toEqual(before);
	});

	it('only applies pending migrations when partial state exists', () => {
		runMigrations(db, [m001]);
		const result = runMigrations(db, [m001, m002, m003]);

		expect(result.applied.map((a) => a.version)).toEqual([2, 3]);
		expect(result.skipped.map((s) => s.version)).toEqual([1]);
	});

	it('rolls back a failing migration and records nothing', () => {
		const broken = makeMigration(2, 'broken', (handle) => {
			handle.exec("ALTER TABLE widgets ADD COLUMN color TEXT NOT NULL DEFAULT ''");
			throw new Error('intentional failure');
		});

		runMigrations(db, [m001]);

		expect(() => runMigrations(db, [m001, broken])).toThrow(MigrationFailedError);

		const applied = getAppliedMigrations(db);
		expect(applied.map((a) => a.version)).toEqual([1]);

		// Schema must not contain the partial column added before the throw.
		const columns = db.prepare('PRAGMA table_info(widgets)').all() as Array<{ name: string }>;
		expect(columns.some((c) => c.name === 'color')).toBe(false);
	});

	it('throws MigrationVersionAheadError when DB recorded version exceeds bundled max', () => {
		runMigrations(db, [m001, m002, m003]);
		// Simulate a DB written by a newer build.
		db.prepare(
			'INSERT INTO schema_migrations (version, name, applied_at, checksum, app_version) VALUES (?, ?, ?, ?, ?)',
		).run(99, 'future', new Date().toISOString(), 'sha-99', 'v999');

		expect(() => runMigrations(db, [m001, m002, m003])).toThrow(MigrationVersionAheadError);
	});

	it('throws on duplicate versions in the registry before any DDL runs', () => {
		const duplicate = makeMigration(1, 'duplicate', () => {});
		expect(() => runMigrations(db, [m001, duplicate])).toThrow(/Duplicate migration version/);
	});

	it('handles an empty registry as a no-op and creates schema_migrations', () => {
		const result = runMigrations(db, []);
		expect(result.applied).toEqual([]);
		expect(result.skipped).toEqual([]);
		const tables = db
			.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'")
			.all();
		expect(tables.length).toBe(1);
	});

	it('records applied_at and app_version from options', () => {
		runMigrations(db, [m001], {
			now: () => '2026-04-28T00:00:00.000Z',
			appVersion: '1.2.3',
		});
		const row = db
			.prepare('SELECT applied_at, app_version FROM schema_migrations WHERE version = 1')
			.get() as { applied_at: string; app_version: string };
		expect(row.applied_at).toBe('2026-04-28T00:00:00.000Z');
		expect(row.app_version).toBe('1.2.3');
	});

	it('invokes beforeApply only when there are pending migrations', () => {
		const calls: number[] = [];
		runMigrations(db, [m001], {
			beforeApply: ({ pending }) => {
				calls.push(pending.length);
			},
		});
		runMigrations(db, [m001], {
			beforeApply: ({ pending }) => {
				calls.push(pending.length);
			},
		});
		expect(calls).toEqual([1]);
	});
});
