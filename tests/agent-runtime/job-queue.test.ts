import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { MIGRATION_REGISTRY, runMigrations } from '$lib/server/db';
import {
	AgentJobQueueError,
	createJobQueueRepository,
	type JobQueueRepository,
} from '$lib/server/agent-runtime';

function plusMs(iso: string, ms: number): string {
	return new Date(new Date(iso).getTime() + ms).toISOString();
}

function createHarness(): {
	db: Database.Database;
	queue: JobQueueRepository;
	setNow: (value: string) => void;
} {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	let current = '2026-06-14T22:10:00.000Z';
	let id = 0;
	return {
		db,
		queue: createJobQueueRepository(db, {
			now: () => current,
			createId: () => `generated-${++id}`,
		}),
		setNow: (value: string) => {
			current = value;
		},
	};
}

describe('job queue repository', () => {
	it('enqueues, claims, heartbeats, releases, and reclaims a job atomically', () => {
		const { db, queue, setNow } = createHarness();
		try {
			const job = queue.enqueueJob({
				id: 'job-1',
				runId: 'run-1',
				projectId: 'project-1',
				jobType: 'outline.generate',
				priority: 10,
				payload: { projectId: 'project-1', content: 'draft text' },
				payloadHash: 'sha256:payload',
				maxAttempts: 3,
			});

			expect(job).toMatchObject({
				id: 'job-1',
				status: 'queued',
				attempt: 0,
				payloadRedactedJson: { projectId: 'project-1', content: '[redacted]' },
			});

			const claimed = queue.claimNextJob({
				workerId: 'worker-a',
				leaseMs: 1_000,
				jobTypes: ['outline.generate'],
			});

			expect(claimed).toMatchObject({
				id: 'job-1',
				status: 'running',
				lockedBy: 'worker-a',
				attempt: 1,
				heartbeatAt: '2026-06-14T22:10:00.000Z',
				lockExpiresAt: '2026-06-14T22:10:01.000Z',
			});
			expect(queue.claimNextJob({ workerId: 'worker-b', jobTypes: ['outline.generate'] })).toBeNull();

			setNow('2026-06-14T22:10:00.500Z');
			const heartbeat = queue.heartbeatJob('job-1', {
				workerId: 'worker-a',
				leaseMs: 2_000,
				progressCurrent: 1,
				progressTotal: 4,
				progressLabel: 'Context loaded',
			});
			expect(heartbeat).toMatchObject({
				status: 'running',
				progressCurrent: 1,
				progressTotal: 4,
				progressLabel: 'Context loaded',
				lockExpiresAt: '2026-06-14T22:10:02.500Z',
			});

			const released = queue.releaseJob('job-1', { workerId: 'worker-a' });
			expect(released).toMatchObject({
				status: 'queued',
				lockedBy: '',
				lockExpiresAt: null,
				heartbeatAt: null,
			});

			const reclaimed = queue.claimNextJob({
				workerId: 'worker-b',
				leaseMs: 1_000,
				jobTypes: ['outline.generate'],
			});
			expect(reclaimed).toMatchObject({ id: 'job-1', lockedBy: 'worker-b', attempt: 2 });
		} finally {
			db.close();
		}
	});

	it('lets a new worker reclaim stale running jobs', () => {
		const { db, queue, setNow } = createHarness();
		try {
			queue.enqueueJob({
				id: 'job-1',
				projectId: 'project-1',
				jobType: 'worldbuilding.scan',
				maxAttempts: 3,
			});
			const firstClaim = queue.claimNextJob({ workerId: 'worker-a', leaseMs: 1_000 });
			expect(firstClaim?.lockedBy).toBe('worker-a');

			setNow(plusMs('2026-06-14T22:10:00.000Z', 1_500));
			const staleClaim = queue.claimNextJob({ workerId: 'worker-b', leaseMs: 1_000 });

			expect(staleClaim).toMatchObject({
				id: 'job-1',
				status: 'running',
				lockedBy: 'worker-b',
				attempt: 2,
			});
		} finally {
			db.close();
		}
	});

	it('schedules retries and eventually fails when attempts are exhausted', () => {
		const { db, queue, setNow } = createHarness();
		try {
			queue.enqueueJob({
				id: 'job-1',
				jobType: 'author-draft.generate',
				maxAttempts: 2,
			});
			queue.claimNextJob({ workerId: 'worker-a', leaseMs: 1_000 });

			const retry = queue.failJob('job-1', {
				errorCode: 'provider_timeout',
				errorMessageRedacted: 'Provider timed out.',
				retryable: true,
				retryDelayMs: 5_000,
			});
			expect(retry).toMatchObject({
				status: 'retry_scheduled',
				errorCode: 'provider_timeout',
				runAfter: '2026-06-14T22:10:05.000Z',
				lockedBy: '',
			});
			expect(queue.claimNextJob({ workerId: 'worker-b' })).toBeNull();

			setNow('2026-06-14T22:10:06.000Z');
			const secondClaim = queue.claimNextJob({ workerId: 'worker-b', leaseMs: 1_000 });
			expect(secondClaim).toMatchObject({ attempt: 2, lockedBy: 'worker-b' });

			const failed = queue.failJob('job-1', {
				errorCode: 'provider_timeout',
				errorMessageRedacted: 'Provider timed out again.',
				retryable: true,
			});
			expect(failed).toMatchObject({
				status: 'failed',
				completedAt: '2026-06-14T22:10:06.000Z',
				errorMessageRedacted: 'Provider timed out again.',
			});
		} finally {
			db.close();
		}
	});

	it('cancels claimed jobs and completes jobs with result artifact links', () => {
		const { db, queue } = createHarness();
		try {
			queue.enqueueJob({ id: 'cancel-job', jobType: 'outline.generate' });
			queue.claimNextJob({ workerId: 'worker-a' });

			const cancelled = queue.cancelJob('cancel-job', {
				errorCode: 'user_cancelled',
				errorMessageRedacted: 'Cancelled by user.',
			});
			expect(cancelled).toMatchObject({
				status: 'cancelled',
				cancelledAt: '2026-06-14T22:10:00.000Z',
				lockedBy: '',
				errorCode: 'user_cancelled',
			});

			queue.enqueueJob({ id: 'complete-job', jobType: 'outline.generate' });
			queue.claimNextJob({ workerId: 'worker-b' });
			const completed = queue.completeJob('complete-job', {
				resultArtifactId: 'artifact-1',
				progressCurrent: 4,
				progressTotal: 4,
				progressLabel: 'Complete',
			});
			expect(completed).toMatchObject({
				status: 'completed',
				completedAt: '2026-06-14T22:10:00.000Z',
				resultArtifactId: 'artifact-1',
				progressCurrent: 4,
				progressTotal: 4,
			});
		} finally {
			db.close();
		}
	});

	it('recovers stale claims back to the queued state', () => {
		const { db, queue, setNow } = createHarness();
		try {
			queue.enqueueJob({ id: 'job-1', jobType: 'outline.generate' });
			queue.claimNextJob({ workerId: 'worker-a', leaseMs: 1_000 });

			setNow('2026-06-14T22:10:02.000Z');
			expect(queue.recoverStaleClaims()).toBe(1);

			const recovered = queue.getJob('job-1');
			expect(recovered).toMatchObject({
				status: 'queued',
				lockedBy: '',
				lockExpiresAt: null,
				heartbeatAt: null,
			});
		} finally {
			db.close();
		}
	});

	it('rejects heartbeat and release from the wrong worker', () => {
		const { db, queue } = createHarness();
		try {
			queue.enqueueJob({ id: 'job-1', jobType: 'outline.generate' });
			queue.claimNextJob({ workerId: 'worker-a' });

			expect(() => queue.heartbeatJob('job-1', { workerId: 'worker-b' })).toThrow(
				AgentJobQueueError,
			);
			expect(() => queue.releaseJob('job-1', { workerId: 'worker-b' })).toThrow(
				AgentJobQueueError,
			);
		} finally {
			db.close();
		}
	});
});
