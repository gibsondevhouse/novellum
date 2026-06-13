import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import type { ScanErrorResponse } from '../../src/routes/api/worldbuilding/scan/+server.js';

let testDb: Database.Database;

vi.mock('$lib/server/db/index.js', () => ({
	get db() {
		return testDb;
	},
	encodeJson(val: unknown): string {
		if (val == null) return '[]';
		return JSON.stringify(val);
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

function createDb(): Database.Database {
	const database = new Database(':memory:');
	database.exec(`
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
	return database;
}

function makeRequest(body: unknown): Request {
	return new Request('http://localhost/api/worldbuilding/scan', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

async function callScan(body: unknown): Promise<Response> {
	const { POST } = await import('../../src/routes/api/worldbuilding/scan/+server.js');
	return POST({ request: makeRequest(body) } as never);
}

const VALID_CONTEXT = {
	project: {
		projectId: 'proj-1',
		title: 'Signal Fire',
		genre: 'fantasy',
		logline: 'A courier must outrun a civil war.',
		synopsis: 'Elara Voss discovers the empire is burning.',
	},
	canon: {
		characterNames: [],
		factionNames: [],
		locationNames: [],
		loreEntryTitles: [],
		plotThreadTitles: [],
		timelineEventTitles: [],
	},
};

beforeEach(() => {
	testDb = createDb();
	process.env.NOVELLUM_AI_MOCK = '1';
	vi.resetModules();
});

afterEach(() => {
	delete process.env.NOVELLUM_AI_MOCK;
});

describe('POST /api/worldbuilding/scan', () => {
	describe('invalid_request (400)', () => {
		it('returns 400 when body is not valid JSON', async () => {
			const { POST } = await import('../../src/routes/api/worldbuilding/scan/+server.js');
			const request = new Request('http://localhost/api/worldbuilding/scan', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: 'not-json{',
			});
			const response = await POST({ request } as never);
			expect(response.status).toBe(400);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('invalid_request');
		});

		it('returns 400 when projectId is missing', async () => {
			const response = await callScan({
				domainScope: 'personae',
				context: VALID_CONTEXT,
			});
			expect(response.status).toBe(400);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('invalid_request');
		});

		it('returns 400 when domainScope is missing', async () => {
			const response = await callScan({
				projectId: 'proj-1',
				context: VALID_CONTEXT,
			});
			expect(response.status).toBe(400);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('invalid_request');
		});

		it('returns 400 when domainScope is not a recognized domain', async () => {
			const response = await callScan({
				projectId: 'proj-1',
				domainScope: 'inventory',
				context: VALID_CONTEXT,
			});
			expect(response.status).toBe(400);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('invalid_request');
		});

		it('returns 400 when context is absent', async () => {
			const response = await callScan({
				projectId: 'proj-1',
				domainScope: 'personae',
			});
			expect(response.status).toBe(400);
		});
	});

	describe('context_insufficient (422)', () => {
		it('returns 422 when project title is empty', async () => {
			const response = await callScan({
				projectId: 'proj-1',
				domainScope: 'personae',
				context: {
					...VALID_CONTEXT,
					project: { ...VALID_CONTEXT.project, title: '' },
				},
			});
			expect(response.status).toBe(422);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('context_insufficient');
			expect(body.error.details?.missing).toContain('title');
		});

		it('returns 422 when logline is empty', async () => {
			const response = await callScan({
				projectId: 'proj-1',
				domainScope: 'personae',
				context: {
					...VALID_CONTEXT,
					project: { ...VALID_CONTEXT.project, logline: '' },
				},
			});
			expect(response.status).toBe(422);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('context_insufficient');
		});

		it('returns 422 when synopsis is empty', async () => {
			const response = await callScan({
				projectId: 'proj-1',
				domainScope: 'personae',
				context: {
					...VALID_CONTEXT,
					project: { ...VALID_CONTEXT.project, synopsis: '' },
				},
			});
			expect(response.status).toBe(422);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('context_insufficient');
		});
	});

	describe('successful scan execution', () => {
		it('returns pending proposals and persists them in mock mode', async () => {
			const response = await callScan({
				projectId: 'proj-1',
				domainScope: 'personae',
				context: VALID_CONTEXT,
				maxProposals: 3,
			});
			expect(response.status).toBe(200);
			const body = (await response.json()) as {
				ok: true;
				proposals: Array<Record<string, unknown>>;
			};
			expect(body.ok).toBe(true);
			expect(body.proposals).toHaveLength(3);
			expect(body.proposals[0].status).toBe('pending_review');

			const row = testDb
				.prepare(
					`SELECT COUNT(*) as count FROM project_metadata
					 WHERE projectId = ? AND scope = 'pipeline' AND ownerId = 'vibe-worldbuild-scan'`,
				)
				.get('proj-1') as { count: number };
			expect(row.count).toBe(3);
		});

		it('surfaces canon duplicate candidates without blocking proposal persistence', async () => {
			const response = await callScan({
				projectId: 'proj-1',
				domainScope: 'personae',
				context: {
					...VALID_CONTEXT,
					project: { ...VALID_CONTEXT.project, title: 'Signal Fire' },
					canon: {
						...VALID_CONTEXT.canon,
						characterNames: ['Signal Fire Witness 1'],
					},
				},
				maxProposals: 1,
			});
			expect(response.status).toBe(200);
			const body = (await response.json()) as {
				ok: true;
				proposals: Array<{ duplicateCandidates?: Array<Record<string, unknown>> }>;
			};
			expect(body.proposals).toHaveLength(1);
			expect(body.proposals[0].duplicateCandidates?.[0]).toMatchObject({
				displayName: 'Signal Fire Witness 1',
				matchKind: 'exact_key',
				score: 1,
			});

			const row = testDb
				.prepare(
					`SELECT COUNT(*) as count FROM project_metadata
					 WHERE projectId = ? AND scope = 'pipeline' AND ownerId = 'vibe-worldbuild-scan'`,
				)
				.get('proj-1') as { count: number };
			expect(row.count).toBe(1);
		});

		it('accepts all valid domain scopes and produces scoped proposals', async () => {
			const domains = ['personae', 'atlas', 'archive', 'threads', 'chronicles'];
			for (const domainScope of domains) {
				const response = await callScan({
					projectId: 'proj-1',
					domainScope,
					context: VALID_CONTEXT,
					maxProposals: 1,
				});
				expect(response.status).toBe(200);
				const body = (await response.json()) as { proposals: Array<Record<string, unknown>> };
				expect(body.proposals[0].categoryId).toBe(domainScope);
			}
		});
	});

	describe('no_credentials (401)', () => {
		it('returns 401 when mock mode is disabled and no provider key exists', async () => {
			delete process.env.NOVELLUM_AI_MOCK;
			const response = await callScan({
				projectId: 'proj-1',
				domainScope: 'personae',
				context: VALID_CONTEXT,
			});
			expect(response.status).toBe(401);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('no_credentials');
		});
	});

	describe('error response shape', () => {
		it('includes code and message in the error body', async () => {
			const response = await callScan({ projectId: 'proj-1' });
			const body = (await response.json()) as ScanErrorResponse;
			expect(typeof body.error.code).toBe('string');
			expect(typeof body.error.message).toBe('string');
			expect(body.error.message.length).toBeGreaterThan(0);
		});

		it('never exposes raw credentials or system prompts in the error body', async () => {
			const response = await callScan({ projectId: 'proj-1' });
			const raw = await response.text();
			expect(raw).not.toMatch(/sk-/);
			expect(raw).not.toMatch(/systemPrompt/);
		});
	});
});
