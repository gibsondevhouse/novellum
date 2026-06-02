/**
 * plan-038 stage-005 phase-001 part-002 — buildSceneDraftContext unit tests.
 *
 * Covers non-trivial logic in the context builder using in-memory SQLite.
 * No HTTP mocks needed — the function reads directly from the DB.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL, INDEX_SQL } from '$lib/server/db/schema.js';

// We need to override the module-level `db` import in author-draft-context.ts.
// The service imports `db` from '$lib/server/db/index.js'. We inject a test db
// by mocking that module before the dynamic import below.
const testDb = new Database(':memory:');
testDb.pragma('journal_mode = WAL');
testDb.exec(SCHEMA_SQL);
testDb.exec(INDEX_SQL);

import { vi } from 'vitest';
vi.mock('$lib/server/db/index.js', () => ({ db: testDb }));

const { buildSceneDraftContext } = await import(
	'../../../src/lib/ai/pipeline/author-draft-context.js'
);

const projectId = 'proj-1';
const now = new Date().toISOString();

function seedProject(db: Database.Database, pid = projectId) {
	db.prepare(
		`INSERT OR IGNORE INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, systemPrompt, negativePrompt, projectType, lastOpenedAt, stylePresetId, createdAt, updatedAt)
		 VALUES (?, ?, '', '', '', 0, 'draft', '', '', 'novel', '', '', ?, ?)`,
	).run(pid, 'Test Project', now, now);
}

function seedChapter(
	db: Database.Database,
	chapterId: string,
	pid = projectId,
	overrides: Record<string, unknown> = {},
) {
	db.prepare(
		`INSERT OR REPLACE INTO chapters (id, projectId, title, "order", summary, wordCount, actId, arcRefs, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @actId, @arcRefs, @createdAt, @updatedAt)`,
	).run({
		id: chapterId,
		projectId: pid,
		title: 'Chapter 1',
		order: 0,
		summary: '',
		wordCount: 0,
		actId: null,
		arcRefs: '[]',
		createdAt: now,
		updatedAt: now,
		...overrides,
	});
}

function seedScene(
	db: Database.Database,
	sceneId: string,
	chapterId: string,
	pid = projectId,
	overrides: Record<string, unknown> = {},
) {
	db.prepare(
		`INSERT OR REPLACE INTO scenes (id, chapterId, projectId, title, summary, povCharacterId, locationId, timelineEventId, "order", content, wordCount, notes, characterIds, locationIds, arcRefs, createdAt, updatedAt)
		 VALUES (@id, @chapterId, @projectId, @title, @summary, @povCharacterId, @locationId, @timelineEventId, @order, @content, @wordCount, @notes, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
	).run({
		id: sceneId,
		chapterId,
		projectId: pid,
		title: 'Scene',
		summary: '',
		povCharacterId: null,
		locationId: null,
		timelineEventId: null,
		order: 0,
		content: '',
		wordCount: 0,
		notes: '',
		characterIds: '[]',
		locationIds: '[]',
		arcRefs: '[]',
		createdAt: now,
		updatedAt: now,
		...overrides,
	});
}

function seedMetadata(
	db: Database.Database,
	pid: string,
	scope: string,
	ownerId: string,
	key: string,
	value: unknown,
) {
	db.prepare(
		`INSERT OR REPLACE INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?)`,
	).run(pid, scope, ownerId, key, JSON.stringify(value), now);
}

function seedCharacter(db: Database.Database, charId: string, name: string, pid = projectId) {
	db.prepare(
		`INSERT OR IGNORE INTO characters (id, projectId, name, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?)`,
	).run(charId, pid, name, now, now);
}

function seedLocation(db: Database.Database, locId: string, name: string, pid = projectId) {
	db.prepare(
		`INSERT OR IGNORE INTO locations (id, projectId, name, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?)`,
	).run(locId, pid, name, now, now);
}

function seedPlotThread(
	db: Database.Database,
	threadId: string,
	title: string,
	status: string,
	pid = projectId,
) {
	db.prepare(
		`INSERT OR IGNORE INTO plot_threads (id, projectId, title, description, status, relatedSceneIds, relatedCharacterIds, createdAt, updatedAt)
		 VALUES (?, ?, ?, '', ?, '[]', '[]', ?, ?)`,
	).run(threadId, pid, title, status, now, now);
}

beforeEach(() => {
	// Wipe data between tests
	testDb.exec(`
		DELETE FROM project_metadata;
		DELETE FROM scenes;
		DELETE FROM chapters;
		DELETE FROM characters;
		DELETE FROM locations;
		DELETE FROM plot_threads;
		DELETE FROM projects;
	`);
	seedProject(testDb);
});

describe('buildSceneDraftContext', () => {
	it('returns null when scene does not exist', () => {
		const result = buildSceneDraftContext(projectId, 'nonexistent-scene');
		expect(result).toBeNull();
	});

	it('returns null when scene belongs to a different project', () => {
		seedProject(testDb, 'other-proj');
		seedChapter(testDb, 'ch-1', 'other-proj');
		seedScene(testDb, 'sc-1', 'ch-1', 'other-proj');
		const result = buildSceneDraftContext(projectId, 'sc-1');
		expect(result).toBeNull();
	});

	describe('targetWordCount computation', () => {
		it('divides chapter targetLength by scene count', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1', projectId, { order: 0 });
			seedScene(testDb, 'sc-2', 'ch-1', projectId, { order: 1 });
			seedMetadata(testDb, projectId, 'chapter', 'ch-1', 'clarity', { targetLength: 4000 });

			const result = buildSceneDraftContext(projectId, 'sc-1');
			expect(result).not.toBeNull();
			// 4000 / 2 = 2000
			expect(result!.scene.targetWordCount).toBe(2000);
		});

		it('is undefined when no chapter targetLength metadata exists', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1');

			const result = buildSceneDraftContext(projectId, 'sc-1');
			expect(result!.scene.targetWordCount).toBeUndefined();
		});
	});

	describe('metadata key aliasing', () => {
		it('reads goal from quickIntent key', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1');
			seedMetadata(testDb, projectId, 'scene', 'sc-1', 'quickIntent', {
				goal: 'Survive the storm',
				obstacle: 'The ship is sinking',
				outcome: 'Reaches shore',
			});

			const result = buildSceneDraftContext(projectId, 'sc-1');
			expect(result!.scene.goal).toBe('Survive the storm');
			expect(result!.scene.conflict).toBe('The ship is sinking');
			expect(result!.scene.outcome).toBe('Reaches shore');
		});

		it('also reads goal from quick-intent key (hyphenated alias)', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1');
			seedMetadata(testDb, projectId, 'scene', 'sc-1', 'quick-intent', {
				goal: 'Escape the dungeon',
				obstacle: 'Guards are blocking',
				outcome: 'Freedom',
			});

			const result = buildSceneDraftContext(projectId, 'sc-1');
			expect(result!.scene.goal).toBe('Escape the dungeon');
			expect(result!.scene.conflict).toBe('Guards are blocking');
		});
	});

	describe('priorSceneSummary selection', () => {
		it('returns undefined for the first scene in a chapter', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1', projectId, { order: 0 });

			const result = buildSceneDraftContext(projectId, 'sc-1');
			expect(result!.continuity.priorSceneSummary).toBeUndefined();
		});

		it('returns the prior scene summary for a later scene', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1', projectId, { order: 0, summary: 'Hero sets out on journey.' });
			seedScene(testDb, 'sc-2', 'ch-1', projectId, { order: 1, summary: 'Hero arrives at village.' });
			seedScene(testDb, 'sc-3', 'ch-1', projectId, { order: 2, summary: 'Hero meets the elder.' });

			const result = buildSceneDraftContext(projectId, 'sc-3');
			expect(result!.continuity.priorSceneSummary).toBe('Hero arrives at village.');
		});

		it('selects the immediately preceding scene, not the first scene', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1', projectId, { order: 0, summary: 'First scene summary.' });
			seedScene(testDb, 'sc-2', 'ch-1', projectId, { order: 1, summary: 'Second scene summary.' });

			const result = buildSceneDraftContext(projectId, 'sc-2');
			expect(result!.continuity.priorSceneSummary).toBe('First scene summary.');
		});
	});

	describe('canon refs assembly', () => {
		it('includes characters linked to the scene', () => {
			seedChapter(testDb, 'ch-1');
			seedCharacter(testDb, 'char-1', 'Alice');
			seedCharacter(testDb, 'char-2', 'Bob');
			seedScene(testDb, 'sc-1', 'ch-1', projectId, {
				characterIds: JSON.stringify(['char-1', 'char-2']),
			});

			const result = buildSceneDraftContext(projectId, 'sc-1');
			const refs = result!.continuity.relevantCanonRefs;
			expect(refs).toContain('character:Alice (char-1)');
			expect(refs).toContain('character:Bob (char-2)');
		});

		it('includes locations linked to the scene', () => {
			seedChapter(testDb, 'ch-1');
			seedLocation(testDb, 'loc-1', 'The Tavern');
			seedScene(testDb, 'sc-1', 'ch-1', projectId, {
				locationIds: JSON.stringify(['loc-1']),
			});

			const result = buildSceneDraftContext(projectId, 'sc-1');
			const refs = result!.continuity.relevantCanonRefs;
			expect(refs).toContain('location:The Tavern (loc-1)');
		});

		it('returns empty refs when no characters or locations are linked', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1');

			const result = buildSceneDraftContext(projectId, 'sc-1');
			expect(result!.continuity.relevantCanonRefs).toEqual([]);
		});
	});

	describe('continuity.unresolvedThreads', () => {
		it('returns empty array when no plot threads exist', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1');

			const result = buildSceneDraftContext(projectId, 'sc-1');
			expect(result!.continuity.unresolvedThreads).toEqual([]);
		});

		it('returns open plot threads for the project', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1');
			seedPlotThread(testDb, 'pt-1', 'The Lost Heir', 'open');
			seedPlotThread(testDb, 'pt-2', 'The Stolen Crown', '');

			const result = buildSceneDraftContext(projectId, 'sc-1');
			const threads = result!.continuity.unresolvedThreads;
			expect(threads).toHaveLength(2);
			expect(threads.some((t) => t.includes('The Lost Heir'))).toBe(true);
			expect(threads.some((t) => t.includes('The Stolen Crown'))).toBe(true);
		});

		it('excludes threads with status resolved', () => {
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1');
			seedPlotThread(testDb, 'pt-1', 'Open Thread', 'open');
			seedPlotThread(testDb, 'pt-2', 'Resolved Thread', 'resolved');

			const result = buildSceneDraftContext(projectId, 'sc-1');
			const threads = result!.continuity.unresolvedThreads;
			expect(threads).toHaveLength(1);
			expect(threads[0]).toContain('Open Thread');
		});

		it('does not include threads from other projects', () => {
			seedProject(testDb, 'other-proj');
			seedChapter(testDb, 'ch-1');
			seedScene(testDb, 'sc-1', 'ch-1');
			seedPlotThread(testDb, 'pt-other', 'Other Project Thread', 'open', 'other-proj');

			const result = buildSceneDraftContext(projectId, 'sc-1');
			expect(result!.continuity.unresolvedThreads).toEqual([]);
		});
	});
});
