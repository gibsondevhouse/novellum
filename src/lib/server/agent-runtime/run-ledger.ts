import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { db as defaultDb } from '$lib/server/db/index.js';
import { toRedactedJson } from './redaction.js';
import {
	AGENT_RUN_STATUSES,
	AGENT_JOB_STATUSES,
	type AgentArtifactRecord,
	type AgentJobRecord,
	type AgentJobStatus,
	type AgentRunDetails,
	type AgentRunErrorRecord,
	type AgentRunRecord,
	type AgentRunStatus,
	type AgentRunStepRecord,
	type AgentToolCallRecord,
	type AgentTraceEventRecord,
	type AgentTraceRedactionRecord,
	type AgentUsageRecord,
	type RuntimeRedaction,
} from './types.js';

export type AgentRunLedgerErrorCode =
	| 'run_not_found'
	| 'trace_event_not_found'
	| 'invalid_status'
	| 'invalid_transition';

export class AgentRunLedgerError extends Error {
	readonly code: AgentRunLedgerErrorCode;

	constructor(code: AgentRunLedgerErrorCode, message: string) {
		super(message);
		this.name = 'AgentRunLedgerError';
		this.code = code;
	}
}

export interface RunLedgerRepositoryOptions {
	now?: () => string;
	createId?: () => string;
}

export interface CreateRunInput {
	id?: string;
	projectId?: string | null;
	family: string;
	entrypoint?: string;
	status?: AgentRunStatus;
	requestedBy?: string;
	targetKind?: string;
	targetId?: string;
	modelProvider?: string;
	modelId?: string;
	modelCapabilitySnapshotId?: string | null;
	targetJson?: unknown;
	inputHash?: string;
	contextHash?: string;
	statusReason?: string;
	errorCode?: string;
	errorMessageRedacted?: string;
	retryOfRunId?: string | null;
	startedAt?: string | null;
	completedAt?: string | null;
	cancelledAt?: string | null;
}

export interface TransitionRunInput {
	statusReason?: string;
	errorCode?: string;
	errorMessageRedacted?: string;
	startedAt?: string | null;
	completedAt?: string | null;
	cancelledAt?: string | null;
}

export interface AppendStepInput {
	id?: string;
	runId: string;
	sequence?: number;
	parentStepId?: string | null;
	kind: string;
	status: string;
	source?: string;
	inputHash?: string;
	outputHash?: string;
	usageId?: string | null;
	artifactId?: string | null;
	errorCode?: string;
	errorMessageRedacted?: string;
	startedAt?: string | null;
	completedAt?: string | null;
	elapsedMs?: number;
}

export interface CaptureToolCallInput {
	id?: string;
	runId: string;
	stepId?: string | null;
	invocationId?: string;
	toolId: string;
	capability?: string;
	caller?: string;
	status: string;
	sourceStatus?: string;
	input?: unknown;
	output?: unknown;
	inputRedactedJson?: unknown;
	outputRedactedJson?: unknown;
	inputHash?: string;
	outputHash?: string;
	artifactId?: string | null;
	errorCode?: string;
	errorMessageRedacted?: string;
	startedAt?: string | null;
	completedAt?: string | null;
}

export interface LinkArtifactInput {
	id?: string;
	runId: string;
	stepId?: string | null;
	artifactType: string;
	reviewState?: string;
	storageKind?: string;
	storageProjectId?: string | null;
	storageOwnerId?: string | null;
	storageKey?: string;
	storageRefJson?: unknown;
	domainType?: string;
	domainId?: string;
	domainVersion?: string;
	schemaVersion?: string;
	summary?: string;
	contentHash?: string;
	sourceStatus?: string;
}

export interface RecordUsageInput {
	id?: string;
	runId: string;
	stepId?: string | null;
	providerId?: string;
	modelId?: string;
	usageKind?: string;
	promptChars?: number;
	completionChars?: number;
	estimatedPromptTokens?: number;
	estimatedCompletionTokens?: number;
	estimatedTotalTokens?: number;
	estimatedCostUsd?: number;
	providerPromptTokens?: number | null;
	providerCompletionTokens?: number | null;
	providerTotalTokens?: number | null;
	providerCostUsd?: number | null;
	finishReason?: string;
	usageConfidence?: string;
}

export interface CaptureErrorInput {
	id?: string;
	runId: string;
	stepId?: string | null;
	jobId?: string | null;
	errorCode: string;
	errorKind?: string;
	errorMessageRedacted?: string;
	retryable?: boolean;
	details?: unknown;
	detailsRedactedJson?: unknown;
}

export interface CreateJobInput {
	id?: string;
	runId?: string | null;
	projectId?: string | null;
	jobType: string;
	status: AgentJobStatus;
	priority?: number;
	runAfter?: string | null;
	lockedAt?: string | null;
	lockedBy?: string;
	lockExpiresAt?: string | null;
	heartbeatAt?: string | null;
	attempt?: number;
	maxAttempts?: number;
	retryOfJobId?: string | null;
	payload?: unknown;
	payloadRedactedJson?: unknown;
	payloadHash?: string;
	resultArtifactId?: string | null;
	progressCurrent?: number;
	progressTotal?: number;
	progressLabel?: string;
	startedAt?: string | null;
	completedAt?: string | null;
	cancelledAt?: string | null;
	errorCode?: string;
	errorMessageRedacted?: string;
}

