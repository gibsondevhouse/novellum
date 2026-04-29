import type { Database } from 'better-sqlite3';
import type { Migration } from '../migration-runner.js';

/**
 * Migration 0003: scene_snapshots metadata.
 *
 * Promotes scene snapshots from a flat append-only table to a
 * metadata-rich trust artefact for plan-017 stage-007. New columns
 * are nullable / defaulted so the migration is non-destructive and
 * idempotent on existing rows. The base table itself is owned by the
 * SCHEMA_SQL bootstrap; this migration only adds columns when they
 * are missing.
 */
function ensureSceneSnapshotsMetadataColumns(db: Database): void {
	const cols = db.prepare('PRAGMA table_info(scene_snapshots)').all() as Array<{ name: string }>;
	if (!cols.some((c) => c.name === 'wordCount')) {
		db.exec('ALTER TABLE scene_snapshots ADD COLUMN wordCount INTEGER NOT NULL DEFAULT 0');
	}
	if (!cols.some((c) => c.name === 'label')) {
		db.exec("ALTER TABLE scene_snapshots ADD COLUMN label TEXT NOT NULL DEFAULT ''");
	}
	if (!cols.some((c) => c.name === 'source')) {
		db.exec("ALTER TABLE scene_snapshots ADD COLUMN source TEXT NOT NULL DEFAULT 'autosave'");
	}
	if (!cols.some((c) => c.name === 'reason')) {
		db.exec("ALTER TABLE scene_snapshots ADD COLUMN reason TEXT NOT NULL DEFAULT ''");
	}
}

export const migration0003: Migration = {
	version: 3,
	name: '0003_scene_snapshot_metadata',
	checksum: 'snapshot-metadata-v1',
	up(db) {
		ensureSceneSnapshotsMetadataColumns(db);
	},
};
