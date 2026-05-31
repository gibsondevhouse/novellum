import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';

let testDb: Database.Database;

vi.mock('$lib/server/db/index.js', () => ({
	get db() {
		return testDb;
	},
}));

vi.mock('$lib/server/credentials/credential-service.js', () => ({
	createCredentialService: () => ({
		loadProviderKey: vi.fn().mockResolvedValue(null),
	}),
}));

vi.mock('$lib/server/preferences/preferences-service.js', () => ({
	getPreference: vi.fn().mockReturnValue(undefined),
}));

function createDb() {
	const db = new Database(':memory:');
	db.exec(`
		CREATE TABLE projects (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			genre TEXT NOT NULL DEFAULT '',
			logline TEXT NOT NULL DEFAULT '',
			synopsis TEXT NOT NULL DEFAULT '',
			targetWordCount INTEGER NOT NULL DEFAULT 0,
			status TEXT NOT NULL DEFAULT 'drafting',
			systemPrompt TEXT NOT NULL DEFAULT '',
			negativePrompt TEXT NOT NULL DEFAULT '',
			projectType TEXT NOT NULL DEFAULT 'novel',
			lastOpenedAt TEXT NOT NULL DEFAULT '',
			stylePresetId TEXT NOT NULL DEFAULT '',
			createdAt TEXT NOT NULL,
			updatedAt TEXT NOT NULL
		);
		CREATE TABLE project_metadata (
			projectId TEXT NOT NULL,
			scope TEXT NOT NULL,
			ownerId TEXT NOT NULL,
			key TEXT NOT NULL,
			value TEXT NOT NULL,
			updatedAt TEXT NOT NULL,
			PRIMARY KEY (projectId, scope, ownerId, key)
		);
	`);

	const now = new Date().toISOString();
	db.prepare(
		`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, systemPrompt, negativePrompt, projectType, lastOpenedAt, stylePresetId, createdAt, updatedAt)
		 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @systemPrompt, @negativePrompt, @projectType, @lastOpenedAt, @stylePresetId, @createdAt, @updatedAt)`,
	).run({
		id: 'proj-1',
		title: 'Signal Fire',
		genre: 'fantasy',
		logline: 'A courier must outrun a civil war.',
		synopsis: 'Synopsis text',
		targetWordCount: 90000,
		status: 'drafting',
		systemPrompt: '',
		negativePrompt: '',
		projectType: 'novel',
		lastOpenedAt: now,
		stylePresetId: '',
		createdAt: now,
		updatedAt: now,
	});

	db.prepare(
		`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
		 VALUES (@projectId, @scope, @ownerId, @key, @value, @updatedAt)`,
	).run({
		projectId: 'proj-1',
		scope: 'project',
		ownerId: 'proj-1',
		key: 'lineages',
		value: JSON.stringify({
			lin1: {
				id: 'lin1',
				name: 'House Tal',
				lineageType: 'dynasty',
				summary: 'Old merchant bloodline',
			},
		}),
		updatedAt: now,
	});

	return db;
}

