import type { Migration } from '../migration-runner.js';

/**
 * Migration 0004: Pipeline Entities.
 *
 * Adds first-class tables for factions, themes, and glossary terms
 * to support the AI pipeline worldbuilding and authoring stages.
 */
export const migration0004: Migration = {
	version: 4,
	name: '0004_pipeline_entities',
	checksum: 'pipeline-entities-v1',
	up(db) {
		// 1. Factions
		db.exec(`
			CREATE TABLE IF NOT EXISTS factions (
				id TEXT PRIMARY KEY,
				projectId TEXT NOT NULL,
				name TEXT NOT NULL,
				type TEXT NOT NULL DEFAULT '',
				description TEXT NOT NULL DEFAULT '',
				mission TEXT NOT NULL DEFAULT '',
				ideology TEXT NOT NULL DEFAULT '',
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			);
		`);
		db.exec('CREATE INDEX IF NOT EXISTS idx_factions_projectId ON factions(projectId);');

		// 2. Themes
		db.exec(`
			CREATE TABLE IF NOT EXISTS themes (
				id TEXT PRIMARY KEY,
				projectId TEXT NOT NULL,
				title TEXT NOT NULL,
				description TEXT NOT NULL DEFAULT '',
				tensionPair TEXT NOT NULL DEFAULT '',
				imagery TEXT NOT NULL DEFAULT '',
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			);
		`);
		db.exec('CREATE INDEX IF NOT EXISTS idx_themes_projectId ON themes(projectId);');

		// 3. Glossary Terms
		db.exec(`
			CREATE TABLE IF NOT EXISTS glossary_terms (
				id TEXT PRIMARY KEY,
				projectId TEXT NOT NULL,
				term TEXT NOT NULL,
				definition TEXT NOT NULL DEFAULT '',
				pronunciation TEXT NOT NULL DEFAULT '',
				category TEXT NOT NULL DEFAULT '',
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			);
		`);
		db.exec('CREATE INDEX IF NOT EXISTS idx_glossary_terms_projectId ON glossary_terms(projectId);');

		// 4. Add relational links to existing tables (Additive)
		const characterCols = db.prepare('PRAGMA table_info(characters)').all() as Array<{ name: string }>;
		if (!characterCols.some((c) => c.name === 'factionId')) {
			db.exec('ALTER TABLE characters ADD COLUMN factionId TEXT;');
		}
	},
};
