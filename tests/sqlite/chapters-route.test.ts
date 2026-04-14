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

describe('chapters route logic', () => {
	let db: ReturnType<typeof createTestDb>;

	beforeEach(() => {
		db = createTestDb();
		insertProject(db);
	});

	it('filters chapters by projectId', () => {
		const now = new Date().toISOString();
		insertProject(db, 'proj-2');

		db.prepare(
			`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @arcRefs, @createdAt, @updatedAt)`,
		).run({
			id: 'c1',
			projectId: 'proj-1',
			title: 'Ch1',
			order: 0,
			summary: '',
			wordCount: 0,
			arcRefs: '[]',
			createdAt: now,
			updatedAt: now,
		});

		db.prepare(
			`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @arcRefs, @createdAt, @updatedAt)`,
		).run({
			id: 'c2',
			projectId: 'proj-2',
			title: 'Ch2',
			order: 0,
			summary: '',
			wordCount: 0,
			arcRefs: '[]',
			createdAt: now,
			updatedAt: now,
		});

		const rows = db
			.prepare('SELECT * FROM chapters WHERE projectId = ? ORDER BY "order" ASC')
			.all('proj-1') as SqliteRow[];
		expect(rows).toHaveLength(1);
		expect(rows[0].title).toBe('Ch1');
	});

	it('reorders chapters by updating order field', () => {
		const now = new Date().toISOString();
		for (let i = 0; i < 3; i++) {
			db.prepare(
				`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, arcRefs, createdAt, updatedAt)
				 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @arcRefs, @createdAt, @updatedAt)`,
			).run({
				id: `c${i}`,
				projectId: 'proj-1',
				title: `Ch${i}`,
				order: i,
				summary: '',
				wordCount: 0,
				arcRefs: '[]',
				createdAt: now,
				updatedAt: now,
			});
		}

		const orderedIds = ['c2', 'c0', 'c1'];
		const reorder = db.transaction((ids: string[]) => {
			for (let i = 0; i < ids.length; i++) {
				db.prepare('UPDATE chapters SET "order" = ?, updatedAt = ? WHERE id = ?').run(
					i,
					new Date().toISOString(),
					ids[i],
				);
			}
		});
		reorder(orderedIds);

		const rows = db.prepare('SELECT * FROM chapters ORDER BY "order" ASC').all() as SqliteRow[];
		expect(rows[0].id).toBe('c2');
		expect(rows[1].id).toBe('c0');
		expect(rows[2].id).toBe('c1');
	});

	it('stores and retrieves arcRefs as JSON', () => {
		const now = new Date().toISOString();
		const arcRefs = [{ arcId: 'arc1', role: 'primary' }];

		db.prepare(
			`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @arcRefs, @createdAt, @updatedAt)`,
		).run({
			id: 'c1',
			projectId: 'proj-1',
			title: 'Ch1',
			order: 0,
			summary: '',
			wordCount: 0,
			arcRefs: encodeJson(arcRefs),
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM chapters WHERE id = ?').get('c1') as SqliteRow;
		const decoded = decodeJson<typeof arcRefs>(row.arcRefs);
		expect(decoded).toEqual(arcRefs);
	});
});
