import {
	createAgentJobHandlerRegistry,
	type AgentJobHandlerRegistry,
	type AgentJobHandlerResult,
} from './job-handlers.js';
import {
	AgentJobQueueError,
	createJobQueueRepository,
	type JobQueueRepository,
} from './job-queue.js';
import {
	AgentRunLedgerError,
	createRunLedgerRepository,
	type RunLedgerRepository,
} from './run-ledger.js';
import type { AgentJobRecord, AgentRunRecord, AgentRunStatus } from './types.js';

export type AgentWorkerErrorCode =
	| 'handler_not_found'
	| 'run_not_found'
	| 'run_not_retryable'
	| 'job_claim_conflict'
	| 'worker_aborted';

export class AgentWorkerError extends Error {
	readonly code: AgentWorkerErrorCode;

	constructor(code: AgentWorkerErrorCode, message: string) {
		super(message);
		this.name = 'AgentWorkerError';
		this.code = code;
	}
}

export class AgentWorkerRetryableError extends Error {
	readonly code: string;

	constructor(code: string, message: string) {
		super(message);
		this.name = 'AgentWorkerRetryableError';
		this.code = code;
	}
}

export class AgentWorkerCancelledError extends Error {
	constructor(message = 'Worker execution was cancelled.') {
		super(message);
		this.name = 'AgentWorkerCancelledError';
	}
}

export interface AgentRuntimeWorkerOptions {
	workerId?: string;
	leaseMs?: number;
	retryDelayMs?: number;
	queue?: JobQueueRepository;
	ledger?: RunLedgerRepository;
	handlers?: AgentJobHandlerRegistry;
}

export interface RunNextJobInput {
	jobTypes?: string[];
	projectId?: string;
	signal?: AbortSignal;
}

export type RunNextJobResult =
	| { status: 'idle' }
	| { status: 'completed'; job: AgentJobRecord; run: AgentRunRecord | null }
	| { status: 'waiting_for_review'; job: AgentJobRecord; run: AgentRunRecord | null }
	| { status: 'retry_scheduled'; job: AgentJobRecord; run: AgentRunRecord | null }
	| { status: 'failed'; job: AgentJobRecord; run: AgentRunRecord | null }
	| { status: 'cancelled'; job: AgentJobRecord; run: AgentRunRecord | null };

export interface CancelRunResult {
	run: AgentRunRecord;
	jobs: AgentJobRecord[];
}

export interface RetryRunResult {
	run: AgentRunRecord;
	job: AgentJobRecord;
	sourceRun: AgentRunRecord;
}

const NON_RETRYABLE_RUN_STATUSES = new Set<AgentRunStatus>([
	'pending',
	'running',
	'retrying',
	'waiting_for_review',
	'completed',
]);

function isTerminalRunStatus(status: AgentRunStatus): boolean {
	return status === 'completed' || status === 'failed' || status === 'cancelled' || status === 'expired';
}

function errorCodeFor(err: unknown): string {
	if (err instanceof AgentWorkerRetryableError) return err.code;
	if (err instanceof AgentWorkerCancelledError) return 'worker_cancelled';
	if (err instanceof AgentWorkerError) return err.code;
	if (err instanceof AgentRunLedgerError) return err.code;
	if (err instanceof AgentJobQueueError) return err.code;
	return 'worker_error';
}

