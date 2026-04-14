import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import { encodeJson, decodeJson } from '$lib/server/db/serialize.js';

type SqliteRow = Record<string, string | number | null>;

function createTestDb() {
	const db = new Database(':memory:');
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');
	db.exec(SCHEMA_SQL);
	db.exec(INDEX_SQL);
	return db;
}

function insertProject(db: import('better-sqlite3').Database, id = 'proj-1') {
	const now = new Date().toISOString();
	db.prepare(
		`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
		 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
	).run({
		id,
		title: 'Test',
		genre: '',
		logline: '',
		synopsis: '',
		targetWordCount: 0,
		status: '',
		createdAt: now,
		updatedAt: now,
	});
}

describe('characters route logic', () => {
	let db: ReturnType<typeof createTestDb>;

	beforeEach(() => {
		db = createTestDb();
		insertProject(db);
	});

	it('stores and retrieves traits as JSON array', () => {
		const now = new Date().toISOString();
		const traits = ['brave', 'stubborn', 'loyal'];

		db.prepare(
			`INSERT INTO characters (id, projectId, name, role, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @role, @traits, @goals, @flaws, @arcs, @notes, @tags, @createdAt, @updatedAt)`,
		).run({
			id: 'char-1',
			projectId: 'proj-1',
			name: 'Alice',
			role: 'protagonist',
			traits: encodeJson(traits),
			goals: encodeJson([]),
			flaws: encodeJson([]),
			arcs: encodeJson([]),
			notes: '',
			tags: encodeJson([]),
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM characters WHERE id = ?').get('char-1') as SqliteRow;
		expect(decodeJson<string[]>(row.traits)).toEqual(traits);
	});

	it('stores and retrieves goals as JSON array', () => {
		const now = new Date().toISOString();
		const goals = ['save the world', 'find the treasure'];

		db.prepare(
			`INSERT INTO characters (id, projectId, name, role, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @role, @traits, @goals, @flaws, @arcs, @notes, @tags, @createdAt, @updatedAt)`,
		).run({
			id: 'char-1',
			projectId: 'proj-1',
			name: 'Bob',
			role: 'hero',
			traits: encodeJson([]),
			goals: encodeJson(goals),
			flaws: encodeJson([]),
			arcs: encodeJson([]),
			notes: '',
			tags: encodeJson([]),
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM characters WHERE id = ?').get('char-1') as SqliteRow;
		expect(decodeJson<string[]>(row.goals)).toEqual(goals);
	});

	it('stores and retrieves flaws as JSON array', () => {
		const now = new Date().toISOString();
		const flaws = ['arrogant', 'impatient'];

		db.prepare(
			`INSERT INTO characters (id, projectId, name, role, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @role, @traits, @goals, @flaws, @arcs, @notes, @tags, @createdAt, @updatedAt)`,
		).run({
			id: 'char-1',
			projectId: 'proj-1',
			name: 'Eve',
			role: 'villain',
			traits: encodeJson([]),
			goals: encodeJson([]),
			flaws: encodeJson(flaws),
			arcs: encodeJson([]),
			notes: '',
			tags: encodeJson([]),
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM characters WHERE id = ?').get('char-1') as SqliteRow;
		expect(decodeJson<string[]>(row.flaws)).toEqual(flaws);
	});

	it('round-trips all five array fields', () => {
		const now = new Date().toISOString();
		const data = {
			traits: ['brave'],
			goals: ['win'],
			flaws: ['pride'],
			arcs: ['redemption'],
			tags: ['hero', 'main'],
		};

		db.prepare(
			`INSERT INTO characters (id, projectId, name, role, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @role, @traits, @goals, @flaws, @arcs, @notes, @tags, @createdAt, @updatedAt)`,
		).run({
			id: 'char-1',
			projectId: 'proj-1',
			name: 'Test',
			role: 'test',
			traits: encodeJson(data.traits),
			goals: encodeJson(data.goals),
			flaws: encodeJson(data.flaws),
			arcs: encodeJson(data.arcs),
			notes: '',
			tags: encodeJson(data.tags),
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM characters WHERE id = ?').get('char-1') as SqliteRow;
		expect(decodeJson<string[]>(row.traits)).toEqual(data.traits);
		expect(decodeJson<string[]>(row.goals)).toEqual(data.goals);
		expect(decodeJson<string[]>(row.flaws)).toEqual(data.flaws);
		expect(decodeJson<string[]>(row.arcs)).toEqual(data.arcs);
		expect(decodeJson<string[]>(row.tags)).toEqual(data.tags);
	});

	it('filters characters by projectId', () => {
		const now = new Date().toISOString();
		insertProject(db, 'proj-2');
		const base = {
			role: '',
			traits: '[]',
			goals: '[]',
			flaws: '[]',
			arcs: '[]',
			notes: '',
			tags: '[]',
			createdAt: now,
			updatedAt: now,
		};

		db.prepare(
			`INSERT INTO characters (id, projectId, name, role, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @role, @traits, @goals, @flaws, @arcs, @notes, @tags, @createdAt, @updatedAt)`,
		).run({ id: 'c1', projectId: 'proj-1', name: 'A', ...base });

		db.prepare(
			`INSERT INTO characters (id, projectId, name, role, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @role, @traits, @goals, @flaws, @arcs, @notes, @tags, @createdAt, @updatedAt)`,
		).run({ id: 'c2', projectId: 'proj-2', name: 'B', ...base });

		const rows = db
			.prepare('SELECT * FROM characters WHERE projectId = ?')
			.all('proj-1') as SqliteRow[];
		expect(rows).toHaveLength(1);
		expect(rows[0].name).toBe('A');
	});
});
