import { describe, expect, expectTypeOf, it } from 'vitest';
import {
	AI_CONTROLLER_ARTIFACT_STATUSES,
	AI_CONTROLLER_ERROR_CODES,
	AI_CONTROLLER_REQUEST_SOURCES,
	AI_CONTROLLER_TASK_STATUSES,
	AI_CONTROLLER_TARGET_KINDS,
	TERMINAL_AI_CONTROLLER_TASK_STATUSES,
	isTerminalAiControllerTaskStatus,
	type AiControllerJsonValue,
	type AiControllerRequest,
	type AiControllerResponse,
	type AiControllerTaskStatus,
	type TerminalAiControllerTaskStatus,
} from '../../../src/lib/server/ai/controller/contracts.js';

function expectUnique(values: readonly string[]): void {
	expect(new Set(values).size).toBe(values.length);
}

describe('AI controller contracts', () => {
	it('publishes stable request, status, artifact, and error taxonomies', () => {
		expectUnique(AI_CONTROLLER_TASK_STATUSES);
		expectUnique(TERMINAL_AI_CONTROLLER_TASK_STATUSES);
		expectUnique(AI_CONTROLLER_REQUEST_SOURCES);
		expectUnique(AI_CONTROLLER_TARGET_KINDS);
		expectUnique(AI_CONTROLLER_ARTIFACT_STATUSES);
		expectUnique(AI_CONTROLLER_ERROR_CODES);

		expect(AI_CONTROLLER_TASK_STATUSES).toEqual(
			expect.arrayContaining([
				'received',
				'policy_check',
				'calling_model',
				'validating_output',
				'awaiting_review',
				'accepted',
				'rejected',
				'blocked',
				'failed',
			]),
		);
		expect(AI_CONTROLLER_REQUEST_SOURCES).toEqual(
			expect.arrayContaining(['nova', 'editor', 'outline', 'worldbuilding', 'api']),
		);
		expect(AI_CONTROLLER_ERROR_CODES).toEqual(
			expect.arrayContaining(['policy_denied', 'missing_context', 'invalid_model_output']),
		);
	});

	it('identifies terminal controller statuses without treating review as terminal', () => {
		expect(isTerminalAiControllerTaskStatus('awaiting_review')).toBe(false);
		expect(isTerminalAiControllerTaskStatus('accepted')).toBe(true);
		expect(isTerminalAiControllerTaskStatus('failed')).toBe(true);

		const status: AiControllerTaskStatus = 'completed';
		if (isTerminalAiControllerTaskStatus(status)) {
			expectTypeOf(status).toMatchTypeOf<TerminalAiControllerTaskStatus>();
		}
	});

	it('models a server-side controller request without provider payload leakage', () => {
		const request = {
			requestId: 'request-1',
			projectId: 'project-1',
			requestedBy: 'user',
			action: {
				source: 'nova',
				id: 'authorDraft.generate_scene_draft_checkpoint',
				instruction: 'Draft a revision for the current scene.',
				payload: {
					mode: 'write',
					intent: 'revision',
				},
			},
			target: {
				kind: 'scene',
				id: 'scene-1',
				projectId: 'project-1',
			},
			contextRefs: [
				{
					kind: 'scene',
					id: 'scene-1',
					projectId: 'project-1',
					relevance: 'required',
					reason: 'Active drafting target',
				},
			],
			createdAt: '2026-06-15T12:00:00.000Z',
			metadata: {
				route: '/projects/project-1/write/scene-1',
			},
		} satisfies AiControllerRequest;

		expect(request.action.source).toBe('nova');
		expect(request.target.kind).toBe('scene');
		expectTypeOf(request.metadata).toMatchTypeOf<AiControllerJsonValue | undefined>();
	});

	it('uses an ok-discriminated response envelope for review artifacts and failures', () => {
		const reviewResponse: AiControllerResponse<{ title: string }> = {
			ok: true,
			requestId: 'request-1',
			status: 'awaiting_review',
			runtime: {
				runId: 'run-1',
				jobId: 'job-1',
			},
			artifact: {
				id: 'artifact-1',
				type: 'author_draft_checkpoint',
				status: 'review',
				projectId: 'project-1',
				ownerId: 'authorDraftCheckpoints.v1',
				key: 'checkpoint-1',
				schemaVersion: '1',
			},
			output: {
				title: 'Revision checkpoint',
			},
		};

		const blockedResponse: AiControllerResponse = {
			ok: false,
			requestId: 'request-2',
			status: 'blocked',
			error: {
				code: 'policy_denied',
				message: 'Human approval is required before applying this mutation.',
				retryable: false,
			},
		};

		if (reviewResponse.ok) {
			expect(reviewResponse.artifact?.status).toBe('review');
			expect(reviewResponse.output?.title).toBe('Revision checkpoint');
		}
		if (!blockedResponse.ok) {
			expect(blockedResponse.error.code).toBe('policy_denied');
		}
	});
});
