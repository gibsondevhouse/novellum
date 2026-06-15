import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { db as defaultDb } from '$lib/server/db/index.js';
import { redactRuntimePayload } from '$lib/server/agent-runtime/redaction.js';
import type { AiControllerTaskStatus } from './contracts.js';

export const AI_CONTROLLER_RUN_LOG_OWNER_ID = 'aiControllerRuns.v1' as const;

export interface AiControllerRunLogStep {
	sequence: number;
	status: AiControllerTaskStatus;
	message: string;
	metadataRedacted: unknown;
	createdAt: string;
}

export interface AiControllerRunLogRecord {
	id: string;
	requestId: string;
	projectId: string | null;
	workflowId: string | null;
	intent: string | null;
	status: AiControllerTaskStatus;
	steps: AiControllerRunLogStep[];
	errorCode: string | null;
	errorMessage: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ControllerRunLogger {
	startRun(input: {
		requestId: string;
		projectId?: string | null;
		workflowId?: string | null;
		intent?: string | null;
		status?: AiControllerTaskStatus;
	}): AiControllerRunLogRecord;
	appendStep(
		runId: string,
		status: AiControllerTaskStatus,
		message: string,
		metadata?: unknown,
	): AiControllerRunLogRecord;
	finishRun(
		runId: string,
		status: AiControllerTaskStatus,
		error?: { code: string; message: string } | null,
	): AiControllerRunLogRecord;
	getRun(runId: string, projectId?: string | null): AiControllerRunLogRecord | null;
}

export interface ControllerRunLoggerOptions {
	db?: Database.Database;
	now?: () => string;
	createId?: () => string;
}

function storageProjectId(projectId: string | null): string {
	return projectId ?? '__global__';
}

function parseRun(raw: string): AiControllerRunLogRecord {
	return JSON.parse(raw) as AiControllerRunLogRecord;
}

export function createControllerRunLogger(
	options: ControllerRunLoggerOptions = {},
): ControllerRunLogger {
	const database = options.db ?? defaultDb;
	const now = options.now ?? (() => new Date().toISOString());
	const createId = options.createId ?? (() => `ai-run-${randomUUID()}`);

	function persist(record: AiControllerRunLogRecord): void {
		database
			.prepare(
				`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
				 VALUES (?, 'pipeline', ?, ?, ?, ?)
				 ON CONFLICT(projectId, scope, ownerId, key)
				 DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
			)
			.run(
				storageProjectId(record.projectId),
				AI_CONTROLLER_RUN_LOG_OWNER_ID,
				record.id,
				JSON.stringify(record),
				record.updatedAt,
			);
	}

	function findById(runId: string, projectId: string | null): AiControllerRunLogRecord | null {
		const row = database
			.prepare(
				`SELECT value FROM project_metadata
				 WHERE projectId = ? AND scope = 'pipeline' AND ownerId = ? AND key = ?`,
			)
			.get(storageProjectId(projectId), AI_CONTROLLER_RUN_LOG_OWNER_ID, runId) as
			| { value: string }
			| undefined;
		return row ? parseRun(row.value) : null;
	}

	function findAny(runId: string): AiControllerRunLogRecord | null {
		const row = database
			.prepare(
				`SELECT value FROM project_metadata
				 WHERE scope = 'pipeline' AND ownerId = ? AND key = ?
				 ORDER BY updatedAt DESC LIMIT 1`,
			)
			.get(AI_CONTROLLER_RUN_LOG_OWNER_ID, runId) as { value: string } | undefined;
		return row ? parseRun(row.value) : null;
	}

	return {
		startRun(input) {
			const timestamp = now();
			const record: AiControllerRunLogRecord = {
				id: createId(),
				requestId: input.requestId,
				projectId: input.projectId ?? null,
				workflowId: input.workflowId ?? null,
				intent: input.intent ?? null,
				status: input.status ?? 'received',
				steps: [],
				errorCode: null,
				errorMessage: null,
				createdAt: timestamp,
				updatedAt: timestamp,
			};
			persist(record);
			return record;
		},
		appendStep(runId, status, message, metadata) {
			const record = findAny(runId);
			if (!record) throw new Error(`Controller run not found: ${runId}`);
			const redacted = redactRuntimePayload(metadata ?? {});
			const updated: AiControllerRunLogRecord = {
				...record,
				status,
				steps: [
					...record.steps,
					{
						sequence: record.steps.length + 1,
						status,
						message,
						metadataRedacted: redacted.redacted,
						createdAt: now(),
					},
				],
				updatedAt: now(),
			};
			persist(updated);
			return updated;
		},
		finishRun(runId, status, error = null) {
			const record = findAny(runId);
			if (!record) throw new Error(`Controller run not found: ${runId}`);
			const updated: AiControllerRunLogRecord = {
				...record,
				status,
				errorCode: error?.code ?? null,
				errorMessage: error?.message ?? null,
				updatedAt: now(),
			};
			persist(updated);
			return updated;
		},
		getRun(runId, projectId = null) {
			return projectId === undefined ? findAny(runId) : findById(runId, projectId);
		},
	};
}

export function auditControllerEntrypoint(input: {
	route: string;
	requestId: string;
	projectId?: string | null;
	workflowId?: string | null;
	intent?: string | null;
	metadata?: unknown;
	logger?: ControllerRunLogger;
}): AiControllerRunLogRecord {
	const logger = input.logger ?? createControllerRunLogger();
	const run = logger.startRun({
		requestId: input.requestId,
		projectId: input.projectId ?? null,
		workflowId: input.workflowId ?? null,
		intent: input.intent ?? null,
		status: 'received',
	});
	logger.appendStep(run.id, 'completed', `Entrypoint wrapped by AI controller: ${input.route}`, {
		route: input.route,
		...(typeof input.metadata === 'object' && input.metadata ? (input.metadata as object) : {}),
	});
	return logger.finishRun(run.id, 'completed');
}

export function auditControllerEntrypointSafely(input: Parameters<typeof auditControllerEntrypoint>[0]): void {
	if (process.env.NODE_ENV === 'test' && process.env.NOVELLUM_AI_CONTROLLER_AUDIT_IN_TEST !== '1') {
		return;
	}
	try {
		auditControllerEntrypoint(input);
	} catch (err) {
		console.warn(
			'[ai-controller] failed to audit wrapped entrypoint',
			err instanceof Error ? err.message : err,
		);
	}
}
