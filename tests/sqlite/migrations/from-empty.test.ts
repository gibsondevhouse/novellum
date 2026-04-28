import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY, SCHEMA_SQL, INDEX_SQL } from '$lib/server/db';

function tableNames(sql: string): string[] {
	return [...sql.matchAll(/CREATE TABLE IF NOT EXISTS\s+(\w+)/gi)].map((m) => m[1]);
}

function indexNames(sql: string): string[] {
	return [...sql.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+(\w+)/gi)].map(
		(m) => m[1],
	);
}

describe('migration registry – from empty', () => {
	it('produces canonical schema and records every migration', () => {
		const db = new Database(':memory:');
		try {
			const result = runMigrations(db, MIGRATION_REGISTRY);
			expect(result.applied.length).toBe(MIGRATION_REGISTRY.length);

			// Every table from SCHEMA_SQL should exist.
			const expectedTables = tableNames(SCHEMA_SQL);
			expect(expectedTables.length).toBeGreaterThan(0);
			for (const name of expectedTables) {
				const row = db
					.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
					.get(name);
				expect(row, `expected table ${name} to exist`).toBeTruthy();
			}

			// Every index from INDEX_SQL should exist.
			for (const name of indexNames(INDEX_SQL)) {
				const row = db
					.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name = ?")
					.get(name);
				expect(row, `expected index ${name} to exist`).toBeTruthy();
			}

			// schema_migrations should match registry exactly.
			const recorded = db
				.prepare('SELECT version, name FROM schema_migrations ORDER BY version')
				.all() as Array<{ version: number; name: string }>;
			expect(recorded).toEqual(
				MIGRATION_REGISTRY.map((m) => ({ version: m.version, name: m.name })),
			);

			// backup_snapshots (from migration 0002) should also exist.
			const tbl = db
				.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='backup_snapshots'")
				.get();
			expect(tbl).toBeTruthy();
		} finally {
			db.close();
		}
	});
});
