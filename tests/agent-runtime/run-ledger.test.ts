import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { MIGRATION_REGISTRY, runMigrations } from '$lib/server/db';
import {
	AgentRunLedgerError,
	createRunLedgerRepository,
	type RunLedgerRepository,
} from '$lib/server/agent-runtime';

const NOW = '2026-06-14T22:00:00.000Z';

function createHarness(): { db: Database.Database; repository: RunLedgerRepository } {
	const db = new Database(':memory:');
	runMigrations(db, MIGRATION_REGISTRY);
	let id = 0;
	return {
		db,
		repository: createRunLedgerRepository(db, {
			now: () => NOW,
			createId: () => `generated-${++id}`,
		}),
	};
}

describe('run ledger repository', () => {
	it('creates a run and appends all core runtime records', () => {
		const { db, repository } = createHarness();
		try {
			const run = repository.createRun({
				id: 'run-1',
				projectId: 'project-1',
				family: 'outline',
				entrypoint: 'outline.generate',
				targetKind: 'project',
				targetId: 'project-1',
				modelProvider: 'openrouter',
				modelId: 'model-a',
				targetJson: { scope: 'project' },
				inputHash: 'sha256:input',
				contextHash: 'sha256:context',
			});

			expect(run).toMatchObject({
				id: 'run-1',
				projectId: 'project-1',
				status: 'pending',
				targetJson: { scope: 'project' },
			});

			const step = repository.appendStep({
				id: 'step-1',
				runId: run.id,
				kind: 'model_call',
				status: 'completed',
				source: 'outlineDraftCheckpoints.v1',
				inputHash: 'sha256:step-input',
				outputHash: 'sha256:step-output',
			});
			expect(step.sequence).toBe(1);

			const artifact = repository.linkArtifact({
				id: 'artifact-1',
				runId: run.id,
				stepId: step.id,
				artifactType: 'outline_checkpoint',
				reviewState: 'pending',
				storageKind: 'project_metadata',
				storageProjectId: 'project-1',
				storageOwnerId: 'outline',
				storageKey: 'outlineDraftCheckpoints.v1',
				storageRefJson: {
					projectId: 'project-1',
					scope: 'outline',
					ownerId: 'outline',
					key: 'outlineDraftCheckpoints.v1',
				},
				domainType: 'outline_checkpoint',
				domainId: 'checkpoint-1',
				summary: 'Pending outline checkpoint.',
				contentHash: 'sha256:artifact',
				sourceStatus: 'waiting_for_review',
			});
			expect(artifact.storageRefJson).toMatchObject({ key: 'outlineDraftCheckpoints.v1' });

			const toolCall = repository.captureToolCall({
				id: 'tool-1',
				runId: run.id,
				stepId: step.id,
				invocationId: 'invoke-1',
				toolId: 'outlineDraft.accept_checkpoint',
				capability: 'review_decision',
				caller: 'agent-loop',
				status: 'blocked_by_review',
				sourceStatus: 'waiting_for_review',
				input: { checkpointId: 'checkpoint-1', prompt: 'accept this full draft' },
				output: { content: 'draft body', reason: 'human_accept_required' },
				artifactId: artifact.id,
			});
			expect(toolCall.inputRedactedJson).toEqual({
				checkpointId: 'checkpoint-1',
				prompt: '[redacted]',
			});
			expect(toolCall.outputRedactedJson).toEqual({
				content: '[redacted]',
				reason: 'human_accept_required',
			});

			const usage = repository.recordUsage({
				id: 'usage-1',
				runId: run.id,
				stepId: step.id,
				providerId: 'openrouter',
				modelId: 'model-a',
				promptChars: 1200,
				completionChars: 400,
				estimatedPromptTokens: 300,
				estimatedCompletionTokens: 100,
				estimatedTotalTokens: 400,
				estimatedCostUsd: 0.002,
				usageConfidence: 'estimated',
			});
			expect(usage.estimatedTotalTokens).toBe(400);

			const job = repository.createJob({
				id: 'job-1',
				runId: run.id,
				projectId: 'project-1',
				jobType: 'outline.generate',
				status: 'queued',
				priority: 10,
				payload: { projectId: 'project-1', content: 'do not export this manuscript text' },
				payloadHash: 'sha256:payload',
			});
			expect(job.payloadRedactedJson).toEqual({
				projectId: 'project-1',
				content: '[redacted]',
			});

			const capturedError = repository.captureError({
				id: 'error-1',
				runId: run.id,
				stepId: step.id,
				jobId: job.id,
				errorCode: 'outline_conflict',
				errorKind: 'validation',
				errorMessageRedacted: 'Checkpoint already superseded.',
				retryable: true,
				details: { checkpointId: 'checkpoint-1', rawOutput: 'full model output' },
			});
			expect(capturedError.retryable).toBe(true);
			expect(capturedError.detailsRedactedJson).toEqual({
				checkpointId: 'checkpoint-1',
				rawOutput: '[redacted]',
			});

			const trace = repository.appendTraceEvent({
				id: 'trace-1',
				runId: run.id,
				stepId: step.id,
				eventType: 'model_response',
				message: 'Captured redacted model response metadata.',
				metadata: { prompt: 'full prompt', safe: 'kept' },
			});
			expect(trace.event.metadataRedactedJson).toEqual({ prompt: '[redacted]', safe: 'kept' });
			expect(trace.redactions).toHaveLength(1);

			const redactedTrace = repository.redactTraceEvent(trace.event.id, {
				metadata: { content: 'scene body', nested: { token: 'secret-token' } },
				reason: 'manual redaction refresh',
			});
			expect(redactedTrace.event.metadataRedactedJson).toEqual({
				content: '[redacted]',
				nested: { token: '[redacted]' },
			});
			expect(redactedTrace.redactions).toHaveLength(2);
			expect(redactedTrace.redactions.every((redaction) => redaction.reason === 'manual redaction refresh')).toBe(
				true,
			);

			const details = repository.getRunDetails(run.id);
			expect(details?.steps).toHaveLength(1);
			expect(details?.toolCalls).toHaveLength(1);
			expect(details?.artifacts).toHaveLength(1);
			expect(details?.usage).toHaveLength(1);
			expect(details?.errors).toHaveLength(1);
			expect(details?.jobs).toHaveLength(1);
			expect(details?.traceEvents).toHaveLength(1);
			expect(details?.traceRedactions).toHaveLength(2);
		} finally {
			db.close();
		}
	});

	it('enforces run lifecycle transitions', () => {
		const { db, repository } = createHarness();
		try {
			repository.createRun({ id: 'run-1', family: 'author-draft' });

			expect(() => repository.transitionRun('run-1', 'completed')).toThrow(AgentRunLedgerError);

			const running = repository.transitionRun('run-1', 'running');
			expect(running.startedAt).toBe(NOW);

			const review = repository.transitionRun('run-1', 'waiting_for_review', {
				statusReason: 'checkpoint pending',
			});
			expect(review.statusReason).toBe('checkpoint pending');

			const completed = repository.transitionRun('run-1', 'completed');
			expect(completed.completedAt).toBe(NOW);

			try {
				repository.transitionRun('run-1', 'running');
				throw new Error('expected invalid transition');
			} catch (err) {
				expect(err).toBeInstanceOf(AgentRunLedgerError);
				expect((err as AgentRunLedgerError).code).toBe('invalid_transition');
			}
		} finally {
			db.close();
		}
	});

	it('queries runs by project, status, and family', () => {
		const { db, repository } = createHarness();
		try {
			repository.createRun({
				id: 'run-outline',
				projectId: 'project-1',
				family: 'outline',
				status: 'pending',
			});
			repository.createRun({
				id: 'run-worldbuild',
				projectId: 'project-1',
				family: 'worldbuild',
				status: 'running',
			});
			repository.createRun({
				id: 'run-other',
				projectId: 'project-2',
				family: 'outline',
				status: 'pending',
			});

			expect(
				repository
					.listRuns({ projectId: 'project-1', status: 'pending' })
					.map((run) => run.id),
			).toEqual(['run-outline']);
			expect(repository.listRuns({ family: 'outline' }).map((run) => run.id)).toEqual(
				expect.arrayContaining(['run-outline', 'run-other']),
			);
			expect(repository.listRuns({ limit: 1 })).toHaveLength(1);
		} finally {
			db.close();
		}
	});

	it('rejects writes that reference a missing run', () => {
		const { db, repository } = createHarness();
		try {
			expect(() =>
				repository.appendStep({
					runId: 'missing-run',
					kind: 'model_call',
					status: 'running',
				}),
			).toThrow(AgentRunLedgerError);
		} finally {
			db.close();
		}
	});
});
