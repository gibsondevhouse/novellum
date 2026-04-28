import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '$lib/server/db/migration-runner.js';
import { MIGRATION_REGISTRY } from '$lib/server/db/migration-registry.js';

type SqliteRow = Record<string, string | number | null>;

function createLegacyDb() {
	const db = new Database(':memory:');
	db.exec(`
		CREATE TABLE projects (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			genre TEXT NOT NULL DEFAULT '',
			logline TEXT NOT NULL DEFAULT '',
			synopsis TEXT NOT NULL DEFAULT '',
			targetWordCount INTEGER NOT NULL DEFAULT 0,
			status TEXT NOT NULL DEFAULT '',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);

		CREATE TABLE characters (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			name TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT '',
			traits TEXT NOT NULL DEFAULT '[]',
			goals TEXT NOT NULL DEFAULT '[]',
			flaws TEXT NOT NULL DEFAULT '[]',
			arcs TEXT NOT NULL DEFAULT '[]',
			notes TEXT NOT NULL DEFAULT '',
			tags TEXT NOT NULL DEFAULT '[]',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);

		CREATE TABLE character_relationships (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			characterAId TEXT NOT NULL,
			characterBId TEXT NOT NULL,
			type TEXT NOT NULL DEFAULT '',
			description TEXT NOT NULL DEFAULT '',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);
	`);
	return db;
}

describe('individuals migration backfill', () => {
	it('backfills native fields from legacy notes and relationship envelopes', () => {
		const db = createLegacyDb();
		const now = new Date().toISOString();

		db.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
			 VALUES ('proj-1', 'Project', '', '', '', 0, '', @createdAt, @updatedAt)`,
		).run({ createdAt: now, updatedAt: now });

		db.prepare(
			`INSERT INTO characters (id, projectId, name, role, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt)
			 VALUES ('char-1', 'proj-1', 'Ari', 'Lead', '[]', '[]', '[]', '[]', @notes, '[]', @createdAt, @updatedAt)`,
		).run({
			notes: JSON.stringify({
				kind: 'individual-dossier',
				version: 1,
				biography: 'Legacy bio',
				occupation: 'Courier',
				coreDesire: 'Belong',
				voiceSummary: 'Spare and sharp',
				currentObjective: 'Reach safehouse',
			}),
			createdAt: now,
			updatedAt: now,
		});

		db.prepare(
			`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, description, createdAt, updatedAt)
			 VALUES ('rel-1', 'proj-1', 'char-1', 'char-2', 'Ally', @description, @createdAt, @updatedAt)`,
		).run({
			description: JSON.stringify({
				kind: 'character-relationship',
				version: 1,
				notes: 'Legacy note',
				status: 'Tense',
			}),
			createdAt: now,
			updatedAt: now,
		});

		runMigrations(db, MIGRATION_REGISTRY);

		const cols = db
			.prepare('PRAGMA table_info(characters)')
			.all() as Array<{ name: string }>;
		expect(cols.some((col) => col.name === 'occupation')).toBe(true);
		expect(cols.some((col) => col.name === 'currentObjective')).toBe(true);

		const character = db.prepare('SELECT * FROM characters WHERE id = ?').get('char-1') as SqliteRow;
		expect(character.notes).toBe('Legacy bio');
		expect(character.occupation).toBe('Courier');
		expect(character.coreDesire).toBe('Belong');
		expect(character.voiceSummary).toBe('Spare and sharp');
		expect(character.currentObjective).toBe('Reach safehouse');

		const relCols = db
			.prepare('PRAGMA table_info(character_relationships)')
			.all() as Array<{ name: string }>;
		expect(relCols.some((col) => col.name === 'status')).toBe(true);

		const relationship = db
			.prepare('SELECT status, description FROM character_relationships WHERE id = ?')
			.get('rel-1') as SqliteRow;
		expect(relationship.status).toBe('Tense');
		expect(relationship.description).toBe('Legacy note');
	});

	it('canonicalizes relationship pairs, removes duplicates, and enforces uniqueness', () => {
		const db = createLegacyDb();
		const now = new Date().toISOString();

		db.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
			 VALUES ('proj-1', 'Project', '', '', '', 0, '', @createdAt, @updatedAt)`,
		).run({ createdAt: now, updatedAt: now });

		db.prepare(
			`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, description, createdAt, updatedAt)
			 VALUES ('rel-1', 'proj-1', 'char-a', 'char-b', 'Ally', '', '2026-01-01T00:00:00.000Z', @updatedAt)`,
		).run({ updatedAt: now });
		db.prepare(
			`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, description, createdAt, updatedAt)
			 VALUES ('rel-2', 'proj-1', 'char-b', 'char-a', 'Ally', '', '2026-01-02T00:00:00.000Z', @updatedAt)`,
		).run({ updatedAt: now });
		db.prepare(
			`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, description, createdAt, updatedAt)
			 VALUES ('rel-3', 'proj-1', 'char-a', 'char-b', 'Ally', '', '2026-01-03T00:00:00.000Z', @updatedAt)`,
		).run({ updatedAt: now });
		db.prepare(
			`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, description, createdAt, updatedAt)
			 VALUES ('rel-self', 'proj-1', 'char-z', 'char-z', 'Self', '', '2026-01-04T00:00:00.000Z', @updatedAt)`,
		).run({ updatedAt: now });

		runMigrations(db, MIGRATION_REGISTRY);

		const rows = db
			.prepare(
				'SELECT id, characterAId, characterBId FROM character_relationships WHERE projectId = ? ORDER BY id ASC',
			)
			.all('proj-1') as Array<{ id: string; characterAId: string; characterBId: string }>;

		expect(rows).toEqual([{ id: 'rel-1', characterAId: 'char-a', characterBId: 'char-b' }]);

		const indexes = db.prepare('PRAGMA index_list(character_relationships)').all() as Array<{
			name: string;
			unique: 0 | 1;
		}>;
		const uniquePairIndex = indexes.find(
			(index) => index.name === 'idx_character_relationships_project_pair_unique',
		);
		expect(uniquePairIndex?.unique).toBe(1);

		expect(() =>
			db
				.prepare(
					`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, status, description, createdAt, updatedAt)
					 VALUES ('rel-dup', 'proj-1', 'char-a', 'char-b', 'Ally', '', '', @createdAt, @updatedAt)`,
				)
				.run({ createdAt: now, updatedAt: now }),
		).toThrow();
	});
});
