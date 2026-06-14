import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';

const FTS_TABLES = [
	'project_search_scenes',
	'project_search_characters',
	'project_search_locations',
	'project_search_lore',
	'project_search_plot_threads',
	'project_search_timeline_events',
	'project_search_outline_items',
	'project_search_artifacts',
] as const;

function freshDb(): Database.Database {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	return db;
}

describe('migration 0007 – project search FTS', () => {
	it('creates all FTS virtual tables', () => {
		const db = freshDb();
		for (const table of FTS_TABLES) {
			const row = db
				.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
				.get(table);
			expect(row, `expected FTS table ${table} to exist`).toBeDefined();
		}
	});

	it('is idempotent when applied twice', () => {
		const db = new Database(':memory:');
		runMigrations(db, MIGRATION_REGISTRY);
		// Running again should not throw (IF NOT EXISTS guards).
		expect(() => runMigrations(db, MIGRATION_REGISTRY)).not.toThrow();
	});

	it('can insert and query rows in project_search_scenes', () => {
		const db = freshDb();
		db.prepare(
			`INSERT INTO project_search_scenes (projectId, entityId, title, content) VALUES (?, ?, ?, ?)`,
		).run('proj-1', 'scene-1', 'The Battle', 'Armies clashed at dawn beneath a stormy sky.');

		const rows = db
			.prepare(`SELECT entityId FROM project_search_scenes WHERE project_search_scenes MATCH ?`)
			.all('battle');
		expect(rows.length).toBeGreaterThan(0);
	});

	it('can insert and delete rows without leaving orphans', () => {
		const db = freshDb();
		db.prepare(
			`INSERT INTO project_search_characters (projectId, entityId, name, bio, notes) VALUES (?, ?, ?, ?, ?)`,
		).run('proj-1', 'char-1', 'Elara', 'A skilled mage.', '');

		db.prepare(`DELETE FROM project_search_characters WHERE entityId = ?`).run('char-1');

		const rows = db
			.prepare(
				`SELECT entityId FROM project_search_characters WHERE project_search_characters MATCH ?`,
			)
			.all('mage');
		expect(rows.length).toBe(0);
	});

	it('projectId filter isolates results across projects', () => {
		const db = freshDb();
		db.prepare(
			`INSERT INTO project_search_lore (projectId, entityId, title, content) VALUES (?, ?, ?, ?)`,
		).run('proj-A', 'lore-A', 'The Old Gods', 'Ancient deities of shadow and fire.');
		db.prepare(
			`INSERT INTO project_search_lore (projectId, entityId, title, content) VALUES (?, ?, ?, ?)`,
		).run('proj-B', 'lore-B', 'Shadow Realm', 'A dimension of darkness where shadow creatures dwell.');

		const rowsA = db
			.prepare(
				`SELECT entityId FROM project_search_lore WHERE projectId = ? AND project_search_lore MATCH ?`,
			)
			.all('proj-A', 'shadow');
		const rowsB = db
			.prepare(
				`SELECT entityId FROM project_search_lore WHERE projectId = ? AND project_search_lore MATCH ?`,
			)
			.all('proj-B', 'shadow');

		expect(rowsA.map((r: unknown) => (r as { entityId: string }).entityId)).toEqual(['lore-A']);
		expect(rowsB.map((r: unknown) => (r as { entityId: string }).entityId)).toEqual(['lore-B']);
	});
});