describe('POST /api/worldbuilding/generate', () => {
	beforeEach(() => {
		testDb = createDb();
		process.env.NOVELLUM_AI_MOCK = '1';
		vi.resetModules();
	});

	afterEach(() => {
		delete process.env.NOVELLUM_AI_MOCK;
	});

	it('accepts the lineage entityKind and returns lineage mock drafts', async () => {
		const { POST } = await import('../../src/routes/api/worldbuilding/generate/+server.js');
		const request = new Request('http://localhost/api/worldbuilding/generate', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				entityKind: 'lineage',
				count: 1,
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(200);
		const payload = (await response.json()) as {
			entityKind: string;
			drafts: Array<Record<string, unknown>>;
		};
		expect(payload.entityKind).toBe('lineage');
		expect(payload.drafts).toHaveLength(1);
		expect(payload.drafts[0].name).toBeTypeOf('string');
		expect(payload.drafts[0].lineageType).toBeTypeOf('string');
	});

	it('returns realm drafts with realmType field in mock mode', async () => {
		const { POST } = await import('../../src/routes/api/worldbuilding/generate/+server.js');
		const request = new Request('http://localhost/api/worldbuilding/generate', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				entityKind: 'realm',
				count: 1,
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(200);
		const payload = (await response.json()) as {
			drafts: Array<Record<string, unknown>>;
		};
		expect(payload.drafts[0].realmType).toBeTypeOf('string');
	});

	it('accepts structured generationContext payload in mock mode', async () => {
		const { POST } = await import('../../src/routes/api/worldbuilding/generate/+server.js');
		const request = new Request('http://localhost/api/worldbuilding/generate', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				entityKind: 'character',
				count: 1,
				generationContext: {
					note: 'Favor project-title entities as anchors.',
					hints: [
						{ name: 'Oayara', intent: 'target', source: 'title' },
						{ name: 'Ash Court', intent: 'avoid', source: 'manual' },
					],
				},
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(200);
		const payload = (await response.json()) as {
			entityKind: string;
			drafts: Array<Record<string, unknown>>;
		};
		expect(payload.entityKind).toBe('character');
		expect(payload.drafts).toHaveLength(1);
		expect(payload.drafts[0].name).toBeTypeOf('string');
		expect(payload.drafts[0].coreDesire).toBeTypeOf('string');
		expect(payload.drafts[0].voiceSummary).toBeTypeOf('string');
	});

	it('keeps legacy context string requests working in mock mode', async () => {
		const { POST } = await import('../../src/routes/api/worldbuilding/generate/+server.js');
		const request = new Request('http://localhost/api/worldbuilding/generate', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				entityKind: 'character',
				count: 1,
				context: 'Legacy free-text context still supported.',
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(200);
		const payload = (await response.json()) as {
			entityKind: string;
			drafts: Array<Record<string, unknown>>;
		};
		expect(payload.entityKind).toBe('character');
		expect(payload.drafts).toHaveLength(1);
		expect(payload.drafts[0].name).toBeTypeOf('string');
		expect(payload.drafts[0].storyRole).toBeTypeOf('string');
	});

	it('returns faction drafts with correct shape in mock mode', async () => {
		const { POST } = await import('../../src/routes/api/worldbuilding/generate/+server.js');
		const request = new Request('http://localhost/api/worldbuilding/generate', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ projectId: 'proj-1', entityKind: 'faction', count: 1 }),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(200);
		const payload = (await response.json()) as { drafts: Array<Record<string, unknown>> };
		expect(payload.drafts[0].name).toBeTypeOf('string');
		expect(payload.drafts[0].type).toBeTypeOf('string');
		expect(payload.drafts[0].description).toBeTypeOf('string');
	});

	it('accepts context hints for lineage generation and returns normalized drafts', async () => {
		const { POST } = await import('../../src/routes/api/worldbuilding/generate/+server.js');
		const request = new Request('http://localhost/api/worldbuilding/generate', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				entityKind: 'lineage',
				count: 1,
				generationContext: {
					hints: [{ name: 'House Tal', intent: 'target', source: 'manual' }],
				},
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(200);
		const payload = (await response.json()) as { drafts: Array<Record<string, unknown>> };
		expect(payload.drafts[0].name).toBeTypeOf('string');
		expect(payload.drafts[0].lineageType).toBeTypeOf('string');
	});

	it('drafts returned from mock mode pass validator shape (no undefined fields)', async () => {
		const { POST } = await import('../../src/routes/api/worldbuilding/generate/+server.js');
		for (const entityKind of ['character', 'faction', 'lineage', 'realm', 'landmark', 'lore-entry', 'plot-thread', 'timeline-event']) {
			const request = new Request('http://localhost/api/worldbuilding/generate', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ projectId: 'proj-1', entityKind, count: 1 }),
			});
			const response = await POST({ request } as never);
			expect(response.status).toBe(200);
			const payload = (await response.json()) as { drafts: Array<Record<string, unknown>> };
			expect(payload.drafts).toHaveLength(1);
			// All normalized drafts should have no undefined-valued required key
			const draft = payload.drafts[0];
			for (const [, v] of Object.entries(draft)) {
				expect(v).not.toBeUndefined();
			}
		}
	});
});
