import { beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';
import { decodeJson, encodeJson } from '$lib/server/db/serialize.js';
import { runMigrations } from '$lib/server/db/migrations.js';

type SqliteRow = Record<string, string | number | null>;

function createTestDb() {
	const db = new Database(':memory:');
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');
	db.exec(SCHEMA_SQL);
	db.exec(INDEX_SQL);
	runMigrations(db);
	return db;
}

function seedProject(db: Database.Database, projectId = 'proj-1') {
	const now = new Date().toISOString();
	db.prepare(
		`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
		 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
	).run({
		id: projectId,
		title: 'Test Project',
		genre: '',
		logline: '',
		synopsis: '',
		targetWordCount: 0,
		status: 'draft',
		createdAt: now,
		updatedAt: now,
	});
}

describe('locations route logic', () => {
	let db: ReturnType<typeof createTestDb>;

	beforeEach(() => {
		db = createTestDb();
		seedProject(db);
	});

	it('stores and retrieves realm narrative fields', () => {
		const now = new Date().toISOString();
		db.prepare(
			`INSERT INTO locations (id, projectId, name, description, tags, kind, realmType, realityRules, culturalBaseline, powerStructure, conflictPressure, storyRole, tone, realmId, environment, notableFeatures, purpose, activityType, emotionalTone, changeOverTime, landmarkIds, factionIds, characterIds, threadIds, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @description, @tags, @kind, @realmType, @realityRules, @culturalBaseline, @powerStructure, @conflictPressure, @storyRole, @tone, @realmId, @environment, @notableFeatures, @purpose, @activityType, @emotionalTone, @changeOverTime, @landmarkIds, @factionIds, @characterIds, @threadIds, @createdAt, @updatedAt)`,
		).run({
			id: 'realm-1',
			projectId: 'proj-1',
			name: 'Divine Atlanta',
			description: 'Modern city with divine bleed-through',
			tags: encodeJson(['atlas', 'hybrid']),
			kind: 'realm',
			realmType: 'hybrid',
			realityRules: 'Gods influence events indirectly.',
			culturalBaseline: 'Most people reject supernatural explanations.',
			powerStructure: 'Visible civic control, hidden divine factions.',
			conflictPressure: 'A hidden divine war contaminates ordinary life.',
			storyRole: 'Battleground',
			tone: 'Unsettling',
			realmId: '',
			environment: '',
			notableFeatures: encodeJson([]),
			purpose: '',
			activityType: '',
			emotionalTone: '',
			changeOverTime: '',
			landmarkIds: encodeJson(['landmark-1']),
			factionIds: encodeJson(['faction-1']),
			characterIds: encodeJson(['char-1']),
			threadIds: encodeJson(['thread-1']),
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM locations WHERE id = ?').get('realm-1') as SqliteRow;
		expect(row.kind).toBe('realm');
		expect(row.realmType).toBe('hybrid');
		expect(row.storyRole).toBe('Battleground');
		expect(decodeJson<string[]>(row.landmarkIds)).toEqual(['landmark-1']);
		expect(decodeJson<string[]>(row.factionIds)).toEqual(['faction-1']);
	});

	it('stores and retrieves landmark narrative fields with a parent realm', () => {
		const now = new Date().toISOString();
		db.prepare(
			`INSERT INTO locations (id, projectId, name, description, tags, kind, realmType, realityRules, culturalBaseline, powerStructure, conflictPressure, storyRole, tone, realmId, environment, notableFeatures, purpose, activityType, emotionalTone, changeOverTime, landmarkIds, factionIds, characterIds, threadIds, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, @description, @tags, @kind, @realmType, @realityRules, @culturalBaseline, @powerStructure, @conflictPressure, @storyRole, @tone, @realmId, @environment, @notableFeatures, @purpose, @activityType, @emotionalTone, @changeOverTime, @landmarkIds, @factionIds, @characterIds, @threadIds, @createdAt, @updatedAt)`,
		).run({
			id: 'landmark-1',
			projectId: 'proj-1',
			name: 'Memorial Apartment',
			description: 'A cramped apartment that becomes unstable over time.',
			tags: encodeJson(['landmark']),
			kind: 'landmark',
			realmType: '',
			realityRules: '',
			culturalBaseline: '',
			powerStructure: '',
			conflictPressure: '',
			storyRole: '',
			tone: '',
			realmId: 'realm-1',
			environment: 'Cramped apartment with failing lights and thin walls.',
			notableFeatures: encodeJson(['bloodstained sink', 'warped family photos']),
			purpose: 'Safe house',
			activityType: 'Revelation',
			emotionalTone: 'Tense',
			changeOverTime: 'Becomes haunted by evidence of prior lives.',
			landmarkIds: encodeJson([]),
			factionIds: encodeJson(['faction-2']),
			characterIds: encodeJson(['char-2', 'char-3']),
			threadIds: encodeJson(['thread-2']),
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM locations WHERE id = ?').get('landmark-1') as SqliteRow;
		expect(row.kind).toBe('landmark');
		expect(row.realmId).toBe('realm-1');
		expect(row.activityType).toBe('Revelation');
		expect(decodeJson<string[]>(row.notableFeatures)).toEqual([
			'bloodstained sink',
			'warped family photos',
		]);
		expect(decodeJson<string[]>(row.characterIds)).toEqual(['char-2', 'char-3']);
	});
});