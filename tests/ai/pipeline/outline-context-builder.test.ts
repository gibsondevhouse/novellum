import { describe, expect, it } from 'vitest';
import type { AiContext } from '../../../src/lib/ai/types.js';
import {
	buildOutlineContextPacket,
	buildOutlineContextPacketFromAiContext,
} from '../../../src/lib/ai/pipeline/outline-context-builder.js';
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

const baseProject = {
	id: 'project-1',
	title: 'Storm Ledger',
	genre: 'climate noir',
	logline: 'A courier must outrun a civil war to deliver the last weather map.',
	synopsis: 'The city survives by rationing rain until a courier exposes the storm cartel.',
	targetWordCount: 85_000,
	status: 'planning',
	projectType: 'novel',
};

describe('buildOutlineContextPacket', () => {
	it('is deterministic for stable inputs', () => {
		const input = {
			project: baseProject,
			storyFrames: [
				{
					id: 'frame-1',
					premise: 'A city trades memories for rain.',
					theme: 'Control versus freedom',
					toneNotes: 'Haunted but propulsive',
				},
			],
			worldbuilding: {
				characters: [
					{ id: 'char-2', name: 'Mara Kett', role: 'Cartel heir', bio: 'Knows the vault routes.' },
					{ id: 'char-1', name: 'Iri Vale', role: 'Courier', coreDesire: 'Save her district.' },
				],
				plotThreads: [{ id: 'thread-1', title: 'Steal the storm ledger', description: 'Break the cartel ledger.' }],
				locations: [{ id: 'loc-1', name: 'Skymarket', description: 'A vertical bazaar above floodline.' }],
			},
		};

		const first = buildOutlineContextPacket(input);
		const second = buildOutlineContextPacket(input);

		expect(first).toEqual(second);
		expect(first.contextHash).toBe(second.contextHash);
		expect(first.worldbuilding.characters.map((entry) => entry.label)).toEqual([
			'Iri Vale',
			'Mara Kett',
		]);
	});

	it('never includes full manuscript scene content', () => {
		const packet = buildOutlineContextPacket({
			project: baseProject,
			worldbuilding: {
				characters: [{ id: 'char-1', name: 'Iri Vale' }],
			},
			outlineHierarchy: {
				scenes: [
					{
						id: 'scene-1',
						title: 'Draft scene',
						content: 'SECRET MANUSCRIPT TEXT SHOULD NOT LEAK',
					},
				],
			},
		});

		expect(JSON.stringify(packet)).not.toContain('SECRET MANUSCRIPT TEXT SHOULD NOT LEAK');
	});

	it('includes source references for canonical rows and accepted checkpoints', () => {
		const packet = buildOutlineContextPacket({
			project: baseProject,
			worldbuilding: {
				characters: [{ id: 'char-1', name: 'Iri Vale', role: 'Courier' }],
				acceptedCheckpoints: [
					acceptedCheckpoint(PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_PERSONAE, {
						individuals: [{ name: 'Mara Kett', role: 'Cartel heir' }],
						factions: [{ name: 'Barometer Guild', mission: 'Control weather access.' }],
						relationships: [],
					}),
				],
			},
		});

		expect(packet.readiness.ok).toBe(true);
		expect(packet.worldbuilding.characters.map((entry) => entry.sourceKind).sort()).toEqual([
			'canonical',
			'checkpoint',
		]);
		expect(packet.sourceReferences.some((ref) => ref.kind === 'canonical')).toBe(true);
		expect(packet.sourceReferences.some((ref) => ref.kind === 'checkpoint')).toBe(true);
		expect(packet.worldbuilding.checkpointSummaries[0]?.taskKey).toBe(
			PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_PERSONAE,
		);
	});

	it('supports accepted checkpoint-only projects', () => {
		const packet = buildOutlineContextPacket({
			project: { id: 'project-1', title: 'Storm Ledger' },
			worldbuilding: {
				acceptedCheckpoints: [
					acceptedCheckpoint(PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE, {
						hook: 'A failed courier steals rain from a city cartel.',
						coreConflict: 'Family survival collides with public rebellion.',
						readerPromise: 'A pressure-cooker heist outline with political fallout.',
					}),
					acceptedCheckpoint(PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_THREADS, {
						majorArcs: [{ title: 'Steal the storm ledger', description: 'Break cartel control.' }],
						subplots: [],
						motivations: [],
					}),
				],
			},
		});

		expect(packet.readiness.ok).toBe(true);
		expect(packet.worldbuilding.plotThreads).toHaveLength(1);
		expect(packet.worldbuilding.checkpointSummaries).toHaveLength(2);
	});

	it('trims lower-priority sources when the packet exceeds budget', () => {
		const loreEntries = Array.from({ length: 40 }, (_, index) => ({
			id: `lore-${index}`,
			title: `Lore ${index}`,
			content: `Long lore entry ${index}. ${'Secondary world detail. '.repeat(12)}`,
		}));

		const packet = buildOutlineContextPacket(
			{
				project: baseProject,
				worldbuilding: {
					characters: [{ id: 'char-1', name: 'Iri Vale', role: 'Courier' }],
					plotThreads: [{ id: 'thread-1', title: 'Steal the storm ledger' }],
					loreEntries,
				},
			},
			{ charBudget: 2_800 },
		);

		expect(packet.budget.truncated).toBe(true);
		expect(packet.budget.omittedSourceCount).toBeGreaterThan(0);
		expect(packet.worldbuilding.characters).toHaveLength(1);
		expect(packet.worldbuilding.plotThreads).toHaveLength(1);
		expect(packet.worldbuilding.loreEntries.length).toBeLessThan(loreEntries.length);
	});

	it('builds from AiContext and accepted checkpoint options', () => {
		const context = {
			policy: 'outline_scope',
			scene: null,
			adjacentScenes: [],
			chapter: null,
			beats: [],
			characters: [{ id: 'char-1', name: 'Iri Vale', role: 'Courier' }],
			locations: [],
			loreEntries: [],
			plotThreads: [],
			project: baseProject,
			storyFrames: [],
			timelineEvents: [],
			characterRelationships: [],
			factions: [],
			themes: [],
			glossaryTerms: [],
			outlineHierarchy: {
				arcs: [],
				acts: [],
				milestones: [],
				chapters: [],
				scenes: [
					{
						id: 'scene-1',
						chapterId: 'chapter-1',
						projectId: 'project-1',
						title: 'Draft scene',
						content: 'SECRET MANUSCRIPT TEXT SHOULD NOT LEAK',
					},
				],
				beats: [],
				stages: [],
			},
		} as unknown as AiContext;

		const packet = buildOutlineContextPacketFromAiContext(context, {
			acceptedCheckpoints: [
				acceptedCheckpoint(PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_THREADS, {
					majorArcs: [{ title: 'Steal the storm ledger' }],
					subplots: [],
					motivations: [],
				}),
			],
		});

		expect(packet.readiness.ok).toBe(true);
		expect(packet.worldbuilding.plotThreads[0]?.sourceKind).toBe('checkpoint');
		expect(JSON.stringify(packet)).not.toContain('SECRET MANUSCRIPT TEXT SHOULD NOT LEAK');
	});
});
