import type { Migration } from '../migration-runner.js';

/**
 * Migration 0006: Agent runtime ledger.
 *
 * Adds durable metadata tables for local-first agent runs, tool calls,
 * background jobs, usage, diagnostics, and redacted trace records.
 */
export const migration0006: Migration = {
	version: 6,
	name: '0006_agent_runtime_ledger',
	checksum: 'agent-runtime-ledger-v1',
	up(db) {
		db.exec(`
			CREATE TABLE IF NOT EXISTS agent_runs (
				id TEXT PRIMARY KEY,
				projectId TEXT,
				family TEXT NOT NULL,
				entrypoint TEXT NOT NULL DEFAULT '',
				status TEXT NOT NULL,
				requestedBy TEXT NOT NULL DEFAULT 'user',
				targetKind TEXT NOT NULL DEFAULT '',
				targetId TEXT NOT NULL DEFAULT '',
				modelProvider TEXT NOT NULL DEFAULT '',
				modelId TEXT NOT NULL DEFAULT '',
				modelCapabilitySnapshotId TEXT,
				targetJson TEXT NOT NULL DEFAULT '{}',
				inputHash TEXT NOT NULL DEFAULT '',
				contextHash TEXT NOT NULL DEFAULT '',
				statusReason TEXT NOT NULL DEFAULT '',
				errorCode TEXT NOT NULL DEFAULT '',
				errorMessageRedacted TEXT NOT NULL DEFAULT '',
				retryOfRunId TEXT,
				startedAt TEXT,
				completedAt TEXT,
				cancelledAt TEXT,
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			);
		`);

		db.exec(`
			CREATE TABLE IF NOT EXISTS agent_run_steps (
				id TEXT PRIMARY KEY,
				runId TEXT NOT NULL,
				sequence INTEGER NOT NULL,
				parentStepId TEXT,
				kind TEXT NOT NULL,
				status TEXT NOT NULL,
				source TEXT NOT NULL DEFAULT '',
				inputHash TEXT NOT NULL DEFAULT '',
				outputHash TEXT NOT NULL DEFAULT '',
				usageId TEXT,
				artifactId TEXT,
				errorCode TEXT NOT NULL DEFAULT '',
				errorMessageRedacted TEXT NOT NULL DEFAULT '',
				startedAt TEXT,
				completedAt TEXT,
				elapsedMs INTEGER NOT NULL DEFAULT 0,
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			);
		`);

		db.exec(`
			CREATE TABLE IF NOT EXISTS agent_tool_calls (
				id TEXT PRIMARY KEY,
				runId TEXT NOT NULL,
				stepId TEXT,
				invocationId TEXT NOT NULL DEFAULT '',
				toolId TEXT NOT NULL,
				capability TEXT NOT NULL DEFAULT '',
				caller TEXT NOT NULL DEFAULT '',
				status TEXT NOT NULL,
				sourceStatus TEXT NOT NULL DEFAULT '',
				inputRedactedJson TEXT NOT NULL DEFAULT '{}',
				outputRedactedJson TEXT NOT NULL DEFAULT '{}',
				inputHash TEXT NOT NULL DEFAULT '',
				outputHash TEXT NOT NULL DEFAULT '',
				artifactId TEXT,
				errorCode TEXT NOT NULL DEFAULT '',
				errorMessageRedacted TEXT NOT NULL DEFAULT '',
				startedAt TEXT,
				completedAt TEXT,
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			);
		`);

		db.exec(`
			CREATE TABLE IF NOT EXISTS agent_artifacts (
				id TEXT PRIMARY KEY,
				runId TEXT NOT NULL,
				stepId TEXT,
				artifactType TEXT NOT NULL,
				reviewState TEXT NOT NULL DEFAULT '',
				storageKind TEXT NOT NULL DEFAULT '',
				storageProjectId TEXT,
				storageOwnerId TEXT,
				storageKey TEXT NOT NULL DEFAULT '',
				storageRefJson TEXT NOT NULL DEFAULT '{}',
				domainType TEXT NOT NULL DEFAULT '',
				domainId TEXT NOT NULL DEFAULT '',
				domainVersion TEXT NOT NULL DEFAULT '',
				schemaVersion TEXT NOT NULL DEFAULT '1',
				summary TEXT NOT NULL DEFAULT '',
				contentHash TEXT NOT NULL DEFAULT '',
				sourceStatus TEXT NOT NULL DEFAULT '',
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			);
		`);

		db.exec(`
			CREATE TABLE IF NOT EXISTS agent_usage (
				id TEXT PRIMARY KEY,
				runId TEXT NOT NULL,
				stepId TEXT,
				providerId TEXT NOT NULL DEFAULT '',
				modelId TEXT NOT NULL DEFAULT '',
				usageKind TEXT NOT NULL DEFAULT 'estimate',
				promptChars INTEGER NOT NULL DEFAULT 0,
				completionChars INTEGER NOT NULL DEFAULT 0,
				estimatedPromptTokens INTEGER NOT NULL DEFAULT 0,
				estimatedCompletionTokens INTEGER NOT NULL DEFAULT 0,
				estimatedTotalTokens INTEGER NOT NULL DEFAULT 0,
				estimatedCostUsd REAL NOT NULL DEFAULT 0,
				providerPromptTokens INTEGER,
				providerCompletionTokens INTEGER,
				providerTotalTokens INTEGER,
				providerCostUsd REAL,
				finishReason TEXT NOT NULL DEFAULT '',
				usageConfidence TEXT NOT NULL DEFAULT '',
				createdAt TEXT NOT NULL
			);
		`);

		db.exec(`
			CREATE TABLE IF NOT EXISTS agent_run_errors (
				id TEXT PRIMARY KEY,
				runId TEXT NOT NULL,
				stepId TEXT,
				jobId TEXT,
				errorCode TEXT NOT NULL,
				errorKind TEXT NOT NULL DEFAULT '',
				errorMessageRedacted TEXT NOT NULL DEFAULT '',
				retryable INTEGER NOT NULL DEFAULT 0,
				detailsRedactedJson TEXT NOT NULL DEFAULT '{}',
				createdAt TEXT NOT NULL
			);
		`);

		db.exec(`
			CREATE TABLE IF NOT EXISTS agent_jobs (
				id TEXT PRIMARY KEY,
				runId TEXT,
				projectId TEXT,
				jobType TEXT NOT NULL,
				status TEXT NOT NULL,
				priority INTEGER NOT NULL DEFAULT 0,
				runAfter TEXT,
				lockedAt TEXT,
				lockedBy TEXT NOT NULL DEFAULT '',
				lockExpiresAt TEXT,
				heartbeatAt TEXT,
				attempt INTEGER NOT NULL DEFAULT 0,
				maxAttempts INTEGER NOT NULL DEFAULT 1,
				retryOfJobId TEXT,
				payloadRedactedJson TEXT NOT NULL DEFAULT '{}',
				payloadHash TEXT NOT NULL DEFAULT '',
				resultArtifactId TEXT,
				progressCurrent INTEGER NOT NULL DEFAULT 0,
				progressTotal INTEGER NOT NULL DEFAULT 0,
				progressLabel TEXT NOT NULL DEFAULT '',
				startedAt TEXT,
				completedAt TEXT,
				cancelledAt TEXT,
				errorCode TEXT NOT NULL DEFAULT '',
				errorMessageRedacted TEXT NOT NULL DEFAULT '',
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			);
		`);

		db.exec(`
			CREATE TABLE IF NOT EXISTS agent_trace_events (
				id TEXT PRIMARY KEY,
				runId TEXT NOT NULL,
				stepId TEXT,
				sequence INTEGER NOT NULL,
				eventType TEXT NOT NULL,
				severity TEXT NOT NULL DEFAULT 'info',
				message TEXT NOT NULL DEFAULT '',
				metadataRedactedJson TEXT NOT NULL DEFAULT '{}',
				redactionState TEXT NOT NULL DEFAULT 'redacted',
				createdAt TEXT NOT NULL
			);
		`);

		db.exec(`
			CREATE TABLE IF NOT EXISTS agent_trace_redactions (
				id TEXT PRIMARY KEY,
				runId TEXT NOT NULL,
				traceEventId TEXT,
				fieldPath TEXT NOT NULL,
				redactionType TEXT NOT NULL,
				replacement TEXT NOT NULL DEFAULT '',
				reason TEXT NOT NULL DEFAULT '',
				createdAt TEXT NOT NULL
			);
		`);

		db.exec(`
			CREATE INDEX IF NOT EXISTS idx_agent_runs_project_status ON agent_runs(projectId, status);
			CREATE INDEX IF NOT EXISTS idx_agent_runs_family_createdAt ON agent_runs(family, createdAt);
			CREATE INDEX IF NOT EXISTS idx_agent_runs_status_updatedAt ON agent_runs(status, updatedAt);
			CREATE INDEX IF NOT EXISTS idx_agent_runs_target ON agent_runs(projectId, targetKind, targetId);
			CREATE INDEX IF NOT EXISTS idx_agent_runs_retryOfRunId ON agent_runs(retryOfRunId);
			CREATE INDEX IF NOT EXISTS idx_agent_run_steps_run_sequence ON agent_run_steps(runId, sequence);
			CREATE INDEX IF NOT EXISTS idx_agent_run_steps_status_kind ON agent_run_steps(status, kind);
			CREATE INDEX IF NOT EXISTS idx_agent_run_steps_artifactId ON agent_run_steps(artifactId);
			CREATE INDEX IF NOT EXISTS idx_agent_tool_calls_run ON agent_tool_calls(runId);
			CREATE INDEX IF NOT EXISTS idx_agent_tool_calls_tool_status ON agent_tool_calls(toolId, status);
			CREATE INDEX IF NOT EXISTS idx_agent_tool_calls_artifactId ON agent_tool_calls(artifactId);
			CREATE INDEX IF NOT EXISTS idx_agent_artifacts_run ON agent_artifacts(runId);
			CREATE INDEX IF NOT EXISTS idx_agent_artifacts_type_state ON agent_artifacts(artifactType, reviewState);
			CREATE INDEX IF NOT EXISTS idx_agent_artifacts_storage ON agent_artifacts(storageKind, storageProjectId, storageOwnerId, storageKey);
			CREATE INDEX IF NOT EXISTS idx_agent_artifacts_domain ON agent_artifacts(domainType, domainId);
			CREATE INDEX IF NOT EXISTS idx_agent_usage_run ON agent_usage(runId);
			CREATE INDEX IF NOT EXISTS idx_agent_run_errors_run ON agent_run_errors(runId);
			CREATE INDEX IF NOT EXISTS idx_agent_run_errors_code ON agent_run_errors(errorCode);
			CREATE INDEX IF NOT EXISTS idx_agent_jobs_project_status ON agent_jobs(projectId, status);
			CREATE INDEX IF NOT EXISTS idx_agent_jobs_status_runAfter ON agent_jobs(status, runAfter);
			CREATE INDEX IF NOT EXISTS idx_agent_jobs_lockExpiresAt ON agent_jobs(lockExpiresAt);
			CREATE INDEX IF NOT EXISTS idx_agent_jobs_runId ON agent_jobs(runId);
			CREATE INDEX IF NOT EXISTS idx_agent_jobs_resultArtifactId ON agent_jobs(resultArtifactId);
			CREATE INDEX IF NOT EXISTS idx_agent_trace_events_run_sequence ON agent_trace_events(runId, sequence);
			CREATE INDEX IF NOT EXISTS idx_agent_trace_redactions_run ON agent_trace_redactions(runId);
			CREATE INDEX IF NOT EXISTS idx_agent_trace_redactions_event ON agent_trace_redactions(traceEventId);
		`);
	},
};
