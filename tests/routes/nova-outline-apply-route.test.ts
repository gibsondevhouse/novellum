import { beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';

let testDb: Database.Database;

vi.mock('$lib/server/db/index.js', () => ({
	get db() {
		return testDb;
	},
	encodeJson(value: unknown) {
		return JSON.stringify(value ?? []);
	},
}));

function createDb() {
	const db = new Database(':memory:');
	db.exec(`
		CREATE TABLE projects (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL
		);

		CREATE TABLE arcs (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			purpose TEXT NOT NULL DEFAULT '',
			arcType TEXT,
			status TEXT NOT NULL DEFAULT 'planned',
			"order" INTEGER NOT NULL,
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);

		CREATE TABLE acts (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			arcId TEXT,
			title TEXT NOT NULL,
			"order" INTEGER NOT NULL,
			planningNotes TEXT NOT NULL DEFAULT '',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);

		CREATE TABLE milestones (
			id TEXT PRIMARY KEY,
			actId TEXT NOT NULL,
			projectId TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			"order" INTEGER NOT NULL,
			chapterIds TEXT NOT NULL DEFAULT '[]',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);

		CREATE TABLE chapters (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			title TEXT NOT NULL,
			"order" INTEGER NOT NULL,
			summary TEXT NOT NULL DEFAULT '',
			wordCount INTEGER NOT NULL DEFAULT 0,
			actId TEXT,
			arcRefs TEXT NOT NULL DEFAULT '[]',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);

		CREATE TABLE scenes (
			id TEXT PRIMARY KEY,
			chapterId TEXT NOT NULL,
			projectId TEXT NOT NULL,
			title TEXT NOT NULL,
			summary TEXT NOT NULL DEFAULT '',
			povCharacterId TEXT,
			locationId TEXT,
			timelineEventId TEXT,
			"order" INTEGER NOT NULL,
			content TEXT NOT NULL DEFAULT '',
			wordCount INTEGER NOT NULL DEFAULT 0,
			notes TEXT NOT NULL DEFAULT '',
			characterIds TEXT NOT NULL DEFAULT '[]',
			locationIds TEXT NOT NULL DEFAULT '[]',
			arcRefs TEXT NOT NULL DEFAULT '[]',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);

		CREATE TABLE beats (
			id TEXT PRIMARY KEY,
			sceneId TEXT,
			arcId TEXT,
			projectId TEXT NOT NULL,
			title TEXT NOT NULL,
			type TEXT NOT NULL DEFAULT '',
			"order" INTEGER NOT NULL,
			notes TEXT NOT NULL DEFAULT '',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);

		CREATE TABLE stages (
			id TEXT PRIMARY KEY,
			beatId TEXT NOT NULL,
			projectId TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			"order" INTEGER NOT NULL,
			status TEXT NOT NULL DEFAULT 'planned',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);
	`);

	db.prepare(`INSERT INTO projects (id, title) VALUES (?, ?)`).run('proj-1', 'Signal Fire');
	return db;
}

describe('POST /api/nova/outline/apply', () => {
	beforeEach(() => {
		testDb = createDb();
		vi.resetModules();
	});

	it('applies outline payload and auto-generates milestones when missing', async () => {
		const { POST } = await import('../../src/routes/api/nova/outline/apply/+server.js');
		const request = new Request('http://localhost/api/nova/outline/apply', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				payload: {
					arcs: [{ id: 'arc-a', title: 'Arc A' }],
					acts: [
						{ id: 'act-1', title: 'Act I', arcId: 'arc-a' },
						{ id: 'act-2', title: 'Act II', arcId: 'arc-a' },
					],
					chapters: [
						{ id: 'ch-1', title: 'Chapter 1', actId: 'act-1' },
						{ id: 'ch-2', title: 'Chapter 2', actId: 'act-2' },
					],
					scenes: [{ id: 'sc-1', title: 'Scene 1', chapterId: 'ch-1' }],
					beats: [{ id: 'beat-1', title: 'Beat 1', sceneId: 'sc-1' }],
				},
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(200);
		const payload = (await response.json()) as {
			ok: boolean;
			counts: Record<string, number>;
		};
		expect(payload.ok).toBe(true);
		expect(payload.counts).toMatchObject({
			arcs: 1,
			acts: 2,
			milestones: 2,
			chapters: 2,
			scenes: 1,
			beats: 1,
		});

		const arcCount = testDb.prepare('SELECT COUNT(*) as count FROM arcs WHERE projectId = ?').get('proj-1') as { count: number };
		const actCount = testDb.prepare('SELECT COUNT(*) as count FROM acts WHERE projectId = ?').get('proj-1') as { count: number };
		const milestoneCount = testDb.prepare('SELECT COUNT(*) as count FROM milestones WHERE projectId = ?').get('proj-1') as { count: number };
		const chapterCount = testDb.prepare('SELECT COUNT(*) as count FROM chapters WHERE projectId = ?').get('proj-1') as { count: number };
		const sceneCount = testDb.prepare('SELECT COUNT(*) as count FROM scenes WHERE projectId = ?').get('proj-1') as { count: number };
		const beatCount = testDb.prepare('SELECT COUNT(*) as count FROM beats WHERE projectId = ?').get('proj-1') as { count: number };

		expect(arcCount.count).toBe(1);
		expect(actCount.count).toBe(2);
		expect(milestoneCount.count).toBe(2);
		expect(chapterCount.count).toBe(2);
		expect(sceneCount.count).toBe(1);
		expect(beatCount.count).toBe(1);
	});

	it('replaces existing outline rows for the project', async () => {
		const now = new Date().toISOString();
		testDb
			.prepare(
				`INSERT INTO arcs (id, projectId, title, description, purpose, arcType, status, "order", createdAt, updatedAt)
				 VALUES (?, ?, ?, '', '', NULL, 'planned', 0, ?, ?)`,
			)
			.run('old-arc', 'proj-1', 'Legacy Arc', now, now);

		const { POST } = await import('../../src/routes/api/nova/outline/apply/+server.js');
		const request = new Request('http://localhost/api/nova/outline/apply', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				payload: {
					arcs: [],
					acts: [],
					milestones: [],
					chapters: [],
					scenes: [],
					beats: [],
				},
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(200);
		const arcCount = testDb.prepare('SELECT COUNT(*) as count FROM arcs WHERE projectId = ?').get('proj-1') as { count: number };
		expect(arcCount.count).toBe(0);
	});
});

