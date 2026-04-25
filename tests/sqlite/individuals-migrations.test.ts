import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '$lib/server/db/migrations.js';

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

		runMigrations(db);

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
});
