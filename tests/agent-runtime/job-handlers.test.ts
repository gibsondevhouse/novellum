import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { MIGRATION_REGISTRY, runMigrations } from '$lib/server/db';
import {
	KNOWN_AGENT_JOB_TYPES,
	createAgentJobHandlerRegistry,
	createJobQueueRepository,
	createRunLedgerRepository,
	enqueueKnownAgentJob,
	isQueuedExecutionRequest,
} from '$lib/server/agent-runtime';

function createHarness() {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	const now = () => '2026-06-14T22:30:00.000Z';
	return {
		db,
		ledger: createRunLedgerRepository(db, { now }),
		queue: createJobQueueRepository(db, { now }),
	};
}

describe('agent runtime job handlers', () => {
	it('detects explicit queued execution requests', () => {
		expect(isQueuedExecutionRequest({ defer: true })).toBe(true);
		expect(isQueuedExecutionRequest({ executionMode: 'queued' })).toBe(true);
		expect(isQueuedExecutionRequest({ executionMode: 'direct' })).toBe(false);
		expect(isQueuedExecutionRequest({})).toBe(false);
	});

	it('registers and resolves handlers by job type', async () => {
		const registry = createAgentJobHandlerRegistry();
		registry.register(KNOWN_AGENT_JOB_TYPES.outlineGenerate, () => ({
			runStatus: 'waiting_for_review',
			resultArtifactId: 'artifact-1',
		}));

		expect(registry.has(KNOWN_AGENT_JOB_TYPES.outlineGenerate)).toBe(true);
		expect(registry.listJobTypes()).toEqual([KNOWN_AGENT_JOB_TYPES.outlineGenerate]);
		expect(registry.get(KNOWN_AGENT_JOB_TYPES.outlineGenerate)?.({} as never)).toEqual({
			runStatus: 'waiting_for_review',
			resultArtifactId: 'artifact-1',
		});
	});

	it('enqueues a known agent job with a linked pending run', () => {
		const { db, ledger, queue } = createHarness();
		try {
			const result = enqueueKnownAgentJob(
				{
					jobType: KNOWN_AGENT_JOB_TYPES.authorDraftGenerate,
					projectId: 'project-1',
					family: 'author-draft',
					entrypoint: 'author-draft.generate',
					targetKind: 'scene',
					targetId: 'scene-1',
					targetJson: { sceneId: 'scene-1' },
					payloadRedactedJson: { projectId: 'project-1', sceneId: 'scene-1' },
					priority: 30,
					maxAttempts: 2,
				},
				{ ledger, queue },
			);

			expect(result.queued).toBe(true);
			expect(result.run).toMatchObject({
				projectId: 'project-1',
				family: 'author-draft',
				entrypoint: 'author-draft.generate',
				status: 'pending',
				targetKind: 'scene',
				targetId: 'scene-1',
			});
			expect(result.job).toMatchObject({
				runId: result.run.id,
				projectId: 'project-1',
				jobType: KNOWN_AGENT_JOB_TYPES.authorDraftGenerate,
				status: 'queued',
				priority: 30,
				maxAttempts: 2,
				payloadRedactedJson: { projectId: 'project-1', sceneId: 'scene-1' },
			});
		} finally {
			db.close();
		}
	});
});
