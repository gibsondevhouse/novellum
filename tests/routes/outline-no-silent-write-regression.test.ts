import Database from 'better-sqlite3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	type OutlineDraft,
	type OutlineDraftCheckpointRecord,
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
	decodeJson(raw: string | number | null | undefined) {
		return JSON.parse(String(raw ?? '[]')) as unknown;
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

const { POST: generateOutline } = await import('../../src/routes/api/ai/outline/generate/+server.js');
const { PUT: putMetadata } = await import(
	'../../src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.js'
);
const { POST: acceptOutlineCheckpoint } = await import(
	'../../src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.js'
);

const now = '2026-06-04T18:00:00.000Z';

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

		CREATE TABLE story_frames (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			premise TEXT,
			theme TEXT,
			toneNotes TEXT,
			updatedAt TEXT
		);
		CREATE TABLE characters (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			name TEXT,
			role TEXT,
			bio TEXT,
			createdAt TEXT,
			updatedAt TEXT
		);
		CREATE TABLE plot_threads (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			title TEXT,
			description TEXT,
			status TEXT,
			createdAt TEXT,
			updatedAt TEXT
		);
		CREATE TABLE locations (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			name TEXT,
			description TEXT,
			createdAt TEXT,
			updatedAt TEXT
		);
		CREATE TABLE factions (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			name TEXT,
			type TEXT,
			description TEXT,
			mission TEXT,
			ideology TEXT,
			createdAt TEXT,
			updatedAt TEXT
		);
		CREATE TABLE lore_entries (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			title TEXT,
			category TEXT,
			content TEXT,
			createdAt TEXT,
			updatedAt TEXT
		);
		CREATE TABLE timeline_events (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			title TEXT,
			description TEXT,
			date TEXT,
			createdAt TEXT,
			updatedAt TEXT
		);
		CREATE TABLE themes (
			id TEXT PRIMARY KEY,
			projectId TEXT NOT NULL,
			title TEXT,
			description TEXT,
			tensionPair TEXT,
			imagery TEXT,
			createdAt TEXT,
			updatedAt TEXT
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
	return database;
}

function seedReadyProject(projectId = 'project-1'): void {
	dbState.database
		.prepare(
			`INSERT INTO projects (id, title, genre, logline, synopsis, targetWordCount, status, projectType, createdAt, updatedAt)
			 VALUES (@id, @title, @genre, @logline, @synopsis, @targetWordCount, @status, @projectType, @createdAt, @updatedAt)`,
		)
		.run({
			id: projectId,
			title: 'Storm Ledger',
			genre: 'climate noir',
			logline: 'A courier must outrun a civil war to deliver the last weather map.',
			synopsis: '',
			targetWordCount: 85_000,
			status: 'planning',
			projectType: 'novel',
			createdAt: now,
			updatedAt: now,
		});

	dbState.database
		.prepare(
			`INSERT INTO characters (id, projectId, name, role, bio, createdAt, updatedAt)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		)
		.run('char-1', projectId, 'Iri Vale', 'Courier', 'Carries the weather map.', now, now);
}

function createDraft(projectId = 'project-1', variant = 'main'): OutlineDraft {
	const prefix = `${variant}-${projectId}`;
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: `outline-${prefix}`,
		projectId,
		slug: `outline-${prefix}`,
		title: 'Generated Outline',
		sourceContext: {
			summary: 'Characters and plot threads are ready.',
			includedDomains: ['characters', 'plotThreads'],
			entityCounts: { characters: 1, plotThreads: 1 },
		},
		arcs: [
			{
				id: `arc-${prefix}`,
				slug: `arc-${prefix}`,
				title: 'Main Arc',
				order: 0,
				summary: 'The public conflict around the ledger.',
				purpose: 'Track the conspiracy reveal.',
				acts: [
					{
						id: `act-${prefix}`,
						slug: `act-${prefix}`,
						title: 'Act One',
						order: 0,
						summary: 'The ledger surfaces.',
						chapters: [
							{
								id: `chapter-${prefix}`,
								slug: `chapter-${prefix}`,
								title: 'Chapter One',
								order: 0,
								summary: 'A courier accepts the wrong job.',
								scenes: [
									{
										id: `scene-${prefix}`,
										slug: `scene-${prefix}`,
										title: 'Scene One',
										order: 0,
										summary: 'The archive door will not open.',
										intent: {
											goal: 'Recover the missing ledger.',
											conflict: 'The faction courier refuses to hand it over.',
											turn: 'The ledger contains the protagonist name.',
											outcome: 'The protagonist becomes implicated in the conspiracy.',
										},
										povCharacterId: 'char-1',
										characterIds: ['char-1'],
										locationIds: ['archive'],
										plotThreadIds: ['ledger'],
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

function providerResponse(content: string) {
	return {
		model: 'test-model',
		content,
		finishReason: 'stop' as const,
	};
}

function postGenerateRequest(body: unknown): Request {
	return new Request('http://localhost/api/ai/outline/generate', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

async function postGenerate(body: unknown): Promise<Response> {
	return generateOutline({
		request: postGenerateRequest(body),
	} as Parameters<typeof generateOutline>[0]);
}

function putCheckpointRequest(body: unknown): Request {
	return new Request(
		'http://localhost/api/db/project-metadata/project-1/pipeline/outlineDraftCheckpoints.v1/checkpoint',
		{
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
		},
	);
}

async function putCheckpoint(checkpointId: string, body: unknown): Promise<Response> {
	return putMetadata({
		params: {
			projectId: 'project-1',
			scope: 'pipeline',
			ownerId: OUTLINE_CHECKPOINT_OWNER_ID,
			key: checkpointId,
		},
		request: putCheckpointRequest(body),
	} as Parameters<typeof putMetadata>[0]);
}

function postAcceptRequest(checkpoint: OutlineDraftCheckpointRecord): Request {
	return new Request(`http://localhost/api/outline/checkpoints/${checkpoint.id}/accept`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			projectId: checkpoint.projectId,
			expectedUpdatedAt: checkpoint.updatedAt,
			expectedVersion: checkpoint.version,
			acceptedBy: 'route-regression',
		}),
	});
}

