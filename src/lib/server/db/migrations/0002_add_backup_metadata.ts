import type { Migration } from '../migration-runner.js';

/**
 * Migration 0002: backup_snapshots registry.
 *
 * Owns the table consumed by phase-003 (pre-migration safety snapshot writer)
 * and stage-004 (Backup & Restore). Intentionally not declared in
 * `SCHEMA_SQL` — the migration registry is the single source of truth for
 * this table.
 */
export const migration0002: Migration = {
	version: 2,
	name: '0002_add_backup_metadata',
	checksum: 'backup-metadata-v1',
	up(db) {
		db.exec(`
			CREATE TABLE IF NOT EXISTS backup_snapshots (
				id TEXT PRIMARY KEY,
				kind TEXT NOT NULL,
				created_at TEXT NOT NULL,
				path TEXT NOT NULL,
				app_version TEXT NOT NULL DEFAULT '',
				schema_version INTEGER NOT NULL DEFAULT 0,
				note TEXT NOT NULL DEFAULT ''
			);
		`);
		db.exec(
			'CREATE INDEX IF NOT EXISTS idx_backup_snapshots_kind_created_at ON backup_snapshots(kind, created_at DESC);',
		);
	},
};
