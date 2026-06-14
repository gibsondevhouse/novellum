import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { db as defaultDb } from '$lib/server/db/index.js';
import { toRedactedJson } from './redaction.js';
import { AGENT_JOB_STATUSES, type AgentJobRecord, type AgentJobStatus } from './types.js';

export type AgentJobQueueErrorCode =
	| 'job_not_found'
	| 'invalid_job_status'
	| 'claim_conflict';

export class AgentJobQueueError extends Error {
	readonly code: AgentJobQueueErrorCode;

	constructor(code: AgentJobQueueErrorCode, message: string) {
		super(message);
		this.name = 'AgentJobQueueError';
		this.code = code;
	}
}

export interface JobQueueOptions {
	now?: () => string;
	createId?: () => string;
}

export interface EnqueueJobInput {
	id?: string;
	runId?: string | null;
	projectId?: string | null;
	jobType: string;
	priority?: number;
	runAfter?: string | null;
	payload?: unknown;
	payloadRedactedJson?: unknown;
	payloadHash?: string;
	maxAttempts?: number;
	retryOfJobId?: string | null;
}

export interface ClaimNextJobInput {
	workerId: string;
	leaseMs?: number;
	jobTypes?: string[];
	projectId?: string;
}

export interface HeartbeatJobInput {
	workerId: string;
	leaseMs?: number;
	progressCurrent?: number;
	progressTotal?: number;
	progressLabel?: string;
}

export interface ReleaseJobInput {
	workerId: string;
	runAfter?: string | null;
}

export interface CancelJobInput {
	errorCode?: string;
	errorMessageRedacted?: string;
}

export interface FailJobInput {
	errorCode: string;
	errorMessageRedacted?: string;
	retryable?: boolean;
	retryDelayMs?: number;
}

export interface CompleteJobInput {
	resultArtifactId?: string | null;
	progressCurrent?: number;
	progressTotal?: number;
	progressLabel?: string;
}

export interface ScheduleRetryInput {
	runAfter?: string | null;
	errorCode?: string;
	errorMessageRedacted?: string;
}

export interface ListJobsFilter {
	projectId?: string;
	runId?: string;
	jobType?: string;
	status?: AgentJobStatus;
	limit?: number;
}

export interface JobQueueRepository {
	enqueueJob(input: EnqueueJobInput): AgentJobRecord;
	getJob(id: string): AgentJobRecord | null;
	listJobs(filter?: ListJobsFilter): AgentJobRecord[];
	claimNextJob(input: ClaimNextJobInput): AgentJobRecord | null;
	heartbeatJob(id: string, input: HeartbeatJobInput): AgentJobRecord;
	releaseJob(id: string, input: ReleaseJobInput): AgentJobRecord;
	cancelJob(id: string, input?: CancelJobInput): AgentJobRecord;
	failJob(id: string, input: FailJobInput): AgentJobRecord;
	completeJob(id: string, input?: CompleteJobInput): AgentJobRecord;
	scheduleRetry(id: string, input?: ScheduleRetryInput): AgentJobRecord;
	recoverStaleClaims(expiredBefore?: string): number;
}

const JOB_STATUS_SET = new Set<string>(AGENT_JOB_STATUSES);

function assertJobStatus(status: string): asserts status is AgentJobStatus {
	if (!JOB_STATUS_SET.has(status)) {
		throw new AgentJobQueueError('invalid_job_status', `Unknown agent job status "${status}".`);
	}
}

function parseJson(raw: unknown): unknown {
	if (raw == null || raw === '') return {};
	if (typeof raw !== 'string') return raw;
	try {
		return JSON.parse(raw);
	} catch {
		return raw;
	}
}

function toSqlJson(raw: unknown, redacted: unknown): string {
	if (redacted !== undefined) {
		return typeof redacted === 'string' ? redacted : JSON.stringify(redacted ?? {});
	}
	if (raw !== undefined) {
		return toRedactedJson(raw).json;
	}
	return '{}';
}

function addMilliseconds(iso: string, ms: number): string {
	return new Date(new Date(iso).getTime() + ms).toISOString();
}

function clampLimit(limit: number | undefined): number {
	if (!limit || !Number.isFinite(limit)) return 50;
	return Math.max(1, Math.min(200, Math.floor(limit)));
}

