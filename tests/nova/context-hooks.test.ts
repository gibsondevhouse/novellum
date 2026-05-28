/**
 * plan-023 stage-005 phase-006 — Real RAG context hook tests.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AiContext } from '$lib/ai/types.js';

const buildContextMock = vi.fn();

vi.mock('$lib/ai/context-engine.js', () => ({
	buildContext: (...args: unknown[]) => buildContextMock(...args),
}));

import { buildRagContext } from '$modules/nova';

const BASELINE_CONTEXT: AiContext = {
	policy: 'project_summary',
	scene: null,
	adjacentScenes: [],
	chapter: null,
	beats: [],
	characters: [],
	locations: [],
	loreEntries: [],
	plotThreads: [],
	project: {
		id: 'p1',
		title: 'Project One',
		genre: 'fantasy',
		logline: 'A hero must choose.',
		synopsis: 'A full synopsis.',
		targetWordCount: 90000,
		status: 'drafting',
		projectType: 'novel',
		lastOpenedAt: '',
		stylePresetId: 'preset-1',
		systemPrompt: '',
		negativePrompt: '',
		createdAt: '',
		updatedAt: '',
	},
	projectCounts: {
		chapters: 0,
		scenes: 0,
		beats: 0,
		characters: 0,
		characterRelationships: 0,
		locations: 0,
		loreEntries: 0,
		plotThreads: 0,
		timelineEvents: 0,
		acts: 0,
		arcs: 0,
		milestones: 0,
		writingStyles: 0,
	},
	storyFrames: [],
	timelineEvents: [],
	characterRelationships: [],
	factions: [],
	themes: [],
	glossaryTerms: [],
};

const SCENE_CONTEXT: AiContext = {
	policy: 'scene_plus_adjacent',
	scene: { id: 's1', title: 'Test', content: 'x', summary: '', projectId: 'p1', chapterId: 'c1', order: 0, createdAt: '', updatedAt: '', characterIds: [], locationIds: [], povCharacterId: null, locationId: null } as unknown as AiContext['scene'],
	adjacentScenes: [],
	chapter: null,
	beats: [],
	characters: [],
	locations: [],
	loreEntries: [],
	plotThreads: [],
};

describe('buildRagContext (real)', () => {
	beforeEach(() => {
		buildContextMock.mockReset();
	});

	it('returns null aiContext + warning when projectId is empty', async () => {
		const result = await buildRagContext({
			projectId: '',
			activeSceneId: 's1',
			policy: 'scene_plus_adjacent',
		});
		expect(result.aiContext).toBeNull();
		expect(result.includedScopes).toEqual([]);
		expect(result.warnings.join(' ')).toContain('No project id');
		expect(buildContextMock).not.toHaveBeenCalled();
	});

	it('returns project baseline context when activeSceneId is null', async () => {
		buildContextMock.mockResolvedValueOnce(BASELINE_CONTEXT);

		const result = await buildRagContext({
			projectId: 'p1',
			activeSceneId: null,
			policy: 'scene_plus_adjacent',
		});
		expect(result.aiContext).toMatchObject({
			policy: 'project_summary',
			project: { id: 'p1', title: 'Project One' },
		});
		expect(result.includedScopes).toEqual(expect.arrayContaining(['project', 'project-summary']));
		expect(result.warnings.join(' ')).toContain('No active scene');
		expect(buildContextMock).toHaveBeenCalledTimes(1);
	});

	it('merges project baseline into scene context when a scene is active', async () => {
		buildContextMock
			.mockResolvedValueOnce(BASELINE_CONTEXT)
			.mockResolvedValueOnce(SCENE_CONTEXT);

		const result = await buildRagContext({
			projectId: 'p1',
			activeSceneId: 's1',
			policy: 'scene_plus_adjacent',
		});

		expect(buildContextMock).toHaveBeenCalledTimes(2);
		const [baselineTask, baselineProjectId] = buildContextMock.mock.calls[0];
		expect(baselineProjectId).toBe('p1');
		expect(baselineTask.contextPolicy).toBe('project_summary');
		const [task, projectId] = buildContextMock.mock.calls[1];
		expect(projectId).toBe('p1');
		expect(task.taskType).toBe('chat');
		expect(task.contextPolicy).toBe('scene_plus_adjacent');
		expect(task.targetEntityId).toBe('s1');

		expect(result.aiContext).toMatchObject({
			scene: { id: 's1' },
			project: { id: 'p1', title: 'Project One' },
		});
		expect(result.includedScopes).toEqual(
			expect.arrayContaining(['project', 'project-summary', 'scene']),
		);
		expect(result.warnings).toEqual([]);
	});

	it('reports adjacent / character / location scopes when present', async () => {
		buildContextMock
			.mockResolvedValueOnce(BASELINE_CONTEXT)
			.mockResolvedValueOnce({
				...SCENE_CONTEXT,
				adjacentScenes: [{ id: 's0' }],
				characters: [{ id: 'c1' }],
				locations: [{ id: 'l1' }],
			} as unknown as AiContext);

		const result = await buildRagContext({
			projectId: 'p1',
			activeSceneId: 's1',
			policy: 'scene_plus_adjacent',
		});

		expect(result.includedScopes).toEqual(
			expect.arrayContaining(['scene', 'adjacent-scenes', 'characters', 'locations']),
		);
	});

	it('reports missing baseline fields when logline/synopsis are missing', async () => {
		buildContextMock.mockResolvedValueOnce({
			...BASELINE_CONTEXT,
			project: BASELINE_CONTEXT.project
				? {
						...BASELINE_CONTEXT.project,
						logline: '',
						synopsis: '',
					}
				: null,
		});

		const result = await buildRagContext({
			projectId: 'p1',
			activeSceneId: null,
			policy: 'scene_plus_adjacent',
		});

		expect(result.warnings.join(' ')).toContain('Project context is missing: logline, synopsis.');
	});

	it('keeps project baseline on outline requests', async () => {
		buildContextMock
			.mockResolvedValueOnce(BASELINE_CONTEXT)
			.mockResolvedValueOnce({
				...BASELINE_CONTEXT,
				policy: 'outline_scope',
				outlineHierarchy: {
					arcs: [{ id: 'arc-1' }],
					acts: [],
					milestones: [],
					chapters: [],
					scenes: [],
					beats: [],
					stages: [],
				} as unknown as NonNullable<AiContext['outlineHierarchy']>,
			});

		const result = await buildRagContext({
			projectId: 'p1',
			activeSceneId: null,
			policy: 'outline_scope',
		});

		expect(buildContextMock).toHaveBeenCalledTimes(2);
		const [outlineTask] = buildContextMock.mock.calls[1];
		expect(outlineTask.contextPolicy).toBe('outline_scope');
		expect(result.includedScopes).toEqual(expect.arrayContaining(['project', 'outline']));
	});
});
