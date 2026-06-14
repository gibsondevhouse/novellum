import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, MIGRATION_REGISTRY } from '$lib/server/db';

const RUNTIME_TABLES = [
	'agent_runs',
	'agent_run_steps',
	'agent_tool_calls',
	'agent_artifacts',
	'agent_usage',
	'agent_run_errors',
	'agent_jobs',
	'agent_trace_events',
	'agent_trace_redactions',
] as const;

const RUNTIME_INDEXES = [
	'idx_agent_runs_project_status',
	'idx_agent_runs_family_createdAt',
	'idx_agent_runs_status_updatedAt',
	'idx_agent_runs_target',
	'idx_agent_runs_retryOfRunId',
	'idx_agent_run_steps_run_sequence',
	'idx_agent_run_steps_status_kind',
	'idx_agent_run_steps_artifactId',
	'idx_agent_tool_calls_run',
	'idx_agent_tool_calls_tool_status',
	'idx_agent_tool_calls_artifactId',
	'idx_agent_artifacts_run',
	'idx_agent_artifacts_type_state',
	'idx_agent_artifacts_storage',
	'idx_agent_artifacts_domain',
	'idx_agent_usage_run',
	'idx_agent_run_errors_run',
	'idx_agent_run_errors_code',
	'idx_agent_jobs_project_status',
	'idx_agent_jobs_status_runAfter',
	'idx_agent_jobs_lockExpiresAt',
	'idx_agent_jobs_runId',
	'idx_agent_jobs_resultArtifactId',
	'idx_agent_trace_events_run_sequence',
	'idx_agent_trace_redactions_run',
	'idx_agent_trace_redactions_event',
] as const;

function columnNames(db: Database.Database, table: string): string[] {
	const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
	return rows.map((row) => row.name);
}

