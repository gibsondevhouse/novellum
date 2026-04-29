import Database from 'better-sqlite3';
import { runMigrations } from './migration-runner.js';
import { MIGRATION_REGISTRY } from './migration-registry.js';
import { resolveDatabasePath } from './path.js';
import { writePreMigrationSnapshot } from './snapshot.js';

const dbPath = resolveDatabasePath();

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
runMigrations(db, MIGRATION_REGISTRY, {
	beforeApply: ({ currentVersion }) => {
		// Skip snapshot when there is no DB to protect (fresh boot).
		if (currentVersion === 0) return;
		const { path } = writePreMigrationSnapshot(db, currentVersion);
		return { snapshotPath: path };
	},
});

export { db };