function messageFor(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

function canTransition(run: AgentRunRecord | null, nextStatus: AgentRunStatus): boolean {
	if (!run) return false;
	if (run.status === nextStatus) return true;
	if (isTerminalRunStatus(run.status)) return false;
	return true;
}

export class AgentRuntimeWorker {
	private readonly workerId: string;
	private readonly leaseMs: number;
	private readonly retryDelayMs: number;
	private readonly queue: JobQueueRepository;
	private readonly ledger: RunLedgerRepository;
	private readonly handlers: AgentJobHandlerRegistry;

	constructor(options: AgentRuntimeWorkerOptions = {}) {
		this.workerId = options.workerId ?? 'local-worker';
		this.leaseMs = options.leaseMs ?? 60_000;
		this.retryDelayMs = options.retryDelayMs ?? 5_000;
		this.queue = options.queue ?? createJobQueueRepository();
		this.ledger = options.ledger ?? createRunLedgerRepository();
		this.handlers = options.handlers ?? createAgentJobHandlerRegistry();
	}

	async runNextJob(input: RunNextJobInput = {}): Promise<RunNextJobResult> {
		const claimed = this.queue.claimNextJob({
			workerId: this.workerId,
			leaseMs: this.leaseMs,
			jobTypes: input.jobTypes,
			projectId: input.projectId,
		});
		if (!claimed) return { status: 'idle' };

		const run = claimed.runId ? this.ledger.getRun(claimed.runId) : null;
		if (claimed.runId && !run) {
			return this.failClaimedJob(claimed, null, new AgentWorkerError('run_not_found', `Run "${claimed.runId}" was not found.`));
		}

		if (input.signal?.aborted) {
			return this.cancelClaimedJob(claimed, run, new AgentWorkerCancelledError());
		}

		if (run && canTransition(run, 'running')) {
			this.ledger.transitionRun(run.id, 'running', { statusReason: 'Worker claimed job.' });
		}

		const handler = this.handlers.get(claimed.jobType);
		if (!handler) {
			return this.failClaimedJob(
				claimed,
				run,
				new AgentWorkerError('handler_not_found', `No handler is registered for job type "${claimed.jobType}".`),
			);
		}

		try {
			const result = await handler({
				job: claimed,
				run,
				payload: claimed.payloadRedactedJson,
				ledger: this.ledger,
				queue: this.queue,
				signal: input.signal,
				heartbeat: (progress) =>
					this.queue.heartbeatJob(claimed.id, {
						workerId: this.workerId,
						leaseMs: this.leaseMs,
						progressCurrent: progress?.current,
						progressTotal: progress?.total,
						progressLabel: progress?.label,
					}),
			});
			return this.completeClaimedJob(claimed, run, result);
		} catch (err) {
			if (err instanceof AgentWorkerCancelledError || input.signal?.aborted) {
				return this.cancelClaimedJob(claimed, run, err);
			}
			return this.failClaimedJob(claimed, run, err);
		}
	}

	cancelRun(runId: string, reason = 'Cancelled by user.'): CancelRunResult {
		const details = this.ledger.getRunDetails(runId);
		if (!details) {
			throw new AgentWorkerError('run_not_found', `Run "${runId}" was not found.`);
		}

		const jobs = details.jobs
			.filter((job) => !['completed', 'failed', 'cancelled'].includes(job.status))
			.map((job) =>
				this.queue.cancelJob(job.id, {
					errorCode: 'user_cancelled',
					errorMessageRedacted: reason,
				}),
			);

		let run = details.run;
		if (canTransition(run, 'cancelled')) {
			run = this.ledger.transitionRun(run.id, 'cancelled', {
				statusReason: reason,
				errorCode: 'user_cancelled',
				errorMessageRedacted: reason,
			});
		}

		return { run, jobs };
	}

	retryRun(runId: string, runAfter?: string | null): RetryRunResult {
		const details = this.ledger.getRunDetails(runId);
		if (!details) {
			throw new AgentWorkerError('run_not_found', `Run "${runId}" was not found.`);
		}
		if (NON_RETRYABLE_RUN_STATUSES.has(details.run.status)) {
			throw new AgentWorkerError(
				'run_not_retryable',
				`Run "${runId}" cannot be retried from status "${details.run.status}".`,
			);
		}

		const sourceJob = details.jobs.at(-1) ?? null;
		const retryRun = this.ledger.createRun({
			projectId: details.run.projectId,
			family: details.run.family,
			entrypoint: details.run.entrypoint,
			status: 'pending',
			requestedBy: 'user',
			targetKind: details.run.targetKind,
			targetId: details.run.targetId,
			targetJson: details.run.targetJson,
			modelProvider: details.run.modelProvider,
			modelId: details.run.modelId,
			modelCapabilitySnapshotId: details.run.modelCapabilitySnapshotId,
			inputHash: details.run.inputHash,
			contextHash: details.run.contextHash,
			retryOfRunId: details.run.id,
			statusReason: 'Retry scheduled by user.',
		});
		const retryJob = this.queue.enqueueJob({
			runId: retryRun.id,
			projectId: retryRun.projectId,
			jobType: sourceJob?.jobType ?? retryRun.entrypoint,
			priority: sourceJob?.priority ?? 0,
			runAfter: runAfter ?? null,
			payloadRedactedJson: {
				retryOfRunId: details.run.id,
				retryOfJobId: sourceJob?.id ?? null,
				targetKind: retryRun.targetKind,
				targetId: retryRun.targetId,
			},
			maxAttempts: sourceJob?.maxAttempts ?? 3,
			retryOfJobId: sourceJob?.id ?? null,
		});

		return { run: retryRun, job: retryJob, sourceRun: details.run };
	}

	private completeClaimedJob(
		job: AgentJobRecord,
		run: AgentRunRecord | null,
		result: AgentJobHandlerResult,
	): RunNextJobResult {
		const runStatus = result.runStatus ?? 'completed';
		const completedJob = this.queue.completeJob(job.id, {
			resultArtifactId: result.resultArtifactId ?? null,
			progressCurrent: result.progressCurrent,
			progressTotal: result.progressTotal,
			progressLabel: result.progressLabel,
		});
		this.appendWorkerStep(job, run, 'completed', result.statusReason ?? 'Worker completed job.');
		const nextRun =
			run && canTransition(run, runStatus)
				? this.ledger.transitionRun(run.id, runStatus, {
						statusReason: result.statusReason ?? 'Worker completed job.',
					})
				: run;
		return {
			status: runStatus === 'waiting_for_review' ? 'waiting_for_review' : 'completed',
			job: completedJob,
			run: nextRun,
		};
	}

	private failClaimedJob(
		job: AgentJobRecord,
		run: AgentRunRecord | null,
		err: unknown,
	): RunNextJobResult {
		const code = errorCodeFor(err);
		const message = messageFor(err);
		const retryable = err instanceof AgentWorkerRetryableError;
		const failedJob = this.queue.failJob(job.id, {
			errorCode: code,
			errorMessageRedacted: message,
			retryable,
			retryDelayMs: this.retryDelayMs,
		});

		this.appendWorkerStep(job, run, failedJob.status, message, code);
		if (run) {
			this.ledger.captureError({
				runId: run.id,
				jobId: job.id,
				errorCode: code,
				errorKind: retryable ? 'retryable' : 'worker',
				errorMessageRedacted: message,
				retryable: failedJob.status === 'retry_scheduled',
				detailsRedactedJson: {
					jobId: job.id,
					jobType: job.jobType,
					workerId: this.workerId,
				},
			});
		}

		const nextRunStatus = failedJob.status === 'retry_scheduled' ? 'retrying' : 'failed';
		const nextRun =
			run && canTransition(run, nextRunStatus)
				? this.ledger.transitionRun(run.id, nextRunStatus, {
						statusReason: message,
						errorCode: code,
						errorMessageRedacted: message,
					})
				: run;
		return {
			status: failedJob.status === 'retry_scheduled' ? 'retry_scheduled' : 'failed',
			job: failedJob,
			run: nextRun,
		};
	}

	private cancelClaimedJob(
		job: AgentJobRecord,
		run: AgentRunRecord | null,
		err: unknown,
	): RunNextJobResult {
		const message = messageFor(err);
		const cancelledJob = this.queue.cancelJob(job.id, {
			errorCode: 'worker_cancelled',
			errorMessageRedacted: message,
		});
		this.appendWorkerStep(job, run, 'cancelled', message, 'worker_cancelled');
		const nextRun =
			run && canTransition(run, 'cancelled')
				? this.ledger.transitionRun(run.id, 'cancelled', {
						statusReason: message,
						errorCode: 'worker_cancelled',
						errorMessageRedacted: message,
					})
				: run;
		return { status: 'cancelled', job: cancelledJob, run: nextRun };
	}

	private appendWorkerStep(
		job: AgentJobRecord,
		run: AgentRunRecord | null,
		status: string,
		message: string,
		errorCode = '',
	): void {
		if (!run) return;
		this.ledger.appendStep({
			runId: run.id,
			kind: 'worker',
			status,
			source: job.jobType,
			artifactId: job.resultArtifactId,
			errorCode,
			errorMessageRedacted: errorCode ? message : '',
			completedAt: new Date().toISOString(),
		});
	}
}

export function createAgentRuntimeWorker(
	options: AgentRuntimeWorkerOptions = {},
): AgentRuntimeWorker {
	return new AgentRuntimeWorker(options);
}