function mapJob(row: Record<string, unknown>): AgentJobRecord {
	const status = String(row.status);
	assertJobStatus(status);
	return {
		id: String(row.id),
		runId: row.runId == null ? null : String(row.runId),
		projectId: row.projectId == null ? null : String(row.projectId),
		jobType: String(row.jobType),
		status,
		priority: Number(row.priority ?? 0),
		runAfter: row.runAfter == null ? null : String(row.runAfter),
		lockedAt: row.lockedAt == null ? null : String(row.lockedAt),
		lockedBy: String(row.lockedBy ?? ''),
		lockExpiresAt: row.lockExpiresAt == null ? null : String(row.lockExpiresAt),
		heartbeatAt: row.heartbeatAt == null ? null : String(row.heartbeatAt),
		attempt: Number(row.attempt ?? 0),
		maxAttempts: Number(row.maxAttempts ?? 1),
		retryOfJobId: row.retryOfJobId == null ? null : String(row.retryOfJobId),
		payloadRedactedJson: parseJson(row.payloadRedactedJson),
		payloadHash: String(row.payloadHash ?? ''),
		resultArtifactId: row.resultArtifactId == null ? null : String(row.resultArtifactId),
		progressCurrent: Number(row.progressCurrent ?? 0),
		progressTotal: Number(row.progressTotal ?? 0),
		progressLabel: String(row.progressLabel ?? ''),
		startedAt: row.startedAt == null ? null : String(row.startedAt),
		completedAt: row.completedAt == null ? null : String(row.completedAt),
		cancelledAt: row.cancelledAt == null ? null : String(row.cancelledAt),
		errorCode: String(row.errorCode ?? ''),
		errorMessageRedacted: String(row.errorMessageRedacted ?? ''),
		createdAt: String(row.createdAt),
		updatedAt: String(row.updatedAt),
	};
}

class SqliteJobQueueRepository implements JobQueueRepository {
	private readonly database: Database.Database;
	private readonly now: () => string;
	private readonly createId: () => string;

	constructor(database: Database.Database, options: JobQueueOptions = {}) {
		this.database = database;
		this.now = options.now ?? (() => new Date().toISOString());
		this.createId = options.createId ?? (() => randomUUID());
	}

	enqueueJob(input: EnqueueJobInput): AgentJobRecord {
		const now = this.now();
		const record = {
			id: input.id ?? this.createId(),
			runId: input.runId ?? null,
			projectId: input.projectId ?? null,
			jobType: input.jobType,
			status: 'queued' satisfies AgentJobStatus,
			priority: input.priority ?? 0,
			runAfter: input.runAfter ?? null,
			lockedAt: null,
			lockedBy: '',
			lockExpiresAt: null,
			heartbeatAt: null,
			attempt: 0,
			maxAttempts: input.maxAttempts ?? 1,
			retryOfJobId: input.retryOfJobId ?? null,
			payloadRedactedJson: toSqlJson(input.payload, input.payloadRedactedJson),
			payloadHash: input.payloadHash ?? '',
			resultArtifactId: null,
			progressCurrent: 0,
			progressTotal: 0,
			progressLabel: '',
			startedAt: null,
			completedAt: null,
			cancelledAt: null,
			errorCode: '',
			errorMessageRedacted: '',
			createdAt: now,
			updatedAt: now,
		};
		this.database
			.prepare(
				`INSERT INTO agent_jobs (
					id, runId, projectId, jobType, status, priority, runAfter, lockedAt, lockedBy,
					lockExpiresAt, heartbeatAt, attempt, maxAttempts, retryOfJobId, payloadRedactedJson,
					payloadHash, resultArtifactId, progressCurrent, progressTotal, progressLabel,
					startedAt, completedAt, cancelledAt, errorCode, errorMessageRedacted, createdAt, updatedAt
				) VALUES (
					@id, @runId, @projectId, @jobType, @status, @priority, @runAfter, @lockedAt, @lockedBy,
					@lockExpiresAt, @heartbeatAt, @attempt, @maxAttempts, @retryOfJobId, @payloadRedactedJson,
					@payloadHash, @resultArtifactId, @progressCurrent, @progressTotal, @progressLabel,
					@startedAt, @completedAt, @cancelledAt, @errorCode, @errorMessageRedacted, @createdAt, @updatedAt
				)`,
			)
			.run(record);
		return this.requireJob(record.id);
	}

	getJob(id: string): AgentJobRecord | null {
		const row = this.database.prepare('SELECT * FROM agent_jobs WHERE id = ?').get(id) as
			| Record<string, unknown>
			| undefined;
		return row ? mapJob(row) : null;
	}

	listJobs(filter: ListJobsFilter = {}): AgentJobRecord[] {
		if (filter.status) assertJobStatus(filter.status);
		const conditions: string[] = [];
		const params: unknown[] = [];
		if (filter.projectId) {
			conditions.push('projectId = ?');
			params.push(filter.projectId);
		}
		if (filter.runId) {
			conditions.push('runId = ?');
			params.push(filter.runId);
		}
		if (filter.jobType) {
			conditions.push('jobType = ?');
			params.push(filter.jobType);
		}
		if (filter.status) {
			conditions.push('status = ?');
			params.push(filter.status);
		}
		const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
		params.push(clampLimit(filter.limit));
		return this.database
			.prepare(`SELECT * FROM agent_jobs ${where} ORDER BY priority DESC, createdAt ASC LIMIT ?`)
			.all(...params)
			.map((row) => mapJob(row as Record<string, unknown>));
	}

