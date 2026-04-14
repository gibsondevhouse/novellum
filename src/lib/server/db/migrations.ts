import type Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from './schema.js';

function ensureProjectsCoverUrlColumn(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;
	const hasCoverUrl = columns.some((column) => column.name === 'coverUrl');

	if (!hasCoverUrl) {
		db.exec("ALTER TABLE projects ADD COLUMN coverUrl TEXT NOT NULL DEFAULT ''");
	}
}

function ensureProjectsPromptColumns(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;
	const hasSystemPrompt = columns.some((column) => column.name === 'systemPrompt');

	if (!hasSystemPrompt) {
		db.exec("ALTER TABLE projects ADD COLUMN systemPrompt TEXT NOT NULL DEFAULT ''");
		db.exec("ALTER TABLE projects ADD COLUMN negativePrompt TEXT NOT NULL DEFAULT ''");
	}
}

export function runMigrations(db: Database.Database): void {
	db.transaction(() => {
		db.exec(SCHEMA_SQL);
		ensureProjectsCoverUrlColumn(db);
		ensureProjectsPromptColumns(db);
		db.exec(INDEX_SQL);
	})();
}
