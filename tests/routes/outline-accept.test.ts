import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
	decodeJson(raw: string | number | null | undefined) {
		return JSON.parse(String(raw ?? '[]')) as unknown;
	},
}));

import { POST as acceptOutlineCheckpoint } from '../../src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.js';

const now = '2026-06-04T15:30:00.000Z';

function createDb(): Database.Database {
	const database = new Database(':memory:');
	database.exec(`
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
	database.prepare('INSERT INTO projects (id, title) VALUES (?, ?)').run('proj-1', 'Signal Fire');
	database.prepare('INSERT INTO projects (id, title) VALUES (?, ?)').run('proj-2', 'Wrong Book');
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
			contextHash: 'ctx-123',
			promptVersion: 'outline-generation-prompt.v1',
		},
		arcs: [
			{
				id: `arc-${projectId}`,
				slug: `arc-${projectId}`,
				title: 'Main Arc',
				order: 0,
				summary: 'The public conflict around the ledger.',
				purpose: 'Track the conspiracy reveal.',
				acts: [
					{
						id: `act-${projectId}`,
						slug: `act-${projectId}`,
						title: 'Act One',
						order: 0,
						summary: 'The ledger surfaces.',
						chapters: [
							{
								id: `chapter-${projectId}`,
								slug: `chapter-${projectId}`,
								title: 'Chapter One',
								order: 0,
								summary: 'A courier accepts the wrong job.',
								scenes: [
									{
										id: `scene-${projectId}`,
										slug: `scene-${projectId}`,
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

function createCheckpoint(
	lifecycle: OutlineDraftCheckpointRecord['lifecycle'] = 'review',
	projectId = 'proj-1',
	id = 'checkpoint-1',
): OutlineDraftCheckpointRecord {
	return {
		id,
		projectId,
		ownerId: OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
		taskKey: OUTLINE_DRAFT_TASK_KEY,
		version: OUTLINE_DRAFT_SCHEMA_VERSION,
		lifecycle,
		draft: createDraft(projectId),
		createdAt: now,
		updatedAt: now,
		review:
			lifecycle === 'review'
				? {
						reviewedAt: now,
						reviewer: 'outline-generation-route',
						note: 'Ready for review.',
					}
				: null,
		acceptance:
			lifecycle === 'accepted'
				? {
						acceptedAt: now,
						acceptedBy: 'author',
						note: '',
						projectionMode: 'atomic',
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
							arcIds: [`arc-${projectId}`],
						},
						sceneIntentPersisted: true,
					}
				: null,
		rejection:
			lifecycle === 'rejected'
				? {
						rejectedAt: now,
						rejectedBy: 'author',
						reason: 'Too much plot too early.',
					}
				: null,
	};
}

function insertCheckpoint(checkpoint: OutlineDraftCheckpointRecord): void {
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

function acceptRequest(body: unknown): Request {
	return new Request('http://localhost/api/outline/checkpoints/checkpoint-1/accept', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

function routeParams(checkpointId = 'checkpoint-1') {
	return { checkpointId };
}

async function postAccept(body: unknown, checkpointId = 'checkpoint-1'): Promise<Response> {
	return acceptOutlineCheckpoint({
		params: routeParams(checkpointId),
		request: acceptRequest(body),
	} as Parameters<typeof acceptOutlineCheckpoint>[0]);
}

function acceptBody(projectId = 'proj-1', extra: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		projectId,
		expectedUpdatedAt: now,
		expectedVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		...extra,
	};
}

function countRows(table: string, projectId = 'proj-1'): number {
	const row = dbState.database
		.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE projectId = ?`)
		.get(projectId) as { count: number };
	return row.count;
}

function countHierarchyRows(projectId = 'proj-1'): number {
	return ['arcs', 'acts', 'milestones', 'chapters', 'scenes', 'beats', 'stages'].reduce(
		(total, table) => total + countRows(table, projectId),
		0,
	);
}

function storedCheckpoint(
	projectId = 'proj-1',
	checkpointId = 'checkpoint-1',
): OutlineDraftCheckpointRecord {
	const row = dbState.database
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get(projectId, 'pipeline', OUTLINE_CHECKPOINT_OWNER_ID, checkpointId) as { value: string };
	return JSON.parse(row.value) as OutlineDraftCheckpointRecord;
}

function metadataValue(ownerId: string, key: string): Record<string, unknown> {
	const row = dbState.database
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get('proj-1', 'scene', ownerId, key) as { value: string };
	return JSON.parse(row.value) as Record<string, unknown>;
}

