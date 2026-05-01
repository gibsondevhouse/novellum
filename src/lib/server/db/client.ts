import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { runMigrations } from './migration-runner.js';
import { MIGRATION_REGISTRY } from './migration-registry.js';
import { resolveDatabasePath } from './path.js';
import { writePreMigrationSnapshot } from './snapshot.js';

const dbPath = resolveDatabasePath();

// Ensure the parent directory exists for filesystem-backed paths.
// `:memory:` and any sqlite-internal pseudo-paths are passed through.
// Without this, opening the DB throws "Cannot open database because
// the directory does not exist" in fresh installs and during
// SvelteKit's `analyse` postbuild step on machines that have never
// launched the desktop app.
if (dbPath !== ':memory:' && !dbPath.startsWith(':')) {
	mkdirSync(dirname(dbPath), { recursive: true });
}

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
