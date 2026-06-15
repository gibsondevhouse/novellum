import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { createRunLedgerRepository } from '$lib/server/agent-runtime/run-ledger.js';
import { captureTrace, TRACE_EVENT_TYPES, TraceMetadata } from '$lib/server/agent-runtime/trace.js';

describe('Agent Runtime Tracing', () => {
	let db: Database.Database;
	let repository: ReturnType<typeof createRunLedgerRepository>;

	beforeEach(() => {
		db = new Database(':memory:');
		// Minimal schema for testing
		db.exec(`
			CREATE TABLE agent_runs (
				id TEXT PRIMARY KEY,
				projectId TEXT,
				family TEXT NOT NULL,
				entrypoint TEXT,
				status TEXT NOT NULL,
				requestedBy TEXT,
				targetKind TEXT,
				targetId TEXT,
				modelProvider TEXT,
				modelId TEXT,
				modelCapabilitySnapshotId TEXT,
				targetJson TEXT,
				inputHash TEXT,
				contextHash TEXT,
				statusReason TEXT,
				errorCode TEXT,
				errorMessageRedacted TEXT,
				retryOfRunId TEXT,
				startedAt TEXT,
				completedAt TEXT,
				cancelledAt TEXT,
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			);
			CREATE TABLE agent_trace_events (
				id TEXT PRIMARY KEY,
				runId TEXT NOT NULL,
				stepId TEXT,
				sequence INTEGER NOT NULL,
				eventType TEXT NOT NULL,
				severity TEXT,
				message TEXT,
				metadataRedactedJson TEXT,
				redactionState TEXT,
				createdAt TEXT NOT NULL,
				FOREIGN KEY (runId) REFERENCES agent_runs(id)
			);
			CREATE TABLE agent_trace_redactions (
				id TEXT PRIMARY KEY,
				runId TEXT NOT NULL,
				traceEventId TEXT,
				fieldPath TEXT NOT NULL,
				redactionType TEXT NOT NULL,
				replacement TEXT,
				reason TEXT,
				createdAt TEXT NOT NULL,
				FOREIGN KEY (runId) REFERENCES agent_runs(id),
				FOREIGN KEY (traceEventId) REFERENCES agent_trace_events(id)
			);
		`);
		repository = createRunLedgerRepository(db);
	});

	it('should capture and redact trace events', () => {
		const run = repository.createRun({ family: 'test', status: 'running' });
		const metadata = {
			apiKey: 'sk-123456789', // Should be redacted
			prompt: 'Tell me a story about a dragon.', // Should be redacted by default policy if manuscript-like
			count: 100
		};

		const { event, redactions } = captureTrace(
			TRACE_EVENT_TYPES.PROVIDER_CALL,
			'Test provider call',
			metadata,
			{ runId: run.id, ledger: repository }
		);

		expect(event.eventType).toBe(TRACE_EVENT_TYPES.PROVIDER_CALL);
		expect(event.redactionState).toBe('redacted');
		
		const redactedJson = event.metadataRedactedJson as {
			apiKey?: string;
			prompt?: string;
			count?: number;
		};
		expect(redactedJson.apiKey).toBe('[redacted]');
		expect(redactedJson.prompt).toBe('[redacted]');
		expect(redactedJson.count).toBe(100);

		expect(redactions.length).toBeGreaterThanOrEqual(2);
		expect(redactions.find(r => r.fieldPath === '$.apiKey')).toBeDefined();
		expect(redactions.find(r => r.fieldPath === '$.prompt')).toBeDefined();
	});

	it('should use TraceMetadata helpers', () => {
		const run = repository.createRun({ family: 'test', status: 'running' });
		const metadata = TraceMetadata.providerCall('openrouter', 'gpt-4o', {
			messages: [{ role: 'user', content: 'Hello' }],
			apiKey: 'secret-key'
		});

		const { event } = captureTrace(
			TRACE_EVENT_TYPES.PROVIDER_CALL,
			'OpenRouter call',
			metadata,
			{ runId: run.id, ledger: repository }
		);

		const redactedJson = event.metadataRedactedJson as {
			providerId?: string;
			request?: { apiKey?: string };
		};
		expect(redactedJson.providerId).toBe('openrouter');
		expect(redactedJson.request?.apiKey).toBe('[redacted]');
	});
});
