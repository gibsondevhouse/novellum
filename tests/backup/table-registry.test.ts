import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';
import {
	BACKUP_TABLE_REGISTRY,
	getProjectBackupTables,
	getBackupTableEntry,
} from '$lib/server/backup/table-registry.js';

function tablesInFullyMigratedDb(): string[] {
	const db = new Database(':memory:');
	try {
		runMigrations(db, MIGRATION_REGISTRY);
		const rows = db
			.prepare(
				"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
			)
			.all() as Array<{ name: string }>;
		return rows.map((r) => r.name);
	} finally {
		db.close();
	}
}

describe('BACKUP_TABLE_REGISTRY', () => {
	it('classifies every table that exists in a fully-migrated database', () => {
		const declared = new Set(tablesInFullyMigratedDb());
		const registered = new Set(BACKUP_TABLE_REGISTRY.map((e) => e.name));

		const missing = [...declared].filter((t) => !registered.has(t));
		const extra = [...registered].filter((t) => !declared.has(t));

		expect(missing, `tables in DB missing from registry: ${missing.join(', ')}`).toEqual([]);
		expect(extra, `registry has tables not present in DB: ${extra.join(', ')}`).toEqual([]);
	});

	it('every entry has a non-empty reason', () => {
		for (const entry of BACKUP_TABLE_REGISTRY) {
			expect(entry.reason.trim().length, `empty reason on ${entry.name}`).toBeGreaterThan(0);
		}
	});

	it('every project-scope entry that is included declares a projectIdColumn (except `projects`)', () => {
		for (const entry of BACKUP_TABLE_REGISTRY) {
			if (entry.scope !== 'project' || !entry.include) continue;
			if (entry.name === 'projects') {
				expect(entry.projectIdColumn).toBeUndefined();
				continue;
			}
			expect(
				entry.projectIdColumn,
				`${entry.name} must declare projectIdColumn`,
			).toBeTruthy();
		}
	});

	it('explicitly excludes system-internal and machine-local tables', () => {
		const schemaMig = getBackupTableEntry('schema_migrations');
		expect(schemaMig?.include).toBe(false);
		expect(schemaMig?.scope).toBe('system');

		const snapshots = getBackupTableEntry('backup_snapshots');
		expect(snapshots?.include).toBe(false);
		expect(snapshots?.scope).toBe('system');
	});

	it('getProjectBackupTables returns only included entries and includes `projects`', () => {
		const included = getProjectBackupTables();
		expect(included.every((e) => e.include)).toBe(true);
		expect(included.some((e) => e.name === 'projects')).toBe(true);
		expect(included.some((e) => e.name === 'schema_migrations')).toBe(false);
		expect(included.some((e) => e.name === 'backup_snapshots')).toBe(false);
	});

	it('has no duplicate table names', () => {
		const names = BACKUP_TABLE_REGISTRY.map((e) => e.name);
		expect(new Set(names).size).toBe(names.length);
	});
});