describe('POST /api/outline/checkpoints/[checkpointId]/accept', () => {
	beforeEach(() => {
		dbState.database = createDb();
	});

	it('materializes a review checkpoint and marks it accepted in one route call', async () => {
		insertCheckpoint(createCheckpoint('review'));

		const response = await postAccept(acceptBody('proj-1', {
			acceptedBy: ' author ',
			note: ' looks good ',
		}));

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			checkpoint: OutlineDraftCheckpointRecord;
			materialization: { counts: Record<string, number> };
		};
		expect(body.checkpoint.lifecycle).toBe('accepted');
		expect(body.checkpoint.acceptance).toMatchObject({
			acceptedBy: 'author',
			note: 'looks good',
			projectionMode: 'atomic',
			sceneIntentPersisted: true,
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
				arcIds: ['arc-proj-1'],
			},
		});
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
		expect(countRows('beats')).toBe(0);
		expect(countRows('stages')).toBe(0);
		expect(storedCheckpoint().lifecycle).toBe('accepted');
		expect(metadataValue('scene-proj-1', 'quickIntent')).toMatchObject({
			goal: 'Recover the missing ledger.',
			obstacle: 'The faction courier refuses to hand it over.',
			outcome: 'The protagonist becomes implicated in the conspiracy.',
		});
		expect(metadataValue('scene-proj-1', 'clarity')).toMatchObject({
			sceneGoal: 'Recover the missing ledger.',
			immediateObstacle: 'The faction courier refuses to hand it over.',
			turningPoint: 'The ledger contains the protagonist name.',
		});
	});

	it('blocks accept when existing hierarchy rows would be overwritten', async () => {
		insertCheckpoint(createCheckpoint('review'));
		dbState.database
			.prepare(
				`INSERT INTO arcs (id, projectId, title, description, purpose, arcType, status, "order", createdAt, updatedAt)
				 VALUES (?, ?, ?, '', '', NULL, 'planned', 0, ?, ?)`,
			)
			.run('existing-arc', 'proj-1', 'Existing Arc', now, now);

		const response = await postAccept(acceptBody());

		expect(response.status).toBe(409);
		const body = (await response.json()) as { code: string; meta: { counts: { arcs: number } } };
		expect(body.code).toBe('outline_conflict');
		expect(body.meta.counts.arcs).toBe(1);
		expect(storedCheckpoint().lifecycle).toBe('review');
		expect(countRows('arcs')).toBe(1);
	});

	it('rolls back hierarchy and scene metadata when the checkpoint update fails', async () => {
		insertCheckpoint(createCheckpoint('review', 'proj-1', 'checkpoint-rollback'));
		dbState.database.exec(`
			CREATE TRIGGER fail_outline_checkpoint_accept_update
			BEFORE UPDATE ON project_metadata
			WHEN NEW.scope = 'pipeline'
				AND NEW.ownerId = '${OUTLINE_CHECKPOINT_OWNER_ID}'
				AND NEW.key = 'checkpoint-rollback'
			BEGIN
				SELECT RAISE(FAIL, 'forced checkpoint update failure');
			END;
		`);

		const response = await postAccept(acceptBody(), 'checkpoint-rollback');

		expect(response.status).toBe(500);
		const body = (await response.json()) as { code: string; error: string };
		expect(body).toMatchObject({
			code: 'materialization_failed',
		});
		expect(JSON.stringify(body)).not.toContain('forced checkpoint update failure');
		expect(JSON.stringify(body)).not.toContain('SQLITE');
		expect(countHierarchyRows()).toBe(0);
		expect(countRows('project_metadata')).toBe(1);
		expect(storedCheckpoint('proj-1', 'checkpoint-rollback').lifecycle).toBe('review');
	});

	it('rejects non-review checkpoints and deleted projects without writing hierarchy rows', async () => {
		insertCheckpoint(createCheckpoint('draft'));
		const draftResponse = await postAccept(acceptBody());

		expect(draftResponse.status).toBe(409);
		expect((await draftResponse.json()) as { code: string }).toMatchObject({
			code: 'invalid_transition',
		});
		expect(countHierarchyRows()).toBe(0);

		dbState.database.prepare('DELETE FROM projects WHERE id = ?').run('proj-1');
		const deletedResponse = await postAccept(acceptBody());
		expect(deletedResponse.status).toBe(404);
		expect((await deletedResponse.json()) as { code: string }).toMatchObject({
			code: 'not_found',
		});
		expect(countHierarchyRows()).toBe(0);
	});
});

describe('outline accept source contract', () => {
	it('keeps client metadata helpers on HTTP routes instead of DB imports', () => {
		const source = readFileSync(resolve(process.cwd(), 'src/lib/project-metadata.ts'), 'utf-8');

		expect(source).toContain('/api/outline/checkpoints/');
		expect(source).not.toContain('$lib/server/db');
		expect(source).not.toContain('better-sqlite3');
	});
});
