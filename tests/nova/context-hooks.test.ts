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

	it('returns null aiContext + warning when activeSceneId is null', async () => {
		const result = await buildRagContext({
			projectId: 'p1',
			activeSceneId: null,
			policy: 'scene_plus_adjacent',
		});
		expect(result.aiContext).toBeNull();
		expect(result.includedScopes).toEqual([]);
		expect(result.warnings.join(' ')).toContain('No active scene');
		expect(buildContextMock).not.toHaveBeenCalled();
	});

	it('delegates to buildContext and reports populated scopes when scene is available', async () => {
		buildContextMock.mockResolvedValueOnce(SCENE_CONTEXT);

		const result = await buildRagContext({
			projectId: 'p1',
			activeSceneId: 's1',
			policy: 'scene_plus_adjacent',
		});

		expect(buildContextMock).toHaveBeenCalledTimes(1);
		const [task, projectId] = buildContextMock.mock.calls[0];
		expect(projectId).toBe('p1');
		expect(task.taskType).toBe('continue');
		expect(task.contextPolicy).toBe('scene_plus_adjacent');
		expect(task.targetEntityId).toBe('s1');

		expect(result.aiContext).toBe(SCENE_CONTEXT);
		expect(result.includedScopes).toContain('scene');
		expect(result.warnings).toEqual([]);
	});

	it('reports adjacent / character / location scopes when present', async () => {
		buildContextMock.mockResolvedValueOnce({
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
});
