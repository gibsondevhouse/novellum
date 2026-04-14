import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';

type SqliteRow = Record<string, string | number | null>;

function createTestDb() {
	const db = new Database(':memory:');
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');
	db.exec(SCHEMA_SQL);
	db.exec(INDEX_SQL);
	return db;
}

describe('projects route logic', () => {
	let db: ReturnType<typeof createTestDb>;

	beforeEach(() => {
		db = createTestDb();
	});

	it('returns empty array when no projects exist', () => {
		const rows = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();
		expect(rows).toEqual([]);
	});

	it('creates a project with all required fields', () => {
		const now = new Date().toISOString();
		const project = {
			id: 'test-id-1',
			title: 'Test Project',
			genre: 'fantasy',
			logline: 'A test logline',
			synopsis: '',
			targetWordCount: 80000,
			status: 'draft',
			createdAt: now,
			updatedAt: now,
		};

		db.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
		).run(project);

		const row = db.prepare('SELECT * FROM projects WHERE id = ?').get('test-id-1') as SqliteRow;
		expect(row).toBeTruthy();
		expect(row.title).toBe('Test Project');
		expect(row.genre).toBe('fantasy');
		expect(row.targetWordCount).toBe(80000);
	});

	it('reads a project by id', () => {
		const now = new Date().toISOString();
		db.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
		).run({
			id: 'p1',
			title: 'P1',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			status: 'draft',
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM projects WHERE id = ?').get('p1') as SqliteRow;
		expect(row.title).toBe('P1');
	});

	it('returns undefined for unknown id', () => {
		const row = db.prepare('SELECT * FROM projects WHERE id = ?').get('nonexistent');
		expect(row).toBeUndefined();
	});

	it('updates a project', () => {
		const now = new Date().toISOString();
		db.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
		).run({
			id: 'p1',
			title: 'Original',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			status: 'draft',
			createdAt: now,
			updatedAt: now,
		});

		const updates = { title: 'Updated', updatedAt: new Date().toISOString() };
		const result = db
			.prepare('UPDATE projects SET title = @title, updatedAt = @updatedAt WHERE id = @id')
			.run({ ...updates, id: 'p1' });
		expect(result.changes).toBe(1);

		const row = db.prepare('SELECT * FROM projects WHERE id = ?').get('p1') as SqliteRow;
		expect(row.title).toBe('Updated');
	});

	it('update returns 0 changes for unknown id', () => {
		const result = db
			.prepare('UPDATE projects SET title = @title WHERE id = @id')
			.run({ title: 'X', id: 'nonexistent' });
		expect(result.changes).toBe(0);
	});

	it('deletes a project', () => {
		const now = new Date().toISOString();
		db.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
		).run({
			id: 'p1',
			title: 'ToDelete',
			genre: '',
			logline: '',
			synopsis: '',
			targetWordCount: 0,
			status: 'draft',
			createdAt: now,
			updatedAt: now,
		});

		db.prepare('DELETE FROM projects WHERE id = ?').run('p1');
		const row = db.prepare('SELECT * FROM projects WHERE id = ?').get('p1');
		expect(row).toBeUndefined();
	});

	it('delete is idempotent for unknown id', () => {
		const result = db.prepare('DELETE FROM projects WHERE id = ?').run('nonexistent');
		expect(result.changes).toBe(0);
	});
});
