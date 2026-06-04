import { beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	OUTLINE_DRAFT_TASK_KEY,
	type OutlineDraft,
	type OutlineDraftCheckpointRecord,
} from '../../src/lib/ai/pipeline/outline-draft-contract.js';
import { OUTLINE_CHECKPOINT_OWNER_ID } from '../../src/lib/ai/pipeline/outline-checkpoint-contract.js';

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

import { POST as acceptOutlineCheckpoint } from '../../src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.js';
import { PUT as putMetadata } from '../../src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.js';

const now = '2026-06-04T16:05:00.000Z';

function createDb(): Database.Database {
	const database = new Database(':memory:');
	database.exec(`
		CREATE TABLE projects (id TEXT PRIMARY KEY, title TEXT NOT NULL);
		CREATE TABLE project_metadata (
			projectId TEXT NOT NULL,
			scope TEXT NOT NULL,
			ownerId TEXT NOT NULL,
			key TEXT NOT NULL,
			value TEXT NOT NULL,
			updatedAt TEXT NOT NULL,
			PRIMARY KEY (projectId, scope, ownerId, key)
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
	database.prepare('INSERT INTO projects (id, title) VALUES (?, ?)').run('project-1', 'Signal Fire');
	return database;
}

function createDraft(): OutlineDraft {
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: 'outline-project-1',
		projectId: 'project-1',
		slug: 'outline-project-1',
		title: 'Generated Outline',
		sourceContext: {
			summary: 'Ready context.',
			includedDomains: ['characters'],
			entityCounts: { characters: 1 },
			contextHash: 'ctx-123',
			promptVersion: 'outline-generation-prompt.v1',
		},
		arcs: [
			{
				id: 'arc-project-1',
				slug: 'arc-project-1',
				title: 'Arc One',
				order: 0,
				summary: '',
				purpose: '',
				acts: [
					{
						id: 'act-project-1',
						slug: 'act-project-1',
						title: 'Act One',
						order: 0,
						summary: '',
						chapters: [
							{
								id: 'chapter-project-1',
								slug: 'chapter-project-1',
								title: 'Chapter One',
								order: 0,
								summary: '',
								scenes: [
									{
										id: 'scene-project-1',
										slug: 'scene-project-1',
										title: 'Scene One',
										order: 0,
										summary: '',
										intent: {
											goal: 'Recover the missing ledger.',
											conflict: 'The courier refuses to hand it over.',
											turn: 'The ledger names the protagonist.',
											outcome: 'The protagonist inherits the conspiracy.',
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

function createCheckpoint(id = 'checkpoint-1'): OutlineDraftCheckpointRecord {
	return {
		id,
		projectId: 'project-1',
		ownerId: OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
		taskKey: OUTLINE_DRAFT_TASK_KEY,
		version: OUTLINE_DRAFT_SCHEMA_VERSION,
		lifecycle: 'review',
		draft: createDraft(),
		createdAt: now,
		updatedAt: now,
		review: { reviewedAt: now, reviewer: 'outline-generation-route', note: 'Ready.' },
		acceptance: null,
		rejection: null,
	};
}

function insertCheckpoint(checkpoint = createCheckpoint()): void {
	dbState.database
		.prepare(
			`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
			 VALUES (?, ?, ?, ?, ?, ?)`,
		)
		.run(
			checkpoint.projectId,
			'pipeline',
			OUTLINE_CHECKPOINT_OWNER_ID,
			checkpoint.id,
			JSON.stringify(checkpoint),
			checkpoint.updatedAt,
		);
}

function acceptBody(extra: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		projectId: 'project-1',
		expectedUpdatedAt: now,
		expectedVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		...extra,
	};
}

async function postAccept(body: unknown, checkpointId = 'checkpoint-1'): Promise<Response> {
	return acceptOutlineCheckpoint({
		params: { checkpointId },
		request: new Request('http://localhost/api/outline/checkpoints/checkpoint-1/accept', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
		}),
	} as Parameters<typeof acceptOutlineCheckpoint>[0]);
}

async function putReject(reason: string): Promise<Response> {
	return putMetadata({
		params: {
			projectId: 'project-1',
			scope: 'pipeline',
			ownerId: OUTLINE_CHECKPOINT_OWNER_ID,
			key: 'checkpoint-1',
		},
		request: new Request('http://localhost/api/db/project-metadata/project-1/pipeline/outline/checkpoint-1', {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ operation: 'reject', rejectedBy: 'author', reason }),
		}),
	} as Parameters<typeof putMetadata>[0]);
}

function storedCheckpoint(): OutlineDraftCheckpointRecord {
	const row = dbState.database
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get('project-1', 'pipeline', OUTLINE_CHECKPOINT_OWNER_ID, 'checkpoint-1') as { value: string };
	return JSON.parse(row.value) as OutlineDraftCheckpointRecord;
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

describe('outline checkpoint stale guard and audit metadata', () => {
	beforeEach(() => {
		dbState.database = createDb();
	});

	it('rejects stale accept preconditions without materializing hierarchy', async () => {
		insertCheckpoint();

		const response = await postAccept(
			acceptBody({ expectedUpdatedAt: '2026-06-04T00:00:00.000Z' }),
		);

		expect(response.status).toBe(409);
		expect((await response.json()) as { code: string; meta: Record<string, unknown> }).toMatchObject({
			code: 'stale_checkpoint',
			meta: {
				expectedUpdatedAt: '2026-06-04T00:00:00.000Z',
				actualUpdatedAt: now,
			},
		});
		expect(storedCheckpoint().lifecycle).toBe('review');
		expect(countHierarchyRows()).toBe(0);
	});

	it('stores materialized counts and hierarchy root ids on accepted checkpoints', async () => {
		insertCheckpoint();

		const response = await postAccept(acceptBody({ acceptedBy: 'author', note: 'Ship it.' }));

		expect(response.status).toBe(200);
		const body = (await response.json()) as { checkpoint: OutlineDraftCheckpointRecord };
		expect(body.checkpoint.acceptance).toMatchObject({
			acceptedBy: 'author',
			note: 'Ship it.',
			materializedCounts: {
				arcs: 1,
				acts: 1,
				milestones: 1,
				chapters: 1,
				scenes: 1,
				beats: 0,
				stages: 0,
			},
			hierarchyRootIds: {
				arcIds: ['arc-project-1'],
			},
			sceneIntentPersisted: true,
		});
		expect(storedCheckpoint().acceptance?.hierarchyRootIds.arcIds).toEqual(['arc-project-1']);
	});

	it('stores reject audit reason and does not write hierarchy rows', async () => {
		insertCheckpoint();

		const response = await putReject(' Too much plot too early. ');

		expect(response.status).toBe(200);
		const body = (await response.json()) as { checkpoint: OutlineDraftCheckpointRecord };
		expect(body.checkpoint.lifecycle).toBe('rejected');
		expect(body.checkpoint.rejection).toMatchObject({
			rejectedBy: 'author',
			reason: 'Too much plot too early.',
		});
		expect(countHierarchyRows()).toBe(0);
	});
});
