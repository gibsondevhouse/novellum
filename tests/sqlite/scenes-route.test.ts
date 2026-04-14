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

function seedProject(db: import('better-sqlite3').Database, projectId = 'proj-1') {
	const now = new Date().toISOString();
	db.prepare(
		`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
		 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
	).run({
		id: projectId,
		title: 'Test',
		genre: '',
		logline: '',
		synopsis: '',
		targetWordCount: 0,
		status: '',
		createdAt: now,
		updatedAt: now,
	});

	db.prepare(
		`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, arcRefs, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @arcRefs, @createdAt, @updatedAt)`,
	).run({
		id: 'ch-1',
		projectId,
		title: 'Ch1',
		order: 0,
		summary: '',
		wordCount: 0,
		arcRefs: '[]',
		createdAt: now,
		updatedAt: now,
	});
}

describe('scenes route logic', () => {
	let db: ReturnType<typeof createTestDb>;

	beforeEach(() => {
		db = createTestDb();
		seedProject(db);
	});

	it('stores and retrieves characterIds as JSON array', () => {
		const now = new Date().toISOString();
		const characterIds = ['char-1', 'char-2', 'char-3'];

		db.prepare(
			`INSERT INTO scenes (id, chapterId, projectId, title, summary, povCharacterId, locationId, timelineEventId, "order", content, wordCount, characterIds, locationIds, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @chapterId, @projectId, @title, @summary, @povCharacterId, @locationId, @timelineEventId, @order, @content, @wordCount, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
		).run({
			id: 's1',
			chapterId: 'ch-1',
			projectId: 'proj-1',
			title: 'Scene 1',
			summary: '',
			povCharacterId: null,
			locationId: null,
			timelineEventId: null,
			order: 0,
			content: '',
			wordCount: 0,
			characterIds: encodeJson(characterIds),
			locationIds: encodeJson([]),
			arcRefs: encodeJson([]),
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM scenes WHERE id = ?').get('s1') as SqliteRow;
		expect(decodeJson<string[]>(row.characterIds)).toEqual(characterIds);
	});

	it('stores and retrieves locationIds as JSON array', () => {
		const now = new Date().toISOString();
		const locationIds = ['loc-1', 'loc-2'];

		db.prepare(
			`INSERT INTO scenes (id, chapterId, projectId, title, summary, povCharacterId, locationId, timelineEventId, "order", content, wordCount, characterIds, locationIds, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @chapterId, @projectId, @title, @summary, @povCharacterId, @locationId, @timelineEventId, @order, @content, @wordCount, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
		).run({
			id: 's1',
			chapterId: 'ch-1',
			projectId: 'proj-1',
			title: 'Scene 1',
			summary: '',
			povCharacterId: null,
			locationId: null,
			timelineEventId: null,
			order: 0,
			content: '',
			wordCount: 0,
			characterIds: encodeJson([]),
			locationIds: encodeJson(locationIds),
			arcRefs: encodeJson([]),
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM scenes WHERE id = ?').get('s1') as SqliteRow;
		expect(decodeJson<string[]>(row.locationIds)).toEqual(locationIds);
	});

	it('stores and retrieves arcRefs as JSON array of objects', () => {
		const now = new Date().toISOString();
		const arcRefs = [{ arcId: 'arc1', arcLabel: 'Main Arc', role: 'primary' }];

		db.prepare(
			`INSERT INTO scenes (id, chapterId, projectId, title, summary, povCharacterId, locationId, timelineEventId, "order", content, wordCount, characterIds, locationIds, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @chapterId, @projectId, @title, @summary, @povCharacterId, @locationId, @timelineEventId, @order, @content, @wordCount, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
		).run({
			id: 's1',
			chapterId: 'ch-1',
			projectId: 'proj-1',
			title: 'Scene 1',
			summary: '',
			povCharacterId: null,
			locationId: null,
			timelineEventId: null,
			order: 0,
			content: '',
			wordCount: 0,
			characterIds: encodeJson([]),
			locationIds: encodeJson([]),
			arcRefs: encodeJson(arcRefs),
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM scenes WHERE id = ?').get('s1') as SqliteRow;
		expect(decodeJson(row.arcRefs)).toEqual(arcRefs);
	});

	it('filters scenes by chapterId', () => {
		const now = new Date().toISOString();
		const base = {
			summary: '',
			povCharacterId: null,
			locationId: null,
			timelineEventId: null,
			content: '',
			wordCount: 0,
			characterIds: '[]',
			locationIds: '[]',
			arcRefs: '[]',
			createdAt: now,
			updatedAt: now,
		};

		db.prepare(
			`INSERT INTO scenes (id, chapterId, projectId, title, "order", summary, povCharacterId, locationId, timelineEventId, content, wordCount, characterIds, locationIds, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @chapterId, @projectId, @title, @order, @summary, @povCharacterId, @locationId, @timelineEventId, @content, @wordCount, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
		).run({ id: 's1', chapterId: 'ch-1', projectId: 'proj-1', title: 'S1', order: 0, ...base });

		db.prepare(
			`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @arcRefs, @createdAt, @updatedAt)`,
		).run({
			id: 'ch-2',
			projectId: 'proj-1',
			title: 'Ch2',
			order: 1,
			summary: '',
			wordCount: 0,
			arcRefs: '[]',
			createdAt: now,
			updatedAt: now,
		});

		db.prepare(
			`INSERT INTO scenes (id, chapterId, projectId, title, "order", summary, povCharacterId, locationId, timelineEventId, content, wordCount, characterIds, locationIds, arcRefs, createdAt, updatedAt)
			 VALUES (@id, @chapterId, @projectId, @title, @order, @summary, @povCharacterId, @locationId, @timelineEventId, @content, @wordCount, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
		).run({ id: 's2', chapterId: 'ch-2', projectId: 'proj-1', title: 'S2', order: 0, ...base });

		const rows = db
			.prepare('SELECT * FROM scenes WHERE chapterId = ? ORDER BY "order" ASC')
			.all('ch-1') as SqliteRow[];
		expect(rows).toHaveLength(1);
		expect(rows[0].id).toBe('s1');
	});
});
