import { describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { MIGRATION_REGISTRY, runMigrations } from '$lib/server/db';
import {
	createAiController,
	createControllerArtifactService,
	createControllerContextBuilder,
	createControllerRunLogger,
	createControllerWorkflowRegistry,
	type AiControllerRequest,
	type ControllerModelGateway,
} from '../../src/lib/server/ai/controller/index.js';

function harness() {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	db.prepare(
		`INSERT INTO projects (id, title, logline, synopsis, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?)`,
	).run(
		'project-1',
		'The Glass Archive',
		'A historian breaks a citywide memory monopoly.',
		'A compact synopsis.',
		'2026-06-15T00:00:00.000Z',
		'2026-06-15T00:00:00.000Z',
	);
	return db;
}

function request(actionId = 'worldbuilding.scan'): AiControllerRequest {
	return {
		requestId: 'request-1',
		projectId: 'project-1',
		requestedBy: 'user',
		action: { source: 'worldbuilding', id: actionId, instruction: 'Scan personae.' },
		target: { kind: 'worldbuilding_entity', id: 'personae', projectId: 'project-1' },
		createdAt: '2026-06-15T00:00:00.000Z',
	};
}

describe('AI controller orchestration', () => {
	it('runs a proposal workflow through policy, context, model, validation, artifact persistence, and logs', async () => {
		const db = harness();
		try {
			const registry = createControllerWorkflowRegistry();
			const modelGateway: ControllerModelGateway = {
				execute: vi.fn().mockResolvedValue({
					model: 'model-a',
					content: '{"proposals":[]}',
					finishReason: 'stop',
					usage: { totalTokens: 10 },
					mocked: true,
				}),
			};
			const controller = createAiController({
				contextBuilder: createControllerContextBuilder({
					db,
					now: () => '2026-06-15T12:00:00.000Z',
				}),
				workflowRegistry: registry,
				modelGateway,
				artifactService: createControllerArtifactService({
					db,
					now: () => '2026-06-15T12:00:00.000Z',
					createId: () => 'artifact-1',
				}),
				runLogger: createControllerRunLogger({
					db,
					now: () => '2026-06-15T12:00:00.000Z',
					createId: () => 'run-1',
				}),
			});

			const response = await controller.execute(request());

			expect(response).toMatchObject({
				ok: true,
				status: 'awaiting_review',
				artifact: {
					id: 'artifact-1',
					status: 'review',
				},
			});
			const artifactRow = db
				.prepare(
					`SELECT value FROM project_metadata
					 WHERE projectId = 'project-1' AND scope = 'pipeline' AND ownerId = 'aiControllerArtifacts.v1' AND key = 'artifact-1'`,
				)
				.get() as { value: string } | undefined;
			expect(artifactRow?.value).toContain('worldbuilding_proposals');
			const runRow = db
				.prepare(
					`SELECT value FROM project_metadata
					 WHERE projectId = 'project-1' AND scope = 'pipeline' AND ownerId = 'aiControllerRuns.v1' AND key = 'run-1'`,
				)
				.get() as { value: string } | undefined;
			expect(runRow?.value).toContain('awaiting_review');
		} finally {
			db.close();
		}
	});

	it('blocks unsupported controller actions before model execution', async () => {
		const db = harness();
		try {
			const modelGateway: ControllerModelGateway = { execute: vi.fn() };
			const controller = createAiController({
				contextBuilder: createControllerContextBuilder({ db }),
				workflowRegistry: createControllerWorkflowRegistry(),
				modelGateway,
				artifactService: createControllerArtifactService({ db }),
				runLogger: createControllerRunLogger({ db, createId: () => 'run-1' }),
			});

			const response = await controller.execute({
				...request('delete_everything'),
				action: { source: 'api', id: 'delete_everything' },
			});

			expect(response).toMatchObject({ ok: false, status: 'blocked' });
			expect(modelGateway.execute).not.toHaveBeenCalled();
		} finally {
			db.close();
		}
	});
});
