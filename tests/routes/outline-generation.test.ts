import { beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	type OutlineDraft,
} from '../../src/lib/ai/pipeline/outline-draft-contract.js';
import { OUTLINE_CHECKPOINT_OWNER_ID } from '../../src/lib/ai/pipeline/outline-checkpoint-contract.js';

const dbState = vi.hoisted(() => ({
	database: undefined as unknown as Database.Database,
}));

const providerState = vi.hoisted(() => {
	class MockAiProviderError extends Error {
		readonly code: string;
		readonly status: number;

		constructor(code: string, status: number, message: string) {
			super(message);
			this.name = 'AiProviderError';
			this.code = code;
			this.status = status;
		}
	}

	return {
		completeMock: vi.fn(),
		loadProviderKeyMock: vi.fn(),
		getPreferenceMock: vi.fn(),
		ensureOllamaRunningMock: vi.fn(),
		MockAiProviderError,
	};
});

vi.mock('$lib/server/db/index.js', () => ({
	get db() {
		return dbState.database;
	},
	encodeJson(value: unknown) {
		return JSON.stringify(value ?? []);
	},
}));

vi.mock('$lib/server/credentials/credential-service.js', () => ({
	createCredentialService: () => ({
		loadProviderKey: (...args: unknown[]) => providerState.loadProviderKeyMock(...args),
	}),
}));

vi.mock('$lib/server/preferences/preferences-service.js', () => ({
	getPreference: (...args: unknown[]) => providerState.getPreferenceMock(...args),
}));

vi.mock('$lib/server/ai/ollama-launcher.js', () => ({
	ensureOllamaRunning: (...args: unknown[]) => providerState.ensureOllamaRunningMock(...args),
}));

vi.mock('$lib/ai/providers/index.js', () => ({
	AiProviderError: providerState.MockAiProviderError,
	OLLAMA_DEFAULT_BASE_URL: 'http://localhost:11434',
	createOpenRouterProvider: () => ({
		complete: (...args: unknown[]) => providerState.completeMock(...args),
	}),
	createOllamaProvider: () => ({
		complete: (...args: unknown[]) => providerState.completeMock(...args),
	}),
}));

const { POST } = await import('../../src/routes/api/ai/outline/generate/+server.js');

const now = '2026-06-03T12:00:00.000Z';

function createDb(): Database.Database {
	const database = new Database(':memory:');
	database.exec(`
		CREATE TABLE projects (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			genre TEXT NOT NULL DEFAULT '',
			logline TEXT NOT NULL DEFAULT '',
			synopsis TEXT NOT NULL DEFAULT '',
			targetWordCount INTEGER NOT NULL DEFAULT 0,
			status TEXT NOT NULL DEFAULT 'planning',
			projectType TEXT NOT NULL DEFAULT 'novel',
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
		CREATE TABLE story_frames (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, premise TEXT, theme TEXT, toneNotes TEXT, updatedAt TEXT);
		CREATE TABLE characters (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, name TEXT, role TEXT, bio TEXT, createdAt TEXT, updatedAt TEXT);
		CREATE TABLE plot_threads (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, title TEXT, description TEXT, status TEXT, createdAt TEXT, updatedAt TEXT);
		CREATE TABLE locations (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, name TEXT, description TEXT, createdAt TEXT, updatedAt TEXT);
		CREATE TABLE factions (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, name TEXT, type TEXT, description TEXT, mission TEXT, ideology TEXT, createdAt TEXT, updatedAt TEXT);
		CREATE TABLE lore_entries (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, title TEXT, category TEXT, content TEXT, createdAt TEXT, updatedAt TEXT);
		CREATE TABLE timeline_events (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, title TEXT, description TEXT, date TEXT, createdAt TEXT, updatedAt TEXT);
		CREATE TABLE themes (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, title TEXT, description TEXT, tensionPair TEXT, imagery TEXT, createdAt TEXT, updatedAt TEXT);
		CREATE TABLE arcs (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE acts (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE milestones (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE chapters (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE scenes (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE beats (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE stages (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
	`);
	return database;
}