describe('migration 0006 — agent runtime ledger', () => {
	it('creates runtime ledger tables and query indexes', () => {
		const db = new Database(':memory:');
		try {
			runMigrations(db, MIGRATION_REGISTRY);

			for (const table of RUNTIME_TABLES) {
				const row = db
					.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
					.get(table);
				expect(row, `expected table ${table} to exist`).toBeTruthy();
			}

			for (const index of RUNTIME_INDEXES) {
				const row = db
					.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name = ?")
					.get(index);
				expect(row, `expected index ${index} to exist`).toBeTruthy();
			}

			expect(columnNames(db, 'agent_runs')).toEqual(
				expect.arrayContaining([
					'family',
					'entrypoint',
					'status',
					'targetKind',
					'targetId',
					'inputHash',
					'contextHash',
					'modelCapabilitySnapshotId',
				]),
			);
			expect(columnNames(db, 'agent_artifacts')).toEqual(
				expect.arrayContaining([
					'reviewState',
					'storageKind',
					'storageProjectId',
					'storageOwnerId',
					'storageKey',
					'domainType',
					'domainId',
					'contentHash',
				]),
			);
			expect(columnNames(db, 'agent_trace_events')).toEqual(
				expect.arrayContaining(['metadataRedactedJson', 'redactionState']),
			);
			expect(columnNames(db, 'agent_jobs')).toEqual(
				expect.arrayContaining(['heartbeatAt', 'resultArtifactId']),
			);
		} finally {
			db.close();
		}
	});

	it('persists representative linked runtime records without copying domain content', () => {
		const db = new Database(':memory:');
		try {
			runMigrations(db, MIGRATION_REGISTRY);
			const now = '2026-06-14T21:45:00.000Z';

			db.prepare(
				`INSERT INTO agent_runs (
					id, projectId, family, entrypoint, status, requestedBy, targetKind, targetId,
					modelProvider, modelId, targetJson, inputHash, contextHash, createdAt, updatedAt
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'run-1',
				'project-1',
				'outline',
				'outline.generate',
				'waiting_for_review',
				'user',
				'project',
				'project-1',
				'openrouter',
				'model-a',
				'{"scope":"project"}',
				'sha256:input',
				'sha256:context',
				now,
				now,
			);

			db.prepare(
				`INSERT INTO agent_run_steps (
					id, runId, sequence, kind, status, source, inputHash, outputHash, artifactId, createdAt, updatedAt
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'step-1',
				'run-1',
				1,
				'model_call',
				'completed',
				'outlineDraftCheckpoints.v1',
				'sha256:step-input',
				'sha256:step-output',
				'artifact-1',
				now,
				now,
			);

			db.prepare(
				`INSERT INTO agent_artifacts (
					id, runId, stepId, artifactType, reviewState, storageKind, storageProjectId,
					storageOwnerId, storageKey, storageRefJson, domainType, domainId, schemaVersion,
					summary, contentHash, sourceStatus, createdAt, updatedAt
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'artifact-1',
				'run-1',
				'step-1',
				'outline_checkpoint',
				'pending',
				'project_metadata',
				'project-1',
				'outline',
				'outlineDraftCheckpoints.v1',
				'{"projectId":"project-1","scope":"outline","ownerId":"outline","key":"outlineDraftCheckpoints.v1"}',
				'outline_checkpoint',
				'checkpoint-1',
				'1',
				'Pending outline checkpoint linked by id.',
				'sha256:artifact',
				'waiting_for_review',
				now,
				now,
			);

			db.prepare(
				`INSERT INTO agent_tool_calls (
					id, runId, stepId, invocationId, toolId, capability, caller, status, sourceStatus,
					inputRedactedJson, outputRedactedJson, inputHash, outputHash, artifactId, createdAt, updatedAt
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'tool-1',
				'run-1',
				'step-1',
				'invoke-1',
				'outlineDraft.accept_checkpoint',
				'review_decision',
				'agent-loop',
				'blocked_by_review',
				'waiting_for_review',
				'{"checkpointId":"checkpoint-1"}',
				'{"reason":"human_accept_required"}',
				'sha256:tool-input',
				'sha256:tool-output',
				'artifact-1',
				now,
				now,
			);

			db.prepare(
				`INSERT INTO agent_usage (
					id, runId, stepId, providerId, modelId, usageKind, promptChars, completionChars,
					estimatedPromptTokens, estimatedCompletionTokens, estimatedTotalTokens,
					estimatedCostUsd, usageConfidence, createdAt
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'usage-1',
				'run-1',
				'step-1',
				'openrouter',
				'model-a',
				'estimate',
				1200,
				400,
				300,
				100,
				400,
				0.002,
				'estimated',
				now,
			);

			db.prepare(
				`INSERT INTO agent_jobs (
					id, runId, projectId, jobType, status, priority, runAfter, attempt,
					maxAttempts, payloadRedactedJson, payloadHash, createdAt, updatedAt
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'job-1',
				'run-1',
				'project-1',
				'outline.generate',
				'waiting_for_review',
				10,
				now,
				1,
				3,
				'{"projectId":"project-1"}',
				'sha256:payload',
				now,
				now,
			);

			db.prepare(
				`INSERT INTO agent_run_errors (
					id, runId, stepId, jobId, errorCode, errorKind, errorMessageRedacted,
					retryable, detailsRedactedJson, createdAt
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'error-1',
				'run-1',
				'step-1',
				'job-1',
				'outline_conflict',
				'validation',
				'Checkpoint already superseded.',
				1,
				'{"checkpointId":"checkpoint-1"}',
				now,
			);

			db.prepare(
				`INSERT INTO agent_trace_events (
					id, runId, stepId, sequence, eventType, severity, message,
					metadataRedactedJson, redactionState, createdAt
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'trace-1',
				'run-1',
				'step-1',
				1,
				'model_response',
				'info',
				'Captured redacted model response metadata.',
				'{"prompt":"[redacted]"}',
				'redacted',
				now,
			);

			db.prepare(
				`INSERT INTO agent_trace_redactions (
					id, runId, traceEventId, fieldPath, redactionType, replacement, reason, createdAt
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'redaction-1',
				'run-1',
				'trace-1',
				'metadata.prompt',
				'manuscript_text',
				'[redacted]',
				'diagnostics must not export manuscript text by default',
				now,
			);

			const run = db
				.prepare('SELECT status, family, targetKind, targetId FROM agent_runs WHERE id = ?')
				.get('run-1') as
				| { status: string; family: string; targetKind: string; targetId: string }
				| undefined;
			expect(run).toEqual({
				status: 'waiting_for_review',
				family: 'outline',
				targetKind: 'project',
				targetId: 'project-1',
			});

			const linked = db
				.prepare(
					`SELECT artifactType, storageKind, domainType, domainId, contentHash
					 FROM agent_artifacts
					 WHERE id = ?`,
				)
				.get('artifact-1') as
				| {
						artifactType: string;
						storageKind: string;
						domainType: string;
						domainId: string;
						contentHash: string;
				  }
				| undefined;
			expect(linked).toEqual({
				artifactType: 'outline_checkpoint',
				storageKind: 'project_metadata',
				domainType: 'outline_checkpoint',
				domainId: 'checkpoint-1',
				contentHash: 'sha256:artifact',
			});

			const redaction = db
				.prepare('SELECT fieldPath, redactionType, reason FROM agent_trace_redactions WHERE id = ?')
				.get('redaction-1') as
				| { fieldPath: string; redactionType: string; reason: string }
				| undefined;
			expect(redaction?.fieldPath).toBe('metadata.prompt');
			expect(redaction?.redactionType).toBe('manuscript_text');
			expect(redaction?.reason).toContain('must not export manuscript text');
		} finally {
			db.close();
		}
	});

	it('rolls a pre-runtime-ledger database forward without losing existing metadata', () => {
		const db = new Database(':memory:');
		try {
			const preRuntimeRegistry = MIGRATION_REGISTRY.filter((migration) => migration.version < 6);
			runMigrations(db, preRuntimeRegistry);
			db.prepare(
				`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
				 VALUES (?, ?, ?, ?, ?, ?)`,
			).run(
				'project-1',
				'outline',
				'outline',
				'outlineDraftCheckpoints.v1',
				'{"checkpoints":[]}',
				'2026-06-14T21:45:00.000Z',
			);

			const result = runMigrations(db, MIGRATION_REGISTRY);

			expect(result.applied.map((migration) => migration.version)).toEqual([6, 7]);
			expect(
				db
					.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'agent_runs'")
					.get(),
			).toBeTruthy();
			expect(
				db
					.prepare(
						`SELECT value FROM project_metadata
						 WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?`,
					)
					.get('project-1', 'outline', 'outline', 'outlineDraftCheckpoints.v1'),
			).toEqual({ value: '{"checkpoints":[]}' });
		} finally {
			db.close();
		}
	});

	it('is idempotent when migration 0006 is forced to rerun', () => {
		const db = new Database(':memory:');
		try {
			runMigrations(db, MIGRATION_REGISTRY);
			db.prepare(
				`INSERT INTO agent_runs (
					id, family, entrypoint, status, targetJson, inputHash, contextHash, createdAt, updatedAt
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				'run-rerun',
				'worldbuild',
				'worldbuilding.scan',
				'completed',
				'{}',
				'sha256:input',
				'sha256:context',
				'2026-06-14T21:45:00.000Z',
				'2026-06-14T21:45:00.000Z',
			);

			db.exec('DELETE FROM schema_migrations WHERE version = 6');

			expect(() => runMigrations(db, MIGRATION_REGISTRY)).not.toThrow();
			expect(
				db.prepare('SELECT COUNT(*) AS count FROM agent_runs WHERE id = ?').get('run-rerun'),
			).toEqual({ count: 1 });
		} finally {
			db.close();
		}
	});
});