export interface AppendTraceEventInput {
	id?: string;
	runId: string;
	stepId?: string | null;
	sequence?: number;
	eventType: string;
	severity?: string;
	message?: string;
	metadata?: unknown;
	metadataRedactedJson?: unknown;
	redactionState?: string;
}

export interface RedactTraceEventInput {
	metadata: unknown;
	reason?: string;
}

export interface ListRunsFilter {
	projectId?: string;
	status?: AgentRunStatus;
	family?: string;
	limit?: number;
}

export interface RunLedgerRepository {
	createRun(input: CreateRunInput): AgentRunRecord;
	getRun(id: string): AgentRunRecord | null;
	getRunDetails(id: string): AgentRunDetails | null;
	listRuns(filter?: ListRunsFilter): AgentRunRecord[];
	transitionRun(id: string, nextStatus: AgentRunStatus, input?: TransitionRunInput): AgentRunRecord;
	appendStep(input: AppendStepInput): AgentRunStepRecord;
	captureToolCall(input: CaptureToolCallInput): AgentToolCallRecord;
	linkArtifact(input: LinkArtifactInput): AgentArtifactRecord;
	recordUsage(input: RecordUsageInput): AgentUsageRecord;
	captureError(input: CaptureErrorInput): AgentRunErrorRecord;
	createJob(input: CreateJobInput): AgentJobRecord;
	appendTraceEvent(input: AppendTraceEventInput): {
		event: AgentTraceEventRecord;
		redactions: AgentTraceRedactionRecord[];
	};
	redactTraceEvent(id: string, input: RedactTraceEventInput): {
		event: AgentTraceEventRecord;
		redactions: AgentTraceRedactionRecord[];
	};
}

const STATUS_SET = new Set<string>(AGENT_RUN_STATUSES);
const JOB_STATUS_SET = new Set<string>(AGENT_JOB_STATUSES);

const ALLOWED_TRANSITIONS: Record<AgentRunStatus, readonly AgentRunStatus[]> = {
	pending: ['running', 'failed', 'cancelled', 'expired'],
	running: ['retrying', 'waiting_for_review', 'completed', 'failed', 'cancelled', 'expired'],
	retrying: ['running', 'failed', 'cancelled', 'expired'],
	waiting_for_review: ['running', 'completed', 'failed', 'cancelled', 'expired'],
	completed: [],
	failed: [],
	cancelled: [],
	expired: [],
};

function assertRunStatus(value: string): asserts value is AgentRunStatus {
	if (!STATUS_SET.has(value)) {
		throw new AgentRunLedgerError('invalid_status', `Unknown agent run status "${value}".`);
	}
}

function assertJobStatus(value: string): asserts value is AgentJobStatus {
	if (!JOB_STATUS_SET.has(value)) {
		throw new AgentRunLedgerError('invalid_status', `Unknown agent job status "${value}".`);
	}
}