function seedProject(options: { ready?: boolean } = {}): void {
	dbState.database
		.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, projectType, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @projectType, @createdAt, @updatedAt)`,
		)
		.run({
			id: 'project-1',
			title: 'Storm Ledger',
			genre: 'climate noir',
			logline: options.ready
				? 'A courier must outrun a civil war to deliver the last weather map.'
				: '',
			synopsis: '',
			targetWordCount: 85_000,
			status: 'planning',
			projectType: 'novel',
			createdAt: now,
			updatedAt: now,
		});

	if (options.ready) {
		dbState.database
			.prepare(
				`INSERT INTO characters (id, projectId, name, role, bio, createdAt, updatedAt)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			)
			.run('char-1', 'project-1', 'Iri Vale', 'Courier', 'Carries the weather map.', now, now);
	}
}

function createDraft(projectId = 'project-1'): OutlineDraft {
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: `outline-${projectId}`,
		projectId,
		slug: `outline-${projectId}`,
		title: 'Generated Outline',
		sourceContext: {
			summary: 'Ready context.',
			includedDomains: ['characters', 'plotThreads'],
			entityCounts: { characters: 1, plotThreads: 1 },
		},
		arcs: [
			{
				id: `arc-${projectId}`,
				slug: `arc-${projectId}`,
				title: 'Main Arc',
				order: 0,
				summary: '',
				purpose: '',
				acts: [
					{
						id: `act-${projectId}`,
						slug: `act-${projectId}`,
						title: 'Act One',
						order: 0,
						summary: '',
						chapters: [
							{
								id: `chapter-${projectId}`,
								slug: `chapter-${projectId}`,
								title: 'Chapter One',
								order: 0,
								summary: '',
								scenes: [
									{
										id: `scene-${projectId}`,
										slug: `scene-${projectId}`,
										title: 'Scene One',
										order: 0,
										summary: '',
										intent: {
											goal: 'Recover the missing ledger.',
											conflict: 'The guild courier refuses to hand it over.',
											turn: 'The ledger contains the protagonist name.',
											outcome: 'The protagonist becomes implicated in the conspiracy.',
										},
										characterIds: ['char-1'],
										locationIds: [],
										plotThreadIds: [],
									},
								],
							},
						],
					},
				],
			},
		],
	};
}

