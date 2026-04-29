import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';

/**
 * plan-017 stage-007 phase-002 — scene_snapshots metadata.
 *
 * Locks the migration's contract: the four metadata columns must exist
 * with the documented defaults, and re-running the migration must be a
 * no-op (idempotency is the registry-wide expectation, but stage-007's
 * exit criteria call it out explicitly because the editor's autosave
 * loop runs the inserter on every keystroke).
 */
describe('migration 0003 — scene_snapshot metadata', () => {
	it('adds the four metadata columns to scene_snapshots', () => {
		const db = new Database(':memory:');
		try {
			runMigrations(db, MIGRATION_REGISTRY);

			const cols = db.prepare('PRAGMA table_info(scene_snapshots)').all() as Array<{
				name: string;
				type: string;
				dflt_value: string | null;
			}>;
			const byName = new Map(cols.map((c) => [c.name, c]));

			expect(byName.has('wordCount')).toBe(true);
			expect(byName.has('label')).toBe(true);
			expect(byName.has('source')).toBe(true);
			expect(byName.has('reason')).toBe(true);

			expect(byName.get('source')?.dflt_value).toBe(`'autosave'`);
			expect(byName.get('wordCount')?.type).toBe('INTEGER');
		} finally {
			db.close();
		}
	});

	it('is idempotent — re-running does not duplicate columns', () => {
		const db = new Database(':memory:');
		try {
			runMigrations(db, MIGRATION_REGISTRY);
			// Force the migration to run a second time by clearing the
			// recorded version, then re-applying the same registry.
			db.exec('DELETE FROM schema_migrations WHERE version = 3');
			runMigrations(db, MIGRATION_REGISTRY);

			const cols = db.prepare('PRAGMA table_info(scene_snapshots)').all() as Array<{
				name: string;
			}>;
			const wordCountCols = cols.filter((c) => c.name === 'wordCount');
			expect(wordCountCols).toHaveLength(1);
		} finally {
			db.close();
		}
	});

	it('inserted rows expose the new columns with the documented defaults', () => {
		const db = new Database(':memory:');
		try {
			runMigrations(db, MIGRATION_REGISTRY);
			db.prepare(
				`INSERT INTO scene_snapshots (id, sceneId, projectId, text, createdAt)
				 VALUES (?, ?, ?, ?, ?)`,
			).run('snap-1', 'scene-1', 'project-1', 'hello world', new Date().toISOString());

			const row = db.prepare('SELECT * FROM scene_snapshots WHERE id = ?').get('snap-1') as {
				wordCount: number;
				label: string;
				source: string;
				reason: string;
			};
			expect(row.wordCount).toBe(0);
			expect(row.label).toBe('');
			expect(row.source).toBe('autosave');
			expect(row.reason).toBe('');
		} finally {
			db.close();
		}
	});
});
