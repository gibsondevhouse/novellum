import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';
import { migration0001 } from '$lib/server/db/migrations/0001_baseline.js';

describe('migration registry – from v1 baseline', () => {
	it('rolls a v1 DB forward through later migrations without losing data', () => {
		const db = new Database(':memory:');
		try {
			// Simulate a DB that only has migration 0001 applied.
			runMigrations(db, [migration0001]);
			db.prepare(
				"INSERT INTO projects (id, title, createdAt, updatedAt) VALUES ('p1', 'My Project', '2026-01-01', '2026-01-01')",
			).run();
			expect(
				db
					.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='backup_snapshots'")
					.get(),
			).toBeUndefined();

			// Now run the full registry — should add 0002 and beyond.
			const result = runMigrations(db, MIGRATION_REGISTRY);

			// 0001 was already applied → must be skipped, others applied.
			expect(result.skipped.map((s) => s.version)).toContain(1);
			const appliedVersions = result.applied.map((a) => a.version);
			for (const m of MIGRATION_REGISTRY) {
				if (m.version !== 1) expect(appliedVersions).toContain(m.version);
			}

			// Data preserved.
			const project = db
				.prepare("SELECT id, title FROM projects WHERE id = 'p1'")
				.get() as { id: string; title: string };
			expect(project).toEqual({ id: 'p1', title: 'My Project' });

			// New table from 0002 now exists.
			expect(
				db
					.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='backup_snapshots'")
					.get(),
			).toBeTruthy();

			// schema_migrations contains all versions.
			const recorded = db
				.prepare('SELECT version FROM schema_migrations ORDER BY version')
				.all() as Array<{ version: number }>;
			expect(recorded.map((r) => r.version)).toEqual(MIGRATION_REGISTRY.map((m) => m.version));
		} finally {
			db.close();
		}
	});
});
