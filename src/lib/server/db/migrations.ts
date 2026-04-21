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

function ensureActsArcIdColumn(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(acts)').all() as Array<{ name: string }>;
	if (!columns.some((c) => c.name === 'arcId')) {
		db.exec('ALTER TABLE acts ADD COLUMN arcId TEXT');
	}
}

function ensureCharacterPresentationColumns(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(characters)').all() as Array<{ name: string }>;
	if (!columns.some((c) => c.name === 'pronunciation')) {
		db.exec("ALTER TABLE characters ADD COLUMN pronunciation TEXT NOT NULL DEFAULT ''");
	}
	if (!columns.some((c) => c.name === 'aliases')) {
		db.exec("ALTER TABLE characters ADD COLUMN aliases TEXT NOT NULL DEFAULT '[]'");
	}
	if (!columns.some((c) => c.name === 'diasporaOrigin')) {
		db.exec("ALTER TABLE characters ADD COLUMN diasporaOrigin TEXT NOT NULL DEFAULT ''");
	}
	if (!columns.some((c) => c.name === 'photoUrl')) {
		db.exec("ALTER TABLE characters ADD COLUMN photoUrl TEXT NOT NULL DEFAULT ''");
	}
	if (!columns.some((c) => c.name === 'bio')) {
		db.exec("ALTER TABLE characters ADD COLUMN bio TEXT NOT NULL DEFAULT ''");
	}
	if (!columns.some((c) => c.name === 'faction')) {
		db.exec("ALTER TABLE characters ADD COLUMN faction TEXT NOT NULL DEFAULT ''");
	}
	if (!columns.some((c) => c.name === 'anomalies')) {
		db.exec("ALTER TABLE characters ADD COLUMN anomalies TEXT NOT NULL DEFAULT '[]'");
	}
}

function ensureLocationNarrativeColumns(db: Database.Database): void {
	const columns = db.prepare('PRAGMA table_info(locations)').all() as Array<{ name: string }>;

	const stringColumns = [
		['kind', "TEXT NOT NULL DEFAULT ''"],
		['realmType', "TEXT NOT NULL DEFAULT ''"],
		['realityRules', "TEXT NOT NULL DEFAULT ''"],
		['culturalBaseline', "TEXT NOT NULL DEFAULT ''"],
		['powerStructure', "TEXT NOT NULL DEFAULT ''"],
		['conflictPressure', "TEXT NOT NULL DEFAULT ''"],
		['storyRole', "TEXT NOT NULL DEFAULT ''"],
		['tone', "TEXT NOT NULL DEFAULT ''"],
		['realmId', "TEXT NOT NULL DEFAULT ''"],
		['environment', "TEXT NOT NULL DEFAULT ''"],
		['purpose', "TEXT NOT NULL DEFAULT ''"],
		['activityType', "TEXT NOT NULL DEFAULT ''"],
		['emotionalTone', "TEXT NOT NULL DEFAULT ''"],
		['changeOverTime', "TEXT NOT NULL DEFAULT ''"],
	] as const;

	for (const [columnName, columnType] of stringColumns) {
		if (!columns.some((column) => column.name === columnName)) {
			db.exec(`ALTER TABLE locations ADD COLUMN ${columnName} ${columnType}`);
		}
	}

	const jsonColumns = ['notableFeatures', 'landmarkIds', 'factionIds', 'characterIds', 'threadIds'] as const;
	for (const columnName of jsonColumns) {
		if (!columns.some((column) => column.name === columnName)) {
			db.exec(`ALTER TABLE locations ADD COLUMN ${columnName} TEXT NOT NULL DEFAULT '[]'`);
		}
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
		ensureActsArcIdColumn(db);
		ensureCharacterPresentationColumns(db);
		ensureLocationNarrativeColumns(db);
		db.exec(INDEX_SQL);
	})();
}
