import { beforeEach, describe, expect, it } from 'vitest';
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

function seedProject(db: Database.Database, id = 'proj-1') {
	const now = new Date().toISOString();
	db.prepare(
		`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, createdAt, updatedAt)
		 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @createdAt, @updatedAt)`,
	).run({
		id,
		title: 'Project',
		genre: '',
		logline: '',
		synopsis: '',
		targetWordCount: 0,
		status: 'draft',
		createdAt: now,
		updatedAt: now,
	});
}

describe('individuals production persistence', () => {
	let db: ReturnType<typeof createTestDb>;

	beforeEach(() => {
		db = createTestDb();
		seedProject(db);
	});

	it('persists native Individuals character fields', () => {
		const now = new Date().toISOString();
		db.prepare(
			`INSERT INTO characters (
				id, projectId, name, role, occupation, age, height, weight, build, hair, eyes,
				coreDesire, fear, contradiction, temperament, alignment, strength, flaw,
				storyRole, arcStage, externalGoal, internalNeed, stakes, conflict,
				voiceSummary, speechPattern, phrases, tells, bodyLanguage, dialogueSample,
				immutableTraits, injuries, habits, secrets, othersKnow, lastChange,
				timelineMarkers, emotionalState, currentObjective, currentPressure,
				lastSeen, nextMove, pronunciation, aliases, diasporaOrigin, photoUrl,
				bio, faction, anomalies, traits, goals, flaws, arcs, notes, tags, createdAt, updatedAt
			)
			VALUES (
				@id, @projectId, @name, @role, @occupation, @age, @height, @weight, @build, @hair, @eyes,
				@coreDesire, @fear, @contradiction, @temperament, @alignment, @strength, @flaw,
				@storyRole, @arcStage, @externalGoal, @internalNeed, @stakes, @conflict,
				@voiceSummary, @speechPattern, @phrases, @tells, @bodyLanguage, @dialogueSample,
				@immutableTraits, @injuries, @habits, @secrets, @othersKnow, @lastChange,
				@timelineMarkers, @emotionalState, @currentObjective, @currentPressure,
				@lastSeen, @nextMove, @pronunciation, @aliases, @diasporaOrigin, @photoUrl,
				@bio, @faction, @anomalies, @traits, @goals, @flaws, @arcs, @notes, @tags, @createdAt, @updatedAt
			)`,
		).run({
			id: 'char-1',
			projectId: 'proj-1',
			name: 'Ari',
			role: 'Lead',
			occupation: 'Courier',
			age: '29',
			height: '178cm',
			weight: '72kg',
			build: 'Lean',
			hair: 'Black',
			eyes: 'Brown',
			coreDesire: 'Belong',
			fear: 'Abandonment',
			contradiction: 'Detached but needy',
			temperament: 'Guarded',
			alignment: 'Chaotic Good',
			strength: 'Persistence',
			flaw: 'Impulsive',
			storyRole: 'Protagonist',
			arcStage: 'Midpoint fracture',
			externalGoal: 'Deliver package',
			internalNeed: 'Trust others',
			stakes: 'Sister in danger',
			conflict: 'Hunted by syndicate',
			voiceSummary: 'Sparse, sharp lines',
			speechPattern: 'Short bursts',
			phrases: 'Keep moving',
			tells: 'Rubs thumb knuckle',
			bodyLanguage: 'Shoulders forward',
			dialogueSample: 'No one is coming.',
			immutableTraits: 'Left-handed',
			injuries: 'Old shoulder scar',
			habits: 'Checks exits',
			secrets: 'Stole evidence',
			othersKnow: 'Was in military',
			lastChange: 'Rejected mentor',
			timelineMarkers: 'Ch.12 rooftop chase',
			emotionalState: 'Frayed',
			currentObjective: 'Reach safehouse',
			currentPressure: 'Clock ticking',
			lastSeen: 'Chapter 14',
			nextMove: 'Call broker',
			pronunciation: '',
			aliases: '[]',
			diasporaOrigin: '',
			photoUrl: '',
			bio: 'Summary',
			faction: '',
			anomalies: '[]',
			traits: '[]',
			goals: '[]',
			flaws: '[]',
			arcs: '[]',
			notes: 'Biography',
			tags: '[]',
			createdAt: now,
			updatedAt: now,
		});

		const row = db.prepare('SELECT * FROM characters WHERE id = ?').get('char-1') as SqliteRow;
		expect(row.occupation).toBe('Courier');
		expect(row.coreDesire).toBe('Belong');
		expect(row.voiceSummary).toBe('Sparse, sharp lines');
		expect(row.currentObjective).toBe('Reach safehouse');
		expect(row.notes).toBe('Biography');
	});

	it('persists relationship status across create, update, retarget, and delete', () => {
		const now = new Date().toISOString();
		db.prepare(
			`INSERT INTO characters (id, projectId, name, role, aliases, anomalies, traits, goals, flaws, arcs, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, '', '[]', '[]', '[]', '[]', '[]', '[]', '[]', @createdAt, @updatedAt)`,
		).run({ id: 'char-a', projectId: 'proj-1', name: 'A', createdAt: now, updatedAt: now });
		db.prepare(
			`INSERT INTO characters (id, projectId, name, role, aliases, anomalies, traits, goals, flaws, arcs, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, '', '[]', '[]', '[]', '[]', '[]', '[]', '[]', @createdAt, @updatedAt)`,
		).run({ id: 'char-b', projectId: 'proj-1', name: 'B', createdAt: now, updatedAt: now });
		db.prepare(
			`INSERT INTO characters (id, projectId, name, role, aliases, anomalies, traits, goals, flaws, arcs, tags, createdAt, updatedAt)
			 VALUES (@id, @projectId, @name, '', '[]', '[]', '[]', '[]', '[]', '[]', '[]', @createdAt, @updatedAt)`,
		).run({ id: 'char-c', projectId: 'proj-1', name: 'C', createdAt: now, updatedAt: now });

		db.prepare(
			`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, status, description, createdAt, updatedAt)
			 VALUES ('rel-1', 'proj-1', 'char-a', 'char-b', 'Ally', 'Stable', 'Old trust', @createdAt, @updatedAt)`,
		).run({ createdAt: now, updatedAt: now });

		db.prepare(
			`UPDATE character_relationships SET type = 'Rival', status = 'Volatile', description = 'Open conflict', updatedAt = @updatedAt WHERE id = 'rel-1'`,
		).run({ updatedAt: new Date().toISOString() });

		const afterUpdate = db
			.prepare('SELECT type, status, description FROM character_relationships WHERE id = ?')
			.get('rel-1') as SqliteRow;
		expect(afterUpdate.type).toBe('Rival');
		expect(afterUpdate.status).toBe('Volatile');
		expect(afterUpdate.description).toBe('Open conflict');

		// Retarget model: create replacement relationship and remove old.
		db.prepare(
			`INSERT INTO character_relationships (id, projectId, characterAId, characterBId, type, status, description, createdAt, updatedAt)
			 VALUES ('rel-2', 'proj-1', 'char-a', 'char-c', 'Rival', 'Guarded', 'Transferred hostility', @createdAt, @updatedAt)`,
		).run({ createdAt: now, updatedAt: now });
		db.prepare(`DELETE FROM character_relationships WHERE id = 'rel-1'`).run();

		const rows = db
			.prepare('SELECT id, characterAId, characterBId, status FROM character_relationships WHERE projectId = ?')
			.all('proj-1') as SqliteRow[];
		expect(rows).toHaveLength(1);
		expect(rows[0].id).toBe('rel-2');
		expect(rows[0].characterAId).toBe('char-a');
		expect(rows[0].characterBId).toBe('char-c');
		expect(rows[0].status).toBe('Guarded');

		db.prepare(`DELETE FROM character_relationships WHERE id = 'rel-2'`).run();
		const count = db
			.prepare('SELECT COUNT(*) as c FROM character_relationships WHERE projectId = ?')
			.get('proj-1') as SqliteRow;
		expect(Number(count.c)).toBe(0);
	});
});
