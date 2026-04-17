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

function ensureProjectTypeAndLastOpened(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;

	if (!columns.some((c) => c.name === 'projectType')) {
		db.exec("ALTER TABLE projects ADD COLUMN projectType TEXT NOT NULL DEFAULT 'novel'");
	}
	if (!columns.some((c) => c.name === 'lastOpenedAt')) {
		db.exec("ALTER TABLE projects ADD COLUMN lastOpenedAt TEXT NOT NULL DEFAULT ''");
	}
}

function ensureStylePresetIdColumn(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;
	if (!columns.some((c) => c.name === 'stylePresetId')) {
		db.exec("ALTER TABLE projects ADD COLUMN stylePresetId TEXT NOT NULL DEFAULT ''");
	}
}

function ensureScenesNotesColumn(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(scenes)').all() as Array<{ name: string }>;
	if (!columns.some((c) => c.name === 'notes')) {
		db.exec("ALTER TABLE scenes ADD COLUMN notes TEXT NOT NULL DEFAULT ''");
	}
}

export function runMigrations(db: Database.Database): void {
	db.transaction(() => {
		db.exec(SCHEMA_SQL);
		ensureProjectsCoverUrlColumn(db);
		ensureProjectsPromptColumns(db);
		ensureProjectTypeAndLastOpened(db);
		ensureStylePresetIdColumn(db);
		ensureScenesNotesColumn(db);
		db.exec(INDEX_SQL);
	})();
}