async function postAccept(checkpoint: OutlineDraftCheckpointRecord): Promise<Response> {
	return acceptOutlineCheckpoint({
		params: { checkpointId: checkpoint.id },
		request: postAcceptRequest(checkpoint),
	} as Parameters<typeof acceptOutlineCheckpoint>[0]);
}

function countRows(table: string, projectId = 'project-1'): number {
	const row = dbState.database
		.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE projectId = ?`)
		.get(projectId) as { count: number };
	return row.count;
}

function countHierarchyRows(projectId = 'project-1'): number {
	return ['arcs', 'acts', 'milestones', 'chapters', 'scenes', 'beats', 'stages'].reduce(
		(total, table) => total + countRows(table, projectId),
		0,
	);
}

function storedCheckpoint(checkpointId: string): OutlineDraftCheckpointRecord {
	const row = dbState.database
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get('project-1', 'pipeline', OUTLINE_CHECKPOINT_OWNER_ID, checkpointId) as
		| { value: string }
		| undefined;
	if (!row) throw new Error(`Missing checkpoint ${checkpointId}.`);
	return JSON.parse(row.value) as OutlineDraftCheckpointRecord;
}

async function generateReviewCheckpoint(variant: string): Promise<{
	checkpoint: OutlineDraftCheckpointRecord;
	outlineConflict: unknown;
}> {
	providerState.completeMock.mockResolvedValueOnce(
		providerResponse(JSON.stringify(createDraft('project-1', variant))),
	);
	const response = await postGenerate({ projectId: 'project-1', confirmContextReady: true });

	expect(response.status).toBe(200);
	const body = (await response.json()) as {
		checkpoint: OutlineDraftCheckpointRecord;
		outlineConflict: unknown;
	};
	expect(body.checkpoint.lifecycle).toBe('review');
	return body;
}

describe('outline generation review gate regression', () => {
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

	it('persists generated output as a review checkpoint without hierarchy writes, then accept materializes explicitly', async () => {
		seedReadyProject();

		const { checkpoint } = await generateReviewCheckpoint('accept');

		expect(countRows('project_metadata')).toBe(1);
		expect(countHierarchyRows()).toBe(0);
		expect(providerState.completeMock).toHaveBeenCalledTimes(1);

		const response = await postAccept(checkpoint);

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			checkpoint: OutlineDraftCheckpointRecord;
			materialization: { counts: Record<string, number> };
		};
		expect(body.checkpoint.lifecycle).toBe('accepted');
		expect(body.materialization.counts).toMatchObject({
			arcs: 1,
			acts: 1,
			milestones: 1,
			chapters: 1,
			scenes: 1,
			beats: 0,
			stages: 0,
			sceneIntentMetadata: 3,
		});
		expect(countRows('arcs')).toBe(1);
		expect(countRows('acts')).toBe(1);
		expect(countRows('milestones')).toBe(1);
		expect(countRows('chapters')).toBe(1);
		expect(countRows('scenes')).toBe(1);
		expect(storedCheckpoint(checkpoint.id).lifecycle).toBe('accepted');
	});

	it('rejects a generated review checkpoint without hierarchy writes', async () => {
		seedReadyProject();
		const { checkpoint } = await generateReviewCheckpoint('reject');

		const response = await putCheckpoint(checkpoint.id, {
			operation: 'reject',
			rejectedBy: 'route-regression',
			reason: 'The midpoint repeats the reveal.',
		});

		expect(response.status).toBe(200);
		const body = (await response.json()) as { checkpoint: OutlineDraftCheckpointRecord };
		expect(body.checkpoint.lifecycle).toBe('rejected');
		expect(body.checkpoint.rejection?.reason).toContain('midpoint');
		expect(countHierarchyRows()).toBe(0);
		expect(storedCheckpoint(checkpoint.id).lifecycle).toBe('rejected');
	});

	it('warns on generation conflict and blocks accept without adding hierarchy rows', async () => {
		seedReadyProject();
		dbState.database
			.prepare(
				`INSERT INTO arcs (id, projectId, title, description, purpose, arcType, status, "order", createdAt, updatedAt)
				 VALUES (?, ?, ?, '', '', NULL, 'planned', 0, ?, ?)`,
			)
			.run('existing-arc', 'project-1', 'Existing Arc', now, now);

		const generated = await generateReviewCheckpoint('conflict');

		expect(countHierarchyRows()).toBe(1);
		expect(generated.outlineConflict).toMatchObject({
			code: 'outline_conflict',
			hasConflict: true,
			counts: {
				arcs: 1,
			},
		});
		const { checkpoint } = generated;
		expect(storedCheckpoint(checkpoint.id).lifecycle).toBe('review');

		const response = await postAccept(checkpoint);

		expect(response.status).toBe(409);
		const body = (await response.json()) as { code: string; meta: { counts: { arcs: number } } };
		expect(body).toMatchObject({
			code: 'outline_conflict',
			meta: {
				counts: {
					arcs: 1,
				},
			},
		});
		expect(countRows('arcs')).toBe(1);
		expect(countRows('acts')).toBe(0);
		expect(countRows('milestones')).toBe(0);
		expect(countRows('chapters')).toBe(0);
		expect(countRows('scenes')).toBe(0);
		expect(storedCheckpoint(checkpoint.id).lifecycle).toBe('review');
	});
});
