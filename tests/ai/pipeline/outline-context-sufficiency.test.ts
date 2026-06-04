import { describe, expect, it } from 'vitest';
import {
	evaluateOutlineContextSufficiency,
	OUTLINE_CONTEXT_TEXT_SUMMARY_LIMIT,
} from '../../../src/lib/ai/pipeline/outline-context-sufficiency.js';
import { PIPELINE_TASK_KEYS } from '../../../src/lib/ai/pipeline/task-catalog.js';

function acceptedCheckpoint(taskKey: string, payload: Record<string, unknown>) {
	return {
		id: `checkpoint-${taskKey}`,
		projectId: 'project-1',
		ownerId: 'vibe-worldbuild',
		version: '1.0.0',
		lifecycle: 'accepted',
		taskKey,
		artifact: {
			id: `artifact-${taskKey}`,
			taskKey,
			payload,
			lifecycle: 'accepted',
		},
		createdAt: '2026-06-03T12:00:00.000Z',
		updatedAt: '2026-06-03T12:00:00.000Z',
		review: null,
		acceptance: null,
		rejection: null,
	};
}

describe('evaluateOutlineContextSufficiency', () => {
	it('blocks an empty project with structured missing prerequisite codes', () => {
		const result = evaluateOutlineContextSufficiency({});

		expect(result.ok).toBe(false);
		expect(result.missing.map((item) => item.code)).toEqual([
			'project_identity_missing',
			'story_premise_missing',
			'story_source_missing',
		]);
		expect(result.missing.every((item) => item.message.length > 0)).toBe(true);
		expect(result.summary.required.project_identity.present).toBe(false);
	});

	it('blocks a project that only has identity', () => {
		const result = evaluateOutlineContextSufficiency({
			project: { id: 'project-1', title: 'Storm Ledger' },
		});

		expect(result.ok).toBe(false);
		expect(result.missing.map((item) => item.code)).toEqual([
			'story_premise_missing',
			'story_source_missing',
		]);
		expect(result.summary.required.project_identity.present).toBe(true);
	});

	it('allows a project with a premise plus a character source', () => {
		const result = evaluateOutlineContextSufficiency({
			project: {
				id: 'project-1',
				title: 'Storm Ledger',
				logline: 'A courier must outrun a civil war to deliver the last weather map.',
			},
			worldbuilding: {
				characters: [{ id: 'char-1', name: 'Iri Vale' }],
			},
		});

		expect(result.ok).toBe(true);
		expect(result.missing).toEqual([]);
		expect(result.summary.project.premise?.sourceKind).toBe('project_logline');
		expect(result.summary.sourceCounts.characters).toBe(1);
	});

	it('allows a project with a premise plus a plot thread source', () => {
		const result = evaluateOutlineContextSufficiency({
			project: {
				id: 'project-1',
				title: 'Storm Ledger',
				synopsis: 'The city survives by rationing rain until a courier exposes the storm cartel.',
			},
			worldbuilding: {
				plotThreads: [{ id: 'thread-1', title: 'Expose the storm cartel' }],
			},
		});

		expect(result.ok).toBe(true);
		expect(result.summary.sourceCounts.plotThreads).toBe(1);
	});

	it('uses story-frame premise metadata when project prose fields are empty', () => {
		const result = evaluateOutlineContextSufficiency({
			project: {
				id: 'project-1',
				title: 'Storm Ledger',
				storyFrames: [{ premise: 'A city trades memories for rain until one courier breaks the market.' }],
			},
			worldbuilding: {
				characters: [{ name: 'Iri Vale' }],
			},
		});

		expect(result.ok).toBe(true);
		expect(result.summary.project.premise?.sourceKind).toBe('story_frame_premise');
	});

	it('counts accepted checkpoints when no canonical rows exist', () => {
		const result = evaluateOutlineContextSufficiency({
			project: { id: 'project-1', title: 'Storm Ledger' },
			worldbuilding: {
				acceptedCheckpoints: [
					acceptedCheckpoint(PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE, {
						hook: 'A failed courier steals rain from a city cartel.',
						coreConflict: 'Family survival collides with public rebellion.',
						readerPromise: 'A pressure-cooker heist outline with political fallout.',
					}),
					acceptedCheckpoint(PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_THREADS, {
						majorArcs: [{ title: 'Steal the storm ledger' }],
						subplots: [],
						motivations: [],
					}),
				],
			},
		});

		expect(result.ok).toBe(true);
		expect(result.summary.project.premise?.sourceKind).toBe('accepted_checkpoint_premise');
		expect(result.summary.sourceCounts.acceptedCheckpointPremises).toBe(1);
		expect(result.summary.sourceCounts.acceptedCheckpointPlotThreads).toBe(1);
	});

	it('counts accepted personae checkpoints as character sources', () => {
		const result = evaluateOutlineContextSufficiency({
			project: {
				id: 'project-1',
				title: 'Storm Ledger',
				logline: 'A courier must outrun a civil war to deliver the last weather map.',
			},
			worldbuilding: {
				acceptedCheckpoints: [
					acceptedCheckpoint(PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_PERSONAE, {
						individuals: [{ name: 'Iri Vale' }],
						factions: [{ name: 'Barometer Guild' }],
						relationships: [],
					}),
				],
			},
		});

		expect(result.ok).toBe(true);
		expect(result.summary.sourceCounts.acceptedCheckpointCharacters).toBe(1);
		expect(result.summary.enriching.factions.present).toBe(true);
	});

	it('ignores non-accepted checkpoints for required story sources', () => {
		const reviewCheckpoint = {
			...acceptedCheckpoint(PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_PERSONAE, {
				individuals: [{ name: 'Iri Vale' }],
			}),
			lifecycle: 'review',
		};

		const result = evaluateOutlineContextSufficiency({
			project: {
				id: 'project-1',
				title: 'Storm Ledger',
				logline: 'A courier must outrun a civil war to deliver the last weather map.',
			},
			worldbuilding: {
				acceptedCheckpoints: [reviewCheckpoint],
			},
		});

		expect(result.ok).toBe(false);
		expect(result.missing.map((item) => item.code)).toContain('story_source_missing');
		expect(result.summary.sourceCounts.characters).toBe(0);
	});

	it('summarizes and hash-references a long synopsis', () => {
		const longSynopsis = `A courier discovers the city weather cartel is lying. ${'Every district has a different debt and betrayal. '.repeat(80)}`;

		const result = evaluateOutlineContextSufficiency({
			project: {
				id: 'project-1',
				title: 'Storm Ledger',
				synopsis: longSynopsis,
			},
			worldbuilding: {
				characters: [{ name: 'Iri Vale' }],
			},
		});

		const premise = result.summary.project.premise;
		expect(result.ok).toBe(true);
		expect(premise?.sourceKind).toBe('project_synopsis');
		expect(premise?.value.truncated).toBe(true);
		expect(premise?.value.length).toBe(longSynopsis.trim().length);
		expect(premise?.value.hash).toMatch(/^[a-f0-9]{8}$/);
		expect(premise?.value.text.length).toBeLessThanOrEqual(OUTLINE_CONTEXT_TEXT_SUMMARY_LIMIT + 3);
	});

	it('ignores malformed legacy JSON with a UI-safe warning', () => {
		const result = evaluateOutlineContextSufficiency({
			project: {
				id: 'project-1',
				title: 'Storm Ledger',
				logline: 'A courier must outrun a civil war to deliver the last weather map.',
			},
			worldbuilding: {
				characters: [{ name: 'Iri Vale' }],
				legacyMetadataValues: ['{bad json'],
			},
		});

		expect(result.ok).toBe(true);
		expect(result.warnings).toEqual([
			{
				code: 'malformed_legacy_json',
				message: 'A saved worldbuilding source could not be read and was ignored.',
				source: 'legacyMetadataValues[0]',
			},
		]);
		expect(result.warnings[0]?.message).not.toContain('{bad json');
	});
});
