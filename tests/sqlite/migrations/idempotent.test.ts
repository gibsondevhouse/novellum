import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import {
	runMigrations,
	MIGRATION_REGISTRY,
	MigrationVersionAheadError,
} from '$lib/server/db';

describe('migration registry – idempotent re-run', () => {
	it('a second run is a no-op and preserves applied_at timestamps', () => {
		const db = new Database(':memory:');
		try {
			const first = runMigrations(db, MIGRATION_REGISTRY);
			expect(first.applied.length).toBe(MIGRATION_REGISTRY.length);

			const before = db
				.prepare('SELECT version, applied_at FROM schema_migrations ORDER BY version')
				.all() as Array<{ version: number; applied_at: string }>;

			const second = runMigrations(db, MIGRATION_REGISTRY);
			expect(second.applied.length).toBe(0);
			expect(second.skipped.map((s) => s.version)).toEqual(
				MIGRATION_REGISTRY.map((m) => m.version),
			);

			const after = db
				.prepare('SELECT version, applied_at FROM schema_migrations ORDER BY version')
				.all() as Array<{ version: number; applied_at: string }>;
			expect(after).toEqual(before);
		} finally {
			db.close();
		}
	});

	it('refuses to run when the recorded version is ahead of the bundled registry', () => {
		const db = new Database(':memory:');
		try {
			runMigrations(db, MIGRATION_REGISTRY);

			const maxVersion = Math.max(...MIGRATION_REGISTRY.map((m) => m.version));
			db.prepare(
				'INSERT INTO schema_migrations (version, name, applied_at, checksum, app_version) VALUES (?, ?, ?, ?, ?)',
			).run(maxVersion + 1, 'from_the_future', new Date().toISOString(), 'future-v1', '');

			expect(() => runMigrations(db, MIGRATION_REGISTRY)).toThrow(MigrationVersionAheadError);
		} finally {
			db.close();
		}
	});
});