function postRequest(body: unknown): Request {
	return new Request('http://localhost/api/ai/outline/generate', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

async function postGenerate(body: unknown): Promise<Response> {
	return POST({ request: postRequest(body) } as Parameters<typeof POST>[0]);
}

function providerResponse(content: string) {
	return {
		model: 'test-model',
		content,
		finishReason: 'stop' as const,
	};
}

function countRows(table: string): number {
	const row = dbState.database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as {
		count: number;
	};
	return row.count;
}

function countHierarchyRows(): number {
	return ['arcs', 'acts', 'milestones', 'chapters', 'scenes', 'beats', 'stages'].reduce(
		(total, table) => total + countRows(table),
		0,
	);
}

describe('POST /api/ai/outline/generate', () => {
	beforeEach(() => {
		delete process.env.NOVELLUM_AI_MOCK;
		dbState.database = createDb();
		providerState.completeMock.mockReset();
		providerState.loadProviderKeyMock.mockReset();
		providerState.getPreferenceMock.mockReset();
		providerState.ensureOllamaRunningMock.mockReset();
		providerState.getPreferenceMock.mockReturnValue(undefined);
		providerState.loadProviderKeyMock.mockResolvedValue('test-key');
	});

	it('returns a safe credential error when no API key is configured', async () => {
		seedProject({ ready: true });
		providerState.loadProviderKeyMock.mockResolvedValueOnce(null);

		const response = await postGenerate({ projectId: 'project-1' });

		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: { code: string; message: string } };
		expect(body.error.code).toBe('no_credentials');
		expect(body.error.message).not.toContain('test-key');
		expect(providerState.completeMock).not.toHaveBeenCalled();
	});

	it('blocks low-context requests before calling the provider', async () => {
		seedProject({ ready: false });

		const response = await postGenerate({ projectId: 'project-1' });

		expect(response.status).toBe(422);
		const body = (await response.json()) as { error: { code: string; missing: Array<{ code: string }> } };
		expect(body.error.code).toBe('context_not_ready');
		expect(body.error.missing.map((item) => item.code)).toEqual([
			'story_premise_missing',
			'story_source_missing',
		]);
		expect(providerState.completeMock).not.toHaveBeenCalled();
		expect(countRows('project_metadata')).toBe(0);
	});

	it('persists a valid provider response as a review checkpoint only', async () => {
		seedProject({ ready: true });
		providerState.completeMock.mockResolvedValueOnce(providerResponse(JSON.stringify(createDraft())));

		const response = await postGenerate({ projectId: 'project-1', confirmContextReady: true });

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			checkpoint: { lifecycle: string; ownerId: string; draft: { sourceContext: { contextHash?: string } } };
			contextHash: string;
			attempts: number;
			confirmContextReady: boolean;
		};
		expect(body.checkpoint.lifecycle).toBe('review');
		expect(body.checkpoint.ownerId).toBe(OUTLINE_CHECKPOINT_OWNER_ID);
		expect(body.checkpoint.draft.sourceContext.contextHash).toBe(body.contextHash);
		expect(body.attempts).toBe(1);
		expect(body.confirmContextReady).toBe(true);
		expect(countRows('project_metadata')).toBe(1);
		expect(countHierarchyRows()).toBe(0);
		expect(providerState.completeMock).toHaveBeenCalledTimes(1);
		expect(providerState.completeMock.mock.calls[0]?.[1]).toMatchObject({
			model: 'openai/gpt-4o-mini',
			responseFormat: {
				type: 'json_schema',
				jsonSchema: { name: 'novellum_outline_draft', strict: true },
			},
		});
		expect(JSON.stringify(body)).not.toContain(JSON.stringify(createDraft()));
	});

	it('warns that generation is review-only when existing hierarchy is present', async () => {
		seedProject({ ready: true });
		dbState.database.prepare('INSERT INTO arcs (id, projectId) VALUES (?, ?)').run('arc-existing', 'project-1');
		providerState.completeMock.mockResolvedValueOnce(providerResponse(JSON.stringify(createDraft())));

		const response = await postGenerate({ projectId: 'project-1', confirmContextReady: true });

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			checkpoint: { lifecycle: string };
			outlineConflict: {
				code: string;
				state: string;
				hasConflict: boolean;
				counts: { arcs: number };
			};
		};
		expect(body.checkpoint.lifecycle).toBe('review');
		expect(body.outlineConflict).toMatchObject({
			code: 'outline_conflict',
			state: 'partial',
			hasConflict: true,
			counts: { arcs: 1 },
		});
		expect(countRows('project_metadata')).toBe(1);
		expect(countHierarchyRows()).toBe(1);
	});

	it('runs one repair attempt for schema failures and then persists valid repair output', async () => {
		seedProject({ ready: true });
		providerState.completeMock
			.mockResolvedValueOnce(providerResponse('not json'))
			.mockResolvedValueOnce(providerResponse(JSON.stringify(createDraft())));

		const response = await postGenerate({ projectId: 'project-1' });

		expect(response.status).toBe(200);
		const body = (await response.json()) as { attempts: number; checkpoint: { lifecycle: string } };
		expect(body.attempts).toBe(2);
		expect(body.checkpoint.lifecycle).toBe('review');
		expect(providerState.completeMock).toHaveBeenCalledTimes(2);
		expect(providerState.completeMock.mock.calls[1]?.[1].messages[0].content).toContain('one bounded retry');
		expect(countRows('project_metadata')).toBe(1);
		expect(countHierarchyRows()).toBe(0);
	});

	it('returns validation failure without raw output or hierarchy writes when repair fails', async () => {
		seedProject({ ready: true });
		providerState.completeMock
			.mockResolvedValueOnce(providerResponse('RAW INVALID OUTPUT'))
			.mockResolvedValueOnce(providerResponse('RAW INVALID OUTPUT AGAIN'));

		const response = await postGenerate({ projectId: 'project-1' });

		expect(response.status).toBe(422);
		const body = (await response.json()) as { error: { code: string; issues: unknown[] } };
		expect(body.error.code).toBe('schema_validation_failed');
		expect(body.error.issues.length).toBeGreaterThan(0);
		expect(JSON.stringify(body)).not.toContain('RAW INVALID OUTPUT');
		expect(countRows('project_metadata')).toBe(0);
		expect(countHierarchyRows()).toBe(0);
		expect(providerState.completeMock).toHaveBeenCalledTimes(2);
	});
});
