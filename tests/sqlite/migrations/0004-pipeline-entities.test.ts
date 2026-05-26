import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';

describe('migration 0004 — pipeline entities', () => {
	it('creates the factions, themes, and glossary_terms tables', () => {
		const db = new Database(':memory:');
		try {
			runMigrations(db, MIGRATION_REGISTRY);

			const tables = db
				.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('factions', 'themes', 'glossary_terms')")
				.all() as Array<{ name: string }>;
			
			const names = tables.map(t => t.name);
			expect(names).toContain('factions');
			expect(names).toContain('themes');
			expect(names).toContain('glossary_terms');

			// Check factions columns
			const factionCols = db.prepare('PRAGMA table_info(factions)').all() as Array<{ name: string }>;
			const factionNames = factionCols.map(c => c.name);
			expect(factionNames).toContain('mission');
			expect(factionNames).toContain('ideology');

			// Check themes columns
			const themeCols = db.prepare('PRAGMA table_info(themes)').all() as Array<{ name: string }>;
			const themeNames = themeCols.map(c => c.name);
			expect(themeNames).toContain('tensionPair');
			expect(themeNames).toContain('imagery');

			// Check glossary_terms columns
			const glossaryCols = db.prepare('PRAGMA table_info(glossary_terms)').all() as Array<{ name: string }>;
			const glossaryNames = glossaryCols.map(c => c.name);
			expect(glossaryNames).toContain('term');
			expect(glossaryNames).toContain('pronunciation');
		} finally {
			db.close();
		}
	});

	it('adds factionId column to characters table', () => {
		const db = new Database(':memory:');
		try {
			runMigrations(db, MIGRATION_REGISTRY);

			const cols = db.prepare('PRAGMA table_info(characters)').all() as Array<{ name: string }>;
			const names = cols.map(c => c.name);
			expect(names).toContain('factionId');
		} finally {
			db.close();
		}
	});

	it('is idempotent — re-running does not fail', () => {
		const db = new Database(':memory:');
		try {
			runMigrations(db, MIGRATION_REGISTRY);
			// Force the migration to run a second time by clearing the
			// recorded version, then re-applying the same registry.
			db.exec('DELETE FROM schema_migrations WHERE version = 4');
			
			// Re-applying should not throw
			expect(() => runMigrations(db, MIGRATION_REGISTRY)).not.toThrow();

			const cols = db.prepare('PRAGMA table_info(characters)').all() as Array<{ name: string }>;
			const factionIdCols = cols.filter((c) => c.name === 'factionId');
			expect(factionIdCols).toHaveLength(1);
		} finally {
			db.close();
		}
	});
});