	claimNextJob(input: ClaimNextJobInput): AgentJobRecord | null {
		const now = this.now();
		const lockExpiresAt = addMilliseconds(now, input.leaseMs ?? 60_000);
		const jobTypes = input.jobTypes?.filter(Boolean) ?? [];
		return this.immediateTransaction(() => {
			const params: unknown[] = [now, now];
			const clauses = [
				`(
					(status IN ('queued', 'retry_scheduled') AND (runAfter IS NULL OR runAfter <= ?))
					OR (status = 'running' AND lockExpiresAt IS NOT NULL AND lockExpiresAt < ?)
				)`,
			];
			if (jobTypes.length > 0) {
				clauses.push(`jobType IN (${jobTypes.map(() => '?').join(', ')})`);
				params.push(...jobTypes);
			}
			if (input.projectId) {
				clauses.push('projectId = ?');
				params.push(input.projectId);
			}
			const candidate = this.database
				.prepare(
					`SELECT * FROM agent_jobs
					 WHERE ${clauses.join(' AND ')}
					 ORDER BY priority DESC, COALESCE(runAfter, createdAt) ASC, createdAt ASC
					 LIMIT 1`,
				)
				.get(...params) as Record<string, unknown> | undefined;

			if (!candidate) return null;

			this.database
				.prepare(
					`UPDATE agent_jobs
					 SET status = 'running',
						 lockedAt = @now,
						 lockedBy = @workerId,
						 lockExpiresAt = @lockExpiresAt,
						 heartbeatAt = @now,
						 startedAt = COALESCE(startedAt, @now),
						 attempt = attempt + 1,
						 updatedAt = @now
					 WHERE id = @id`,
				)
				.run({
					id: String(candidate.id),
					now,
					workerId: input.workerId,
					lockExpiresAt,
				});

			return this.requireJob(String(candidate.id));
		});
	}

	heartbeatJob(id: string, input: HeartbeatJobInput): AgentJobRecord {
		const now = this.now();
		const result = this.database
			.prepare(
				`UPDATE agent_jobs
				 SET heartbeatAt = @now,
					 lockExpiresAt = @lockExpiresAt,
					 progressCurrent = COALESCE(@progressCurrent, progressCurrent),
					 progressTotal = COALESCE(@progressTotal, progressTotal),
					 progressLabel = COALESCE(@progressLabel, progressLabel),
					 updatedAt = @now
				 WHERE id = @id AND status = 'running' AND lockedBy = @workerId`,
			)
			.run({
				id,
				workerId: input.workerId,
				now,
				lockExpiresAt: addMilliseconds(now, input.leaseMs ?? 60_000),
				progressCurrent: input.progressCurrent ?? null,
				progressTotal: input.progressTotal ?? null,
				progressLabel: input.progressLabel ?? null,
			});
		if (result.changes === 0) {
			throw new AgentJobQueueError(
				'claim_conflict',
				`Job "${id}" is not currently claimed by worker "${input.workerId}".`,
			);
		}
		return this.requireJob(id);
	}

	releaseJob(id: string, input: ReleaseJobInput): AgentJobRecord {
		const now = this.now();
		const result = this.database
			.prepare(
				`UPDATE agent_jobs
				 SET status = 'queued',
					 runAfter = @runAfter,
					 lockedAt = NULL,
					 lockedBy = '',
					 lockExpiresAt = NULL,
					 heartbeatAt = NULL,
					 updatedAt = @now
				 WHERE id = @id AND status = 'running' AND lockedBy = @workerId`,
			)
			.run({
				id,
				workerId: input.workerId,
				runAfter: input.runAfter ?? now,
				now,
			});
		if (result.changes === 0) {
			throw new AgentJobQueueError(
				'claim_conflict',
				`Job "${id}" is not currently claimed by worker "${input.workerId}".`,
			);
		}
		return this.requireJob(id);
	}

	cancelJob(id: string, input: CancelJobInput = {}): AgentJobRecord {
		const now = this.now();
		this.requireJob(id);
		this.database
			.prepare(
				`UPDATE agent_jobs
				 SET status = 'cancelled',
					 lockedAt = NULL,
					 lockedBy = '',
					 lockExpiresAt = NULL,
					 heartbeatAt = NULL,
					 cancelledAt = @now,
					 errorCode = @errorCode,
					 errorMessageRedacted = @errorMessageRedacted,
					 updatedAt = @now
				 WHERE id = @id`,
			)
			.run({
				id,
				now,
				errorCode: input.errorCode ?? '',
				errorMessageRedacted: input.errorMessageRedacted ?? '',
			});
		return this.requireJob(id);
	}