function assertTransition(current: AgentRunStatus, next: AgentRunStatus): void {
	if (current === next) return;
	if (!ALLOWED_TRANSITIONS[current].includes(next)) {
		throw new AgentRunLedgerError(
			'invalid_transition',
			`Invalid agent run transition: ${current} -> ${next}.`,
		);
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

function toSqlJson(value: unknown): string {
	if (typeof value === 'string') return value;
	if (value == null) return '{}';
	return JSON.stringify(value);
}

function toSqlBoolean(value: boolean | undefined): number {
	return value ? 1 : 0;
}

function fromSqlBoolean(value: unknown): boolean {
	return Number(value) === 1;
}

function maybeRedactedJson(raw: unknown, redacted: unknown): string {
	if (redacted !== undefined) return toSqlJson(redacted);
	if (raw !== undefined) return toRedactedJson(raw).json;
	return '{}';
}

function clampLimit(limit: number | undefined): number {
	if (!limit || !Number.isFinite(limit)) return 50;
	return Math.max(1, Math.min(200, Math.floor(limit)));
}

function mapRun(row: Record<string, unknown>): AgentRunRecord {
	const status = String(row.status);
	assertRunStatus(status);
	return {
		id: String(row.id),
		projectId: row.projectId == null ? null : String(row.projectId),
		family: String(row.family),
		entrypoint: String(row.entrypoint ?? ''),
		status,
		requestedBy: String(row.requestedBy ?? ''),
		targetKind: String(row.targetKind ?? ''),
		targetId: String(row.targetId ?? ''),
		modelProvider: String(row.modelProvider ?? ''),
		modelId: String(row.modelId ?? ''),
		modelCapabilitySnapshotId:
			row.modelCapabilitySnapshotId == null ? null : String(row.modelCapabilitySnapshotId),
		targetJson: parseJson(row.targetJson),
		inputHash: String(row.inputHash ?? ''),
		contextHash: String(row.contextHash ?? ''),
		statusReason: String(row.statusReason ?? ''),
		errorCode: String(row.errorCode ?? ''),
		errorMessageRedacted: String(row.errorMessageRedacted ?? ''),
		retryOfRunId: row.retryOfRunId == null ? null : String(row.retryOfRunId),
		startedAt: row.startedAt == null ? null : String(row.startedAt),
		completedAt: row.completedAt == null ? null : String(row.completedAt),
		cancelledAt: row.cancelledAt == null ? null : String(row.cancelledAt),
		createdAt: String(row.createdAt),
		updatedAt: String(row.updatedAt),
	};
}

function mapStep(row: Record<string, unknown>): AgentRunStepRecord {
	return {
		id: String(row.id),
		runId: String(row.runId),
		sequence: Number(row.sequence),
		parentStepId: row.parentStepId == null ? null : String(row.parentStepId),
		kind: String(row.kind),
		status: String(row.status),
		source: String(row.source ?? ''),
		inputHash: String(row.inputHash ?? ''),
		outputHash: String(row.outputHash ?? ''),
		usageId: row.usageId == null ? null : String(row.usageId),
		artifactId: row.artifactId == null ? null : String(row.artifactId),
		errorCode: String(row.errorCode ?? ''),
		errorMessageRedacted: String(row.errorMessageRedacted ?? ''),
		startedAt: row.startedAt == null ? null : String(row.startedAt),
		completedAt: row.completedAt == null ? null : String(row.completedAt),
		elapsedMs: Number(row.elapsedMs ?? 0),
		createdAt: String(row.createdAt),
		updatedAt: String(row.updatedAt),
	};
}

function mapToolCall(row: Record<string, unknown>): AgentToolCallRecord {
	return {
		id: String(row.id),
		runId: String(row.runId),
		stepId: row.stepId == null ? null : String(row.stepId),
		invocationId: String(row.invocationId ?? ''),
		toolId: String(row.toolId),
		capability: String(row.capability ?? ''),
		caller: String(row.caller ?? ''),
		status: String(row.status),
		sourceStatus: String(row.sourceStatus ?? ''),
		inputRedactedJson: parseJson(row.inputRedactedJson),
		outputRedactedJson: parseJson(row.outputRedactedJson),
		inputHash: String(row.inputHash ?? ''),
		outputHash: String(row.outputHash ?? ''),
		artifactId: row.artifactId == null ? null : String(row.artifactId),
		errorCode: String(row.errorCode ?? ''),
		errorMessageRedacted: String(row.errorMessageRedacted ?? ''),
		startedAt: row.startedAt == null ? null : String(row.startedAt),
		completedAt: row.completedAt == null ? null : String(row.completedAt),
		createdAt: String(row.createdAt),
		updatedAt: String(row.updatedAt),
	};
}

function mapArtifact(row: Record<string, unknown>): AgentArtifactRecord {
	return {
		id: String(row.id),
		runId: String(row.runId),
		stepId: row.stepId == null ? null : String(row.stepId),
		artifactType: String(row.artifactType),
		reviewState: String(row.reviewState ?? ''),
		storageKind: String(row.storageKind ?? ''),
		storageProjectId: row.storageProjectId == null ? null : String(row.storageProjectId),
		storageOwnerId: row.storageOwnerId == null ? null : String(row.storageOwnerId),
		storageKey: String(row.storageKey ?? ''),
		storageRefJson: parseJson(row.storageRefJson),
		domainType: String(row.domainType ?? ''),
		domainId: String(row.domainId ?? ''),
		domainVersion: String(row.domainVersion ?? ''),
		schemaVersion: String(row.schemaVersion ?? ''),
		summary: String(row.summary ?? ''),
		contentHash: String(row.contentHash ?? ''),
		sourceStatus: String(row.sourceStatus ?? ''),
		createdAt: String(row.createdAt),
		updatedAt: String(row.updatedAt),
	};
}

function mapUsage(row: Record<string, unknown>): AgentUsageRecord {
	return {
		id: String(row.id),
		runId: String(row.runId),
		stepId: row.stepId == null ? null : String(row.stepId),
		providerId: String(row.providerId ?? ''),
		modelId: String(row.modelId ?? ''),
		usageKind: String(row.usageKind ?? ''),
		promptChars: Number(row.promptChars ?? 0),
		completionChars: Number(row.completionChars ?? 0),
		estimatedPromptTokens: Number(row.estimatedPromptTokens ?? 0),
		estimatedCompletionTokens: Number(row.estimatedCompletionTokens ?? 0),
		estimatedTotalTokens: Number(row.estimatedTotalTokens ?? 0),
		estimatedCostUsd: Number(row.estimatedCostUsd ?? 0),
		providerPromptTokens:
			row.providerPromptTokens == null ? null : Number(row.providerPromptTokens),
		providerCompletionTokens:
			row.providerCompletionTokens == null ? null : Number(row.providerCompletionTokens),
		providerTotalTokens: row.providerTotalTokens == null ? null : Number(row.providerTotalTokens),
		providerCostUsd: row.providerCostUsd == null ? null : Number(row.providerCostUsd),
		finishReason: String(row.finishReason ?? ''),
		usageConfidence: String(row.usageConfidence ?? ''),
		createdAt: String(row.createdAt),
	};
}

function mapRunError(row: Record<string, unknown>): AgentRunErrorRecord {
	return {
		id: String(row.id),
		runId: String(row.runId),
		stepId: row.stepId == null ? null : String(row.stepId),
		jobId: row.jobId == null ? null : String(row.jobId),
		errorCode: String(row.errorCode),
		errorKind: String(row.errorKind ?? ''),
		errorMessageRedacted: String(row.errorMessageRedacted ?? ''),
		retryable: fromSqlBoolean(row.retryable),
		detailsRedactedJson: parseJson(row.detailsRedactedJson),
		createdAt: String(row.createdAt),
	};
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

function mapTraceEvent(row: Record<string, unknown>): AgentTraceEventRecord {
	return {
		id: String(row.id),
		runId: String(row.runId),
		stepId: row.stepId == null ? null : String(row.stepId),
		sequence: Number(row.sequence),
		eventType: String(row.eventType),
		severity: String(row.severity ?? ''),
		message: String(row.message ?? ''),
		metadataRedactedJson: parseJson(row.metadataRedactedJson),
		redactionState: String(row.redactionState ?? ''),
		createdAt: String(row.createdAt),
	};
}

function mapTraceRedaction(row: Record<string, unknown>): AgentTraceRedactionRecord {
	return {
		id: String(row.id),
		runId: String(row.runId),
		traceEventId: row.traceEventId == null ? null : String(row.traceEventId),
		fieldPath: String(row.fieldPath),
		redactionType: row.redactionType as RuntimeRedaction['redactionType'],
		replacement: String(row.replacement ?? ''),
		reason: String(row.reason ?? ''),
		createdAt: String(row.createdAt),
	};
}

class SqliteRunLedgerRepository implements RunLedgerRepository {
	private readonly database: Database.Database;
	private readonly now: () => string;
	private readonly createId: () => string;

	constructor(database: Database.Database, options: RunLedgerRepositoryOptions = {}) {
		this.database = database;
		this.now = options.now ?? (() => new Date().toISOString());
		this.createId = options.createId ?? (() => randomUUID());
	}

	createRun(input: CreateRunInput): AgentRunRecord {
		assertRunStatus(input.status ?? 'pending');
		const now = this.now();
		const record = {
			id: input.id ?? this.createId(),
			projectId: input.projectId ?? null,
			family: input.family,
			entrypoint: input.entrypoint ?? '',
			status: input.status ?? 'pending',
			requestedBy: input.requestedBy ?? 'user',
			targetKind: input.targetKind ?? '',
			targetId: input.targetId ?? '',
			modelProvider: input.modelProvider ?? '',
			modelId: input.modelId ?? '',
			modelCapabilitySnapshotId: input.modelCapabilitySnapshotId ?? null,
			targetJson: toSqlJson(input.targetJson),
			inputHash: input.inputHash ?? '',
			contextHash: input.contextHash ?? '',
			statusReason: input.statusReason ?? '',
			errorCode: input.errorCode ?? '',
			errorMessageRedacted: input.errorMessageRedacted ?? '',
			retryOfRunId: input.retryOfRunId ?? null,
			startedAt: input.startedAt ?? null,
			completedAt: input.completedAt ?? null,
			cancelledAt: input.cancelledAt ?? null,
			createdAt: now,
			updatedAt: now,
		};

		this.database
			.prepare(
				`INSERT INTO agent_runs (
					id, projectId, family, entrypoint, status, requestedBy, targetKind, targetId,
					modelProvider, modelId, modelCapabilitySnapshotId, targetJson, inputHash,
					contextHash, statusReason, errorCode, errorMessageRedacted, retryOfRunId,
					startedAt, completedAt, cancelledAt, createdAt, updatedAt
				) VALUES (
					@id, @projectId, @family, @entrypoint, @status, @requestedBy, @targetKind, @targetId,
					@modelProvider, @modelId, @modelCapabilitySnapshotId, @targetJson, @inputHash,
					@contextHash, @statusReason, @errorCode, @errorMessageRedacted, @retryOfRunId,
					@startedAt, @completedAt, @cancelledAt, @createdAt, @updatedAt
				)`,
			)
			.run(record);

		return this.getRun(record.id) as AgentRunRecord;
	}

	getRun(id: string): AgentRunRecord | null {
		const row = this.database.prepare('SELECT * FROM agent_runs WHERE id = ?').get(id) as
			| Record<string, unknown>
			| undefined;
		return row ? mapRun(row) : null;
	}

	getRunDetails(id: string): AgentRunDetails | null {
		const run = this.getRun(id);
		if (!run) return null;
		return {
			run,
			steps: this.database
				.prepare('SELECT * FROM agent_run_steps WHERE runId = ? ORDER BY sequence ASC')
				.all(id)
				.map((row) => mapStep(row as Record<string, unknown>)),
			toolCalls: this.database
				.prepare('SELECT * FROM agent_tool_calls WHERE runId = ? ORDER BY createdAt ASC')
				.all(id)
				.map((row) => mapToolCall(row as Record<string, unknown>)),
			artifacts: this.database
				.prepare('SELECT * FROM agent_artifacts WHERE runId = ? ORDER BY createdAt ASC')
				.all(id)
				.map((row) => mapArtifact(row as Record<string, unknown>)),
			usage: this.database
				.prepare('SELECT * FROM agent_usage WHERE runId = ? ORDER BY createdAt ASC')
				.all(id)
				.map((row) => mapUsage(row as Record<string, unknown>)),
			errors: this.database
				.prepare('SELECT * FROM agent_run_errors WHERE runId = ? ORDER BY createdAt ASC')
				.all(id)
				.map((row) => mapRunError(row as Record<string, unknown>)),
			jobs: this.database
				.prepare('SELECT * FROM agent_jobs WHERE runId = ? ORDER BY createdAt ASC')
				.all(id)
				.map((row) => mapJob(row as Record<string, unknown>)),
			traceEvents: this.database
				.prepare('SELECT * FROM agent_trace_events WHERE runId = ? ORDER BY sequence ASC')
				.all(id)
				.map((row) => mapTraceEvent(row as Record<string, unknown>)),
			traceRedactions: this.database
				.prepare('SELECT * FROM agent_trace_redactions WHERE runId = ? ORDER BY createdAt ASC')
				.all(id)
				.map((row) => mapTraceRedaction(row as Record<string, unknown>)),
		};
	}

	listRuns(filter: ListRunsFilter = {}): AgentRunRecord[] {
		if (filter.status) assertRunStatus(filter.status);
		const conditions: string[] = [];
		const params: unknown[] = [];
		if (filter.projectId) {
			conditions.push('projectId = ?');
			params.push(filter.projectId);
		}
		if (filter.status) {
			conditions.push('status = ?');
			params.push(filter.status);
		}
		if (filter.family) {
			conditions.push('family = ?');
			params.push(filter.family);
		}
		const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
		params.push(clampLimit(filter.limit));
		return this.database
			.prepare(`SELECT * FROM agent_runs ${where} ORDER BY createdAt DESC LIMIT ?`)
			.all(...params)
			.map((row) => mapRun(row as Record<string, unknown>));
	}

	transitionRun(
		id: string,
		nextStatus: AgentRunStatus,
		input: TransitionRunInput = {},
	): AgentRunRecord {
		assertRunStatus(nextStatus);
		const current = this.getRun(id);
		if (!current) {
			throw new AgentRunLedgerError('run_not_found', `Agent run "${id}" was not found.`);
		}
		assertTransition(current.status, nextStatus);

		const now = this.now();
		const startedAt =
			input.startedAt !== undefined
				? input.startedAt
				: nextStatus === 'running' && !current.startedAt
					? now
					: current.startedAt;
		const completedAt =
			input.completedAt !== undefined
				? input.completedAt
				: ['completed', 'failed', 'expired'].includes(nextStatus) && !current.completedAt
					? now
					: current.completedAt;
		const cancelledAt =
			input.cancelledAt !== undefined
				? input.cancelledAt
				: nextStatus === 'cancelled' && !current.cancelledAt
					? now
					: current.cancelledAt;

		this.database
			.prepare(
				`UPDATE agent_runs
				 SET status = @status,
					 statusReason = @statusReason,
					 errorCode = @errorCode,
					 errorMessageRedacted = @errorMessageRedacted,
					 startedAt = @startedAt,
					 completedAt = @completedAt,
					 cancelledAt = @cancelledAt,
					 updatedAt = @updatedAt
				 WHERE id = @id`,
			)
			.run({
				id,
				status: nextStatus,
				statusReason: input.statusReason ?? current.statusReason,
				errorCode: input.errorCode ?? current.errorCode,
				errorMessageRedacted: input.errorMessageRedacted ?? current.errorMessageRedacted,
				startedAt,
				completedAt,
				cancelledAt,
				updatedAt: now,
			});

		return this.getRun(id) as AgentRunRecord;
	}

	appendStep(input: AppendStepInput): AgentRunStepRecord {
		this.requireRun(input.runId);
		const now = this.now();
		const sequence = input.sequence ?? this.nextSequence('agent_run_steps', input.runId);
		const record = {
			id: input.id ?? this.createId(),
			runId: input.runId,
			sequence,
			parentStepId: input.parentStepId ?? null,
			kind: input.kind,
			status: input.status,
			source: input.source ?? '',
			inputHash: input.inputHash ?? '',
			outputHash: input.outputHash ?? '',
			usageId: input.usageId ?? null,
			artifactId: input.artifactId ?? null,
			errorCode: input.errorCode ?? '',
			errorMessageRedacted: input.errorMessageRedacted ?? '',
			startedAt: input.startedAt ?? null,
			completedAt: input.completedAt ?? null,
			elapsedMs: input.elapsedMs ?? 0,
			createdAt: now,
			updatedAt: now,
		};
		this.database
			.prepare(
				`INSERT INTO agent_run_steps (
					id, runId, sequence, parentStepId, kind, status, source, inputHash, outputHash,
					usageId, artifactId, errorCode, errorMessageRedacted, startedAt, completedAt,
					elapsedMs, createdAt, updatedAt
				) VALUES (
					@id, @runId, @sequence, @parentStepId, @kind, @status, @source, @inputHash, @outputHash,
					@usageId, @artifactId, @errorCode, @errorMessageRedacted, @startedAt, @completedAt,
					@elapsedMs, @createdAt, @updatedAt
				)`,
			)
			.run(record);
		return mapStep(
			this.database.prepare('SELECT * FROM agent_run_steps WHERE id = ?').get(record.id) as Record<
				string,
				unknown
			>,
		);
	}

	captureToolCall(input: CaptureToolCallInput): AgentToolCallRecord {
		this.requireRun(input.runId);
		const now = this.now();
		const record = {
			id: input.id ?? this.createId(),
			runId: input.runId,
			stepId: input.stepId ?? null,
			invocationId: input.invocationId ?? '',
			toolId: input.toolId,
			capability: input.capability ?? '',
			caller: input.caller ?? '',
			status: input.status,
			sourceStatus: input.sourceStatus ?? '',
			inputRedactedJson: maybeRedactedJson(input.input, input.inputRedactedJson),
			outputRedactedJson: maybeRedactedJson(input.output, input.outputRedactedJson),
			inputHash: input.inputHash ?? '',
			outputHash: input.outputHash ?? '',
			artifactId: input.artifactId ?? null,
			errorCode: input.errorCode ?? '',
			errorMessageRedacted: input.errorMessageRedacted ?? '',
			startedAt: input.startedAt ?? null,
			completedAt: input.completedAt ?? null,
			createdAt: now,
			updatedAt: now,
		};
		this.database
			.prepare(
				`INSERT INTO agent_tool_calls (
					id, runId, stepId, invocationId, toolId, capability, caller, status, sourceStatus,
					inputRedactedJson, outputRedactedJson, inputHash, outputHash, artifactId,
					errorCode, errorMessageRedacted, startedAt, completedAt, createdAt, updatedAt
				) VALUES (
					@id, @runId, @stepId, @invocationId, @toolId, @capability, @caller, @status, @sourceStatus,
					@inputRedactedJson, @outputRedactedJson, @inputHash, @outputHash, @artifactId,
					@errorCode, @errorMessageRedacted, @startedAt, @completedAt, @createdAt, @updatedAt
				)`,
			)
			.run(record);
		return mapToolCall(
			this.database.prepare('SELECT * FROM agent_tool_calls WHERE id = ?').get(record.id) as Record<
				string,
				unknown
			>,
		);
	}

	linkArtifact(input: LinkArtifactInput): AgentArtifactRecord {
		this.requireRun(input.runId);
		const now = this.now();
		const record = {
			id: input.id ?? this.createId(),
			runId: input.runId,
			stepId: input.stepId ?? null,
			artifactType: input.artifactType,
			reviewState: input.reviewState ?? '',
			storageKind: input.storageKind ?? '',
			storageProjectId: input.storageProjectId ?? null,
			storageOwnerId: input.storageOwnerId ?? null,
			storageKey: input.storageKey ?? '',
			storageRefJson: toSqlJson(input.storageRefJson),
			domainType: input.domainType ?? '',
			domainId: input.domainId ?? '',
			domainVersion: input.domainVersion ?? '',
			schemaVersion: input.schemaVersion ?? '1',
			summary: input.summary ?? '',
			contentHash: input.contentHash ?? '',
			sourceStatus: input.sourceStatus ?? '',
			createdAt: now,
			updatedAt: now,
		};
		this.database
			.prepare(
				`INSERT INTO agent_artifacts (
					id, runId, stepId, artifactType, reviewState, storageKind, storageProjectId,
					storageOwnerId, storageKey, storageRefJson, domainType, domainId, domainVersion,
					schemaVersion, summary, contentHash, sourceStatus, createdAt, updatedAt
				) VALUES (
					@id, @runId, @stepId, @artifactType, @reviewState, @storageKind, @storageProjectId,
					@storageOwnerId, @storageKey, @storageRefJson, @domainType, @domainId, @domainVersion,
					@schemaVersion, @summary, @contentHash, @sourceStatus, @createdAt, @updatedAt
				)`,
			)
			.run(record);
		return mapArtifact(
			this.database.prepare('SELECT * FROM agent_artifacts WHERE id = ?').get(record.id) as Record<
				string,
				unknown
			>,
		);
	}

	recordUsage(input: RecordUsageInput): AgentUsageRecord {
		this.requireRun(input.runId);
		const record = {
			id: input.id ?? this.createId(),
			runId: input.runId,
			stepId: input.stepId ?? null,
			providerId: input.providerId ?? '',
			modelId: input.modelId ?? '',
			usageKind: input.usageKind ?? 'estimate',
			promptChars: input.promptChars ?? 0,
			completionChars: input.completionChars ?? 0,
			estimatedPromptTokens: input.estimatedPromptTokens ?? 0,
			estimatedCompletionTokens: input.estimatedCompletionTokens ?? 0,
			estimatedTotalTokens: input.estimatedTotalTokens ?? 0,
			estimatedCostUsd: input.estimatedCostUsd ?? 0,
			providerPromptTokens: input.providerPromptTokens ?? null,
			providerCompletionTokens: input.providerCompletionTokens ?? null,
			providerTotalTokens: input.providerTotalTokens ?? null,
			providerCostUsd: input.providerCostUsd ?? null,
			finishReason: input.finishReason ?? '',
			usageConfidence: input.usageConfidence ?? '',
			createdAt: this.now(),
		};
		this.database
			.prepare(
				`INSERT INTO agent_usage (
					id, runId, stepId, providerId, modelId, usageKind, promptChars, completionChars,
					estimatedPromptTokens, estimatedCompletionTokens, estimatedTotalTokens,
					estimatedCostUsd, providerPromptTokens, providerCompletionTokens, providerTotalTokens,
					providerCostUsd, finishReason, usageConfidence, createdAt
				) VALUES (
					@id, @runId, @stepId, @providerId, @modelId, @usageKind, @promptChars, @completionChars,
					@estimatedPromptTokens, @estimatedCompletionTokens, @estimatedTotalTokens,
					@estimatedCostUsd, @providerPromptTokens, @providerCompletionTokens, @providerTotalTokens,
					@providerCostUsd, @finishReason, @usageConfidence, @createdAt
				)`,
			)
			.run(record);
		return mapUsage(
			this.database.prepare('SELECT * FROM agent_usage WHERE id = ?').get(record.id) as Record<
				string,
				unknown
			>,
		);
	}

	captureError(input: CaptureErrorInput): AgentRunErrorRecord {
		this.requireRun(input.runId);
		const record = {
			id: input.id ?? this.createId(),
			runId: input.runId,
			stepId: input.stepId ?? null,
			jobId: input.jobId ?? null,
			errorCode: input.errorCode,
			errorKind: input.errorKind ?? '',
			errorMessageRedacted: input.errorMessageRedacted ?? '',
			retryable: toSqlBoolean(input.retryable),
			detailsRedactedJson: maybeRedactedJson(input.details, input.detailsRedactedJson),
			createdAt: this.now(),
		};
		this.database
			.prepare(
				`INSERT INTO agent_run_errors (
					id, runId, stepId, jobId, errorCode, errorKind, errorMessageRedacted,
					retryable, detailsRedactedJson, createdAt
				) VALUES (
					@id, @runId, @stepId, @jobId, @errorCode, @errorKind, @errorMessageRedacted,
					@retryable, @detailsRedactedJson, @createdAt
				)`,
			)
			.run(record);
		return mapRunError(
			this.database.prepare('SELECT * FROM agent_run_errors WHERE id = ?').get(record.id) as Record<
				string,
				unknown
			>,
		);
	}

	createJob(input: CreateJobInput): AgentJobRecord {
		if (input.runId) this.requireRun(input.runId);
		const now = this.now();
		const record = {
			id: input.id ?? this.createId(),
			runId: input.runId ?? null,
			projectId: input.projectId ?? null,
			jobType: input.jobType,
			status: input.status,
			priority: input.priority ?? 0,
			runAfter: input.runAfter ?? null,
			lockedAt: input.lockedAt ?? null,
			lockedBy: input.lockedBy ?? '',
			lockExpiresAt: input.lockExpiresAt ?? null,
			heartbeatAt: input.heartbeatAt ?? null,
			attempt: input.attempt ?? 0,
			maxAttempts: input.maxAttempts ?? 1,
			retryOfJobId: input.retryOfJobId ?? null,
			payloadRedactedJson: maybeRedactedJson(input.payload, input.payloadRedactedJson),
			payloadHash: input.payloadHash ?? '',
			resultArtifactId: input.resultArtifactId ?? null,
			progressCurrent: input.progressCurrent ?? 0,
			progressTotal: input.progressTotal ?? 0,
			progressLabel: input.progressLabel ?? '',
			startedAt: input.startedAt ?? null,
			completedAt: input.completedAt ?? null,
			cancelledAt: input.cancelledAt ?? null,
			errorCode: input.errorCode ?? '',
			errorMessageRedacted: input.errorMessageRedacted ?? '',
			createdAt: now,
			updatedAt: now,
		};
		this.database
			.prepare(
				`INSERT INTO agent_jobs (
					id, runId, projectId, jobType, status, priority, runAfter, lockedAt, lockedBy,
					lockExpiresAt, heartbeatAt, attempt, maxAttempts, retryOfJobId, payloadRedactedJson, payloadHash,
					resultArtifactId,
					progressCurrent, progressTotal, progressLabel, startedAt, completedAt, cancelledAt,
					errorCode, errorMessageRedacted, createdAt, updatedAt
				) VALUES (
					@id, @runId, @projectId, @jobType, @status, @priority, @runAfter, @lockedAt, @lockedBy,
					@lockExpiresAt, @heartbeatAt, @attempt, @maxAttempts, @retryOfJobId, @payloadRedactedJson, @payloadHash,
					@resultArtifactId,
					@progressCurrent, @progressTotal, @progressLabel, @startedAt, @completedAt, @cancelledAt,
					@errorCode, @errorMessageRedacted, @createdAt, @updatedAt
				)`,
			)
			.run(record);
		return mapJob(
			this.database.prepare('SELECT * FROM agent_jobs WHERE id = ?').get(record.id) as Record<
				string,
				unknown
			>,
		);
	}

	appendTraceEvent(input: AppendTraceEventInput): {
		event: AgentTraceEventRecord;
		redactions: AgentTraceRedactionRecord[];
	} {
		this.requireRun(input.runId);
		const now = this.now();
		const sequence = input.sequence ?? this.nextSequence('agent_trace_events', input.runId);
		const redacted =
			input.metadataRedactedJson !== undefined
				? { json: toSqlJson(input.metadataRedactedJson), redactions: [] }
				: toRedactedJson(input.metadata ?? {});
		const redactionState =
			input.redactionState ?? (redacted.redactions.length > 0 ? 'redacted' : 'none');
		const record = {
			id: input.id ?? this.createId(),
			runId: input.runId,
			stepId: input.stepId ?? null,
			sequence,
			eventType: input.eventType,
			severity: input.severity ?? 'info',
			message: input.message ?? '',
			metadataRedactedJson: redacted.json,
			redactionState,
			createdAt: now,
		};

		const transaction = this.database.transaction(() => {
			this.database
				.prepare(
					`INSERT INTO agent_trace_events (
						id, runId, stepId, sequence, eventType, severity, message,
						metadataRedactedJson, redactionState, createdAt
					) VALUES (
						@id, @runId, @stepId, @sequence, @eventType, @severity, @message,
						@metadataRedactedJson, @redactionState, @createdAt
					)`,
				)
				.run(record);
			this.insertTraceRedactions(input.runId, record.id, redacted.redactions, now);
		});
		transaction();

		return {
			event: mapTraceEvent(
				this.database.prepare('SELECT * FROM agent_trace_events WHERE id = ?').get(record.id) as Record<
					string,
					unknown
				>,
			),
			redactions: this.listTraceRedactionsForEvent(record.id),
		};
	}

	redactTraceEvent(
		id: string,
		input: RedactTraceEventInput,
	): { event: AgentTraceEventRecord; redactions: AgentTraceRedactionRecord[] } {
		const existing = this.database.prepare('SELECT * FROM agent_trace_events WHERE id = ?').get(id) as
			| Record<string, unknown>
			| undefined;
		if (!existing) {
			throw new AgentRunLedgerError('trace_event_not_found', `Trace event "${id}" was not found.`);
		}
		const event = mapTraceEvent(existing);
		const redacted = toRedactedJson(input.metadata);
		const now = this.now();
		const redactions = redacted.redactions.map((entry) => ({
			...entry,
			reason: input.reason ?? entry.reason,
		}));
		const transaction = this.database.transaction(() => {
			this.database
				.prepare(
					`UPDATE agent_trace_events
					 SET metadataRedactedJson = ?, redactionState = ?
					 WHERE id = ?`,
				)
				.run(redacted.json, redactions.length > 0 ? 'redacted' : 'none', id);
			this.database.prepare('DELETE FROM agent_trace_redactions WHERE traceEventId = ?').run(id);
			this.insertTraceRedactions(event.runId, id, redactions, now);
		});
		transaction();
		return {
			event: mapTraceEvent(
				this.database.prepare('SELECT * FROM agent_trace_events WHERE id = ?').get(id) as Record<
					string,
					unknown
				>,
			),
			redactions: this.listTraceRedactionsForEvent(id),
		};
	}

	private requireRun(runId: string): void {
		if (!this.getRun(runId)) {
			throw new AgentRunLedgerError('run_not_found', `Agent run "${runId}" was not found.`);
		}
	}

	private nextSequence(table: 'agent_run_steps' | 'agent_trace_events', runId: string): number {
		const row = this.database
			.prepare(`SELECT COALESCE(MAX(sequence), 0) + 1 AS sequence FROM ${table} WHERE runId = ?`)
			.get(runId) as { sequence: number };
		return row.sequence;
	}

	private insertTraceRedactions(
		runId: string,
		traceEventId: string,
		redactions: RuntimeRedaction[],
		createdAt: string,
	): void {
		if (redactions.length === 0) return;
		const insert = this.database.prepare(
			`INSERT INTO agent_trace_redactions (
				id, runId, traceEventId, fieldPath, redactionType, replacement, reason, createdAt
			) VALUES (
				@id, @runId, @traceEventId, @fieldPath, @redactionType, @replacement, @reason, @createdAt
			)`,
		);
		for (const redaction of redactions) {
			insert.run({
				id: this.createId(),
				runId,
				traceEventId,
				fieldPath: redaction.fieldPath,
				redactionType: redaction.redactionType,
				replacement: redaction.replacement,
				reason: redaction.reason,
				createdAt,
			});
		}
	}

	private listTraceRedactionsForEvent(traceEventId: string): AgentTraceRedactionRecord[] {
		return this.database
			.prepare('SELECT * FROM agent_trace_redactions WHERE traceEventId = ? ORDER BY createdAt ASC')
			.all(traceEventId)
			.map((row) => mapTraceRedaction(row as Record<string, unknown>));
	}
}

export function createRunLedgerRepository(
	database: Database.Database = defaultDb,
	options: RunLedgerRepositoryOptions = {},
): RunLedgerRepository {
	return new SqliteRunLedgerRepository(database, options);
}
