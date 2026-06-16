import { describe, expect, it } from 'vitest';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import {
	actionRequiresDurableWrite,
	classifyNovaArtifactAction,
	createInsufficientContextResult,
	createNovaArtifactActionResult,
	createNovaArtifactActionTarget,
	createStaleTargetResult,
} from '$modules/nova';

const envelope: PipelineArtifactEnvelope<{ prose: string }> = {
	id: 'artifact-1',
	taskKey: 'vibe-author.scene-draft',
	pipeline: 'vibe-author',
	stage: 'scene-draft',
	model: 'test-model',
	lifecycle: 'draft',
	parserVersion: '1.0.0',
	producedAt: '2026-06-15T12:00:00.000Z',
	hierarchy: {
		order: ['arcs', 'acts', 'milestones', 'chapters', 'scenes', 'beats', 'stages'],
		references: {
			arcs: [],
			acts: [],
			milestones: [],
			chapters: [],
			scenes: ['scene-1'],
			beats: [],
			stages: [],
		},
		stageStatusById: {},
	},
	payload: { prose: 'Draft text' },
	notes: [],
};

describe('Nova artifact action contract', () => {
	it('classifies review decisions, acknowledgements, and local utilities', () => {
		expect(classifyNovaArtifactAction('author-scene-draft', 'accept')).toBe('review_decision');
		expect(classifyNovaArtifactAction('author-scene-draft', 'reject')).toBe('review_decision');
		expect(classifyNovaArtifactAction('author-revision-pack', 'acknowledge')).toBe(
			'non_mutating_acknowledgement',
		);
		expect(classifyNovaArtifactAction('author-outline', 'copy')).toBe('local_utility');
	});

	it('marks review decisions and acknowledgements as durable-write actions', () => {
		expect(actionRequiresDurableWrite('review_decision')).toBe(true);
		expect(actionRequiresDurableWrite('non_mutating_acknowledgement')).toBe(true);
		expect(actionRequiresDurableWrite('local_utility')).toBe(false);
	});

	it('creates a stable target from an artifact envelope', () => {
		expect(
			createNovaArtifactActionTarget({
				artifactKind: 'author-scene-draft',
				envelope,
				projectId: 'project-1',
				sceneId: 'scene-1',
				checkpointId: 'checkpoint-1',
			}),
		).toEqual({
			artifactId: 'artifact-1',
			artifactKind: 'author-scene-draft',
			taskKey: 'vibe-author.scene-draft',
			projectId: 'project-1',
			sceneId: 'scene-1',
			checkpointId: 'checkpoint-1',
			issueId: null,
			producedAt: '2026-06-15T12:00:00.000Z',
		});
	});

	it('returns user-safe fallback results for blocked actions', () => {
		const insufficient = createInsufficientContextResult({
			action: 'accept',
			classification: 'review_decision',
			artifactKind: 'author-scene-draft',
			envelope,
			reason: 'Open the target scene before accepting this draft.',
		});

		expect(insufficient).toMatchObject({
			action: 'accept',
			classification: 'review_decision',
			status: 'insufficient_context',
			durability: 'not_started',
			errorCode: 'insufficient_context',
			message: 'Open the target scene before accepting this draft.',
		});

		const stale = createStaleTargetResult({
			action: 'accept',
			classification: 'review_decision',
			artifactKind: 'author-scene-draft',
			envelope,
		});

		expect(stale.status).toBe('stale_target');
		expect(stale.errorCode).toBe('stale_target');
		expect(stale.message).toContain('target changed');
	});

	it('carries serializable audit metadata without server imports', () => {
		const result = createNovaArtifactActionResult({
			action: 'acknowledge',
			classification: 'non_mutating_acknowledgement',
			artifactKind: 'author-revision-pack',
			envelope,
			issueId: 'issue-1',
			status: 'succeeded',
			durability: 'durable',
			message: 'Acknowledged.',
			audit: {
				intent: 'artifact.acknowledge',
				runId: 'run-1',
				controllerArtifactId: 'controller-artifact-1',
			},
		});

		expect(result.audit).toEqual({
			intent: 'artifact.acknowledge',
			runId: 'run-1',
			controllerArtifactId: 'controller-artifact-1',
		});
		expect(result.target.issueId).toBe('issue-1');
	});
});
