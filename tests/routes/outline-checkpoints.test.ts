import { beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	type OutlineDraft,
} from '$lib/ai/pipeline/outline-draft-contract.js';
import { OUTLINE_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/outline-checkpoint-contract.js';

const dbState = vi.hoisted(() => ({
	database: undefined as unknown as Database.Database,
}));

vi.mock('$lib/server/db/index.js', () => ({
	get db() {
		return dbState.database;
	},
	encodeJson(value: unknown) {
		return JSON.stringify(value ?? []);
	},
}));

import { GET as listMetadata } from '../../src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/+server.js';
import { PUT as putMetadata } from '../../src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.js';

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

		CREATE TABLE arcs (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE acts (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE chapters (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE scenes (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE beats (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
		CREATE TABLE stages (id TEXT PRIMARY KEY, projectId TEXT NOT NULL);
	`);
	return database;
}

function createDraft(projectId = 'proj-1'): OutlineDraft {
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: `outline-${projectId}`,
		projectId,
		slug: `outline-${projectId}`,
		title: 'Generated Outline',
		sourceContext: {
			summary: 'Characters, factions, and plot threads are ready.',
			includedDomains: ['characters', 'factions', 'plot-threads'],
			entityCounts: { characters: 3, factions: 1, plotThreads: 2 },
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
											conflict: 'The faction courier refuses to hand it over.',
											turn: 'The ledger contains the protagonist name.',
											outcome: 'The protagonist becomes implicated in the conspiracy.',
										},
										characterIds: [],
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

function routeParams(projectId = 'proj-1', key = 'checkpoint-1') {
	return {
		projectId,
		scope: 'pipeline',
		ownerId: OUTLINE_CHECKPOINT_OWNER_ID,
		key,
	};
}

function putRequest(body: unknown): Request {
	return new Request('http://localhost/api/db/project-metadata/proj-1/pipeline/outline/checkpoint-1', {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

async function putCheckpoint(
	body: unknown,
	projectId = 'proj-1',
	key = 'checkpoint-1',
): Promise<Response> {
	return putMetadata({
		params: routeParams(projectId, key),
		request: putRequest(body),
	} as Parameters<typeof putMetadata>[0]);
}

async function upsertCheckpoint(projectId = 'proj-1', key = 'checkpoint-1'): Promise<void> {
	const response = await putCheckpoint(
		{
			operation: 'upsert',
			value: {
				draft: createDraft(projectId),
				version: OUTLINE_DRAFT_SCHEMA_VERSION,
			},
		},
		projectId,
		key,
	);
	expect(response.status).toBe(200);
}

function countRows(table: string): number {
	const row = dbState.database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as {
		count: number;
	};
	return row.count;
}

function countHierarchyRows(): number {
	return ['arcs', 'acts', 'chapters', 'scenes', 'beats', 'stages'].reduce(
		(total, table) => total + countRows(table),
		0,
	);
}

describe('outline checkpoints through project metadata pipeline scope', () => {
	beforeEach(() => {
		dbState.database = createDb();
	});

	it('upserts an outline checkpoint without mutating hierarchy tables', async () => {
		const response = await putCheckpoint({
			operation: 'upsert',
			value: {
				draft: createDraft(),
				version: OUTLINE_DRAFT_SCHEMA_VERSION,
			},
		});

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			checkpoint: { id: string; lifecycle: string; ownerId: string };
		};
		expect(body.checkpoint).toMatchObject({
			id: 'checkpoint-1',
			lifecycle: 'draft',
			ownerId: OUTLINE_CHECKPOINT_OWNER_ID,
		});
		expect(countRows('project_metadata')).toBe(1);
		expect(countHierarchyRows()).toBe(0);
	});

	it('lists checkpoints only for the requested project and owner', async () => {
		await upsertCheckpoint('proj-1', 'checkpoint-1');
		await upsertCheckpoint('proj-2', 'checkpoint-2');

		const response = await listMetadata({
			params: {
				projectId: 'proj-1',
				scope: 'pipeline',
				ownerId: OUTLINE_CHECKPOINT_OWNER_ID,
			},
		} as Parameters<typeof listMetadata>[0]);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { data: Record<string, unknown> };
		expect(Object.keys(body.data)).toEqual(['checkpoint-1']);
		expect(body.data['checkpoint-1']).toMatchObject({ projectId: 'proj-1' });
	});

	it('moves a draft checkpoint to review', async () => {
		await upsertCheckpoint();

		const response = await putCheckpoint({
			operation: 'review',
			reviewer: 'qa',
			note: 'Ready for author review.',
		});

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			checkpoint: { lifecycle: string; review: { reviewer: string; note: string } };
		};
		expect(body.checkpoint.lifecycle).toBe('review');
		expect(body.checkpoint.review).toMatchObject({
			reviewer: 'qa',
			note: 'Ready for author review.',
		});
		expect(countHierarchyRows()).toBe(0);
	});

	it('rejects a checkpoint without mutating hierarchy tables', async () => {
		await upsertCheckpoint();
		await putCheckpoint({ operation: 'review', reviewer: 'qa' });

		const response = await putCheckpoint({
			operation: 'reject',
			rejectedBy: 'author',
			reason: 'The second act repeats the faction reveal.',
		});

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			checkpoint: { lifecycle: string; rejection: { reason: string } };
		};
		expect(body.checkpoint.lifecycle).toBe('rejected');
		expect(body.checkpoint.rejection.reason).toContain('second act');
		expect(countHierarchyRows()).toBe(0);
	});

	it('rejects unknown operations and malformed JSON bodies', async () => {
		const invalidOperation = await putCheckpoint({ operation: 'merge' });
		expect(invalidOperation.status).toBe(400);
		expect((await invalidOperation.json()) as { code: string }).toMatchObject({
			code: 'invalid_payload',
		});

		const malformed = await putMetadata({
			params: routeParams(),
			request: new Request('http://localhost/api/db/project-metadata/proj-1/pipeline/outline/checkpoint-1', {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: '{not-json',
			}),
		} as Parameters<typeof putMetadata>[0]);

		expect(malformed.status).toBe(400);
		expect((await malformed.json()) as { error: string }).toEqual({ error: 'invalid json' });
	});

	it('blocks generic metadata accept until the materialization route exists', async () => {
		await upsertCheckpoint();
		await putCheckpoint({ operation: 'review', reviewer: 'qa' });

		const response = await putCheckpoint({ operation: 'accept', acceptedBy: 'author' });

		expect(response.status).toBe(409);
		expect((await response.json()) as { code: string }).toMatchObject({
			code: 'invalid_transition',
		});
		expect(countHierarchyRows()).toBe(0);
	});
});