	failJob(id: string, input: FailJobInput): AgentJobRecord {
		const job = this.requireJob(id);
		const now = this.now();
		const canRetry = Boolean(input.retryable && job.attempt < job.maxAttempts);
		if (canRetry) {
			const runAfter = addMilliseconds(now, input.retryDelayMs ?? 0);
			this.database
				.prepare(
					`UPDATE agent_jobs
					 SET status = 'retry_scheduled',
						 runAfter = @runAfter,
						 lockedAt = NULL,
						 lockedBy = '',
						 lockExpiresAt = NULL,
						 heartbeatAt = NULL,
						 errorCode = @errorCode,
						 errorMessageRedacted = @errorMessageRedacted,
						 updatedAt = @now
					 WHERE id = @id`,
				)
				.run({
					id,
					runAfter,
					errorCode: input.errorCode,
					errorMessageRedacted: input.errorMessageRedacted ?? '',
					now,
				});
		} else {
			this.database
				.prepare(
					`UPDATE agent_jobs
					 SET status = 'failed',
						 lockedAt = NULL,
						 lockedBy = '',
						 lockExpiresAt = NULL,
						 heartbeatAt = NULL,
						 completedAt = @now,
						 errorCode = @errorCode,
						 errorMessageRedacted = @errorMessageRedacted,
						 updatedAt = @now
					 WHERE id = @id`,
				)
				.run({
					id,
					errorCode: input.errorCode,
					errorMessageRedacted: input.errorMessageRedacted ?? '',
					now,
				});
		}
		return this.requireJob(id);
	}

	completeJob(id: string, input: CompleteJobInput = {}): AgentJobRecord {
		const now = this.now();
		this.requireJob(id);
		this.database
			.prepare(
				`UPDATE agent_jobs
				 SET status = 'completed',
					 lockedAt = NULL,
					 lockedBy = '',
					 lockExpiresAt = NULL,
					 heartbeatAt = NULL,
					 completedAt = @now,
					 resultArtifactId = COALESCE(@resultArtifactId, resultArtifactId),
					 progressCurrent = COALESCE(@progressCurrent, progressCurrent),
					 progressTotal = COALESCE(@progressTotal, progressTotal),
					 progressLabel = COALESCE(@progressLabel, progressLabel),
					 updatedAt = @now
				 WHERE id = @id`,
			)
			.run({
				id,
				now,
				resultArtifactId: input.resultArtifactId ?? null,
				progressCurrent: input.progressCurrent ?? null,
				progressTotal: input.progressTotal ?? null,
				progressLabel: input.progressLabel ?? null,
			});
		return this.requireJob(id);
	}

	scheduleRetry(id: string, input: ScheduleRetryInput = {}): AgentJobRecord {
		const now = this.now();
		this.requireJob(id);
		this.database
			.prepare(
				`UPDATE agent_jobs
				 SET status = 'retry_scheduled',
					 runAfter = @runAfter,
					 lockedAt = NULL,
					 lockedBy = '',
					 lockExpiresAt = NULL,
					 heartbeatAt = NULL,
					 errorCode = @errorCode,
					 errorMessageRedacted = @errorMessageRedacted,
					 updatedAt = @now
				 WHERE id = @id`,
			)
			.run({
				id,
				runAfter: input.runAfter ?? now,
				errorCode: input.errorCode ?? '',
				errorMessageRedacted: input.errorMessageRedacted ?? '',
				now,
			});
		return this.requireJob(id);
	}

	recoverStaleClaims(expiredBefore: string = this.now()): number {
		const result = this.database
			.prepare(
				`UPDATE agent_jobs
				 SET status = 'queued',
					 lockedAt = NULL,
					 lockedBy = '',
					 lockExpiresAt = NULL,
					 heartbeatAt = NULL,
					 updatedAt = @now
				 WHERE status = 'running' AND lockExpiresAt IS NOT NULL AND lockExpiresAt < @expiredBefore`,
			)
			.run({ expiredBefore, now: this.now() });
		return result.changes;
	}

	private requireJob(id: string): AgentJobRecord {
		const job = this.getJob(id);
		if (!job) {
			throw new AgentJobQueueError('job_not_found', `Agent job "${id}" was not found.`);
		}
		return job;
	}

	private immediateTransaction<T>(fn: () => T): T {
		this.database.exec('BEGIN IMMEDIATE');
		try {
			const result = fn();
			this.database.exec('COMMIT');
			return result;
		} catch (err) {
			try {
				this.database.exec('ROLLBACK');
			} catch {
				// Best-effort rollback; keep the original failure.
			}
			throw err;
		}
	}
}

export function createJobQueueRepository(
	database: Database.Database = defaultDb,
	options: JobQueueOptions = {},
): JobQueueRepository {
	return new SqliteJobQueueRepository(database, options);
}
