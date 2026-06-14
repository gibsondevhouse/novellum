import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { MIGRATION_REGISTRY, runMigrations } from '$lib/server/db';
import {
	AgentWorkerError,
	AgentWorkerRetryableError,
	KNOWN_AGENT_JOB_TYPES,
	createAgentJobHandlerRegistry,
	createAgentRuntimeWorker,
	createJobQueueRepository,
	createRunLedgerRepository,
	type JobQueueRepository,
	type RunLedgerRepository,
} from '$lib/server/agent-runtime';

function createHarness(): {
	db: Database.Database;
	ledger: RunLedgerRepository;
	queue: JobQueueRepository;
	setNow: (value: string) => void;
} {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	let current = '2026-06-14T22:40:00.000Z';
	let id = 0;
	return {
		db,
		ledger: createRunLedgerRepository(db, {
			now: () => current,
			createId: () => `run-generated-${++id}`,
		}),
		queue: createJobQueueRepository(db, {
			now: () => current,
			createId: () => `job-generated-${++id}`,
		}),
		setNow: (value: string) => {
			current = value;
		},
	};
}

describe('agent runtime worker', () => {
	it('runs a claimed job through completion and moves the run to review', async () => {
		const { db, ledger, queue } = createHarness();
		try {
			const run = ledger.createRun({
				id: 'run-1',
				projectId: 'project-1',
				family: 'outline',
				entrypoint: 'outline.generate',
			});
			queue.enqueueJob({
				id: 'job-1',
				runId: run.id,
				projectId: 'project-1',
				jobType: KNOWN_AGENT_JOB_TYPES.outlineGenerate,
				maxAttempts: 2,
			});
			const handlers = createAgentJobHandlerRegistry({
				[KNOWN_AGENT_JOB_TYPES.outlineGenerate]: ({ heartbeat }) => {
					heartbeat({ current: 1, total: 2, label: 'Generating outline' });
					return {
						runStatus: 'waiting_for_review',
						resultArtifactId: 'artifact-1',
						progressCurrent: 2,
						progressTotal: 2,
						progressLabel: 'Waiting for review',
						statusReason: 'Generated checkpoint requires review.',
					};
				},
			});

			const result = await createAgentRuntimeWorker({
				workerId: 'worker-a',
				ledger,
				queue,
				handlers,
			}).runNextJob();

			expect(result.status).toBe('waiting_for_review');
			if (result.status === 'idle') throw new Error('expected claimed job result');
			expect(result.job).toMatchObject({
				id: 'job-1',
				status: 'completed',
				resultArtifactId: 'artifact-1',
				progressCurrent: 2,
				progressTotal: 2,
			});
			expect(result.run).toMatchObject({
				id: 'run-1',
				status: 'waiting_for_review',
				statusReason: 'Generated checkpoint requires review.',
			});
			expect(ledger.getRunDetails('run-1')?.steps.at(-1)).toMatchObject({
				kind: 'worker',
				status: 'completed',
				source: KNOWN_AGENT_JOB_TYPES.outlineGenerate,
			});
		} finally {
			db.close();
		}
	});

	it('schedules retryable failures and records run errors', async () => {
		const { db, ledger, queue } = createHarness();
		try {
			const run = ledger.createRun({
				id: 'run-1',
				projectId: 'project-1',
				family: 'worldbuild',
				entrypoint: 'worldbuilding.scan',
			});
			queue.enqueueJob({
				id: 'job-1',
				runId: run.id,
				projectId: 'project-1',
				jobType: KNOWN_AGENT_JOB_TYPES.worldbuildingScan,
				maxAttempts: 2,
			});
			const handlers = createAgentJobHandlerRegistry({
				[KNOWN_AGENT_JOB_TYPES.worldbuildingScan]: () => {
					throw new AgentWorkerRetryableError('provider_timeout', 'Provider timed out.');
				},
			});

			const result = await createAgentRuntimeWorker({
				workerId: 'worker-a',
				ledger,
				queue,
				handlers,
				retryDelayMs: 5_000,
			}).runNextJob();

			expect(result.status).toBe('retry_scheduled');
			if (result.status === 'idle') throw new Error('expected claimed job result');
			expect(result.job).toMatchObject({
				status: 'retry_scheduled',
				errorCode: 'provider_timeout',
				runAfter: '2026-06-14T22:40:05.000Z',
			});
			expect(result.run).toMatchObject({
				status: 'retrying',
				errorCode: 'provider_timeout',
			});
			expect(ledger.getRunDetails('run-1')?.errors.at(-1)).toMatchObject({
				errorCode: 'provider_timeout',
				retryable: true,
			});
		} finally {
			db.close();
		}
	});

	it('cancels a claimed job when the worker signal is already aborted', async () => {
		const { db, ledger, queue } = createHarness();
		try {
			const run = ledger.createRun({ id: 'run-1', family: 'author-draft' });
			queue.enqueueJob({
				id: 'job-1',
				runId: run.id,
				jobType: KNOWN_AGENT_JOB_TYPES.authorDraftGenerate,
			});
			const handlers = createAgentJobHandlerRegistry({
				[KNOWN_AGENT_JOB_TYPES.authorDraftGenerate]: () => ({ runStatus: 'completed' }),
			});
			const controller = new AbortController();
			controller.abort();

			const result = await createAgentRuntimeWorker({
				workerId: 'worker-a',
				ledger,
				queue,
				handlers,
			}).runNextJob({ signal: controller.signal });

			expect(result.status).toBe('cancelled');
			if (result.status === 'idle') throw new Error('expected claimed job result');
			expect(result.job).toMatchObject({ status: 'cancelled', errorCode: 'worker_cancelled' });
			expect(result.run).toMatchObject({ status: 'cancelled', errorCode: 'worker_cancelled' });
		} finally {
			db.close();
		}
	});

	it('fails missing handlers deterministically', async () => {
		const { db, ledger, queue } = createHarness();
		try {
			const run = ledger.createRun({ id: 'run-1', family: 'outline' });
			queue.enqueueJob({
				id: 'job-1',
				runId: run.id,
				jobType: KNOWN_AGENT_JOB_TYPES.outlineGenerate,
			});

			const result = await createAgentRuntimeWorker({
				workerId: 'worker-a',
				ledger,
				queue,
			}).runNextJob();

			expect(result.status).toBe('failed');
			if (result.status === 'idle') throw new Error('expected claimed job result');
			expect(result.job).toMatchObject({ status: 'failed', errorCode: 'handler_not_found' });
			expect(result.run).toMatchObject({ status: 'failed', errorCode: 'handler_not_found' });
		} finally {
			db.close();
		}
	});

	it('cancels active jobs for a run', () => {
		const { db, ledger, queue } = createHarness();
		try {
			const run = ledger.createRun({ id: 'run-1', family: 'outline' });
			queue.enqueueJob({ id: 'job-1', runId: run.id, jobType: KNOWN_AGENT_JOB_TYPES.outlineGenerate });

			const result = createAgentRuntimeWorker({ ledger, queue }).cancelRun('run-1', 'Stop requested.');

			expect(result.run).toMatchObject({
				status: 'cancelled',
				statusReason: 'Stop requested.',
			});
			expect(result.jobs).toEqual([
				expect.objectContaining({
					id: 'job-1',
					status: 'cancelled',
					errorCode: 'user_cancelled',
				}),
			]);
		} finally {
			db.close();
		}
	});

	it('creates a new pending run and queued job when retrying a failed run', () => {
		const { db, ledger, queue, setNow } = createHarness();
		try {
			const run = ledger.createRun({
				id: 'run-1',
				projectId: 'project-1',
				family: 'outline',
				entrypoint: 'outline.generate',
				status: 'pending',
				targetKind: 'project',
				targetId: 'project-1',
			});
			queue.enqueueJob({
				id: 'job-1',
				runId: run.id,
				projectId: 'project-1',
				jobType: KNOWN_AGENT_JOB_TYPES.outlineGenerate,
				maxAttempts: 2,
			});
			ledger.transitionRun(run.id, 'running');
			ledger.transitionRun(run.id, 'failed', { errorCode: 'provider_error' });
			setNow('2026-06-14T22:45:00.000Z');

			const result = createAgentRuntimeWorker({ ledger, queue }).retryRun(
				'run-1',
				'2026-06-14T22:46:00.000Z',
			);

			expect(result.sourceRun.id).toBe('run-1');
			expect(result.run).toMatchObject({
				status: 'pending',
				retryOfRunId: 'run-1',
				entrypoint: 'outline.generate',
			});
			expect(result.job).toMatchObject({
				status: 'queued',
				jobType: KNOWN_AGENT_JOB_TYPES.outlineGenerate,
				retryOfJobId: 'job-1',
				runAfter: '2026-06-14T22:46:00.000Z',
			});
		} finally {
			db.close();
		}
	});

	it('rejects retry for non-terminal review-gated runs', () => {
		const { db, ledger, queue } = createHarness();
		try {
			const run = ledger.createRun({ id: 'run-1', family: 'outline' });
			queue.enqueueJob({ id: 'job-1', runId: run.id, jobType: KNOWN_AGENT_JOB_TYPES.outlineGenerate });

			expect(() => createAgentRuntimeWorker({ ledger, queue }).retryRun('run-1')).toThrow(
				AgentWorkerError,
			);
		} finally {
			db.close();
		}
	});
});
