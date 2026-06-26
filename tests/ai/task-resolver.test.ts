import { describe, it, expect } from 'vitest';
import { resolveTask } from '../../src/lib/ai/task-resolver.js';

const ctx = {
	activeProjectId: 'proj-1',
	activeSceneId: 'scene-1',
	activeBeatId: null,
	activeChapterId: 'ch-1',
};

describe('task-resolver', () => {
	it('resolves "continue" action', () => {
		const task = resolveTask('continue', ctx);
		expect(task.taskType).toBe('continue');
		expect(task.contextPolicy).toBe('scene_plus_adjacent');
		expect(task.outputFormat).toBe('prose');
	});

	it('resolves "rewrite" action', () => {
		const task = resolveTask('rewrite', ctx);
		expect(task.taskType).toBe('rewrite');
		expect(task.contextPolicy).toBe('scene_only');
	});

	it('resolves "continuity_check" action', () => {
		const task = resolveTask('continuity_check', ctx);
		expect(task.taskType).toBe('continuity_check');
		expect(task.contextPolicy).toBe('continuity_scope');
	});

	it('uses targetEntityId from uiCtx.activeSceneId', () => {
		const task = resolveTask('continue', ctx);
		expect(task.targetEntityId).toBe('scene-1');
	});

	it('falls back to "continue" for unknown actions', () => {
		const task = resolveTask('unknown_action', ctx);
		expect(task.taskType).toBe('continue');
	});

	it('resolves "brainstorm" to the review-gated BrainstormAgent contract', () => {
		const task = resolveTask('brainstorm', ctx);
		expect(task.taskType).toBe('brainstorm');
		expect(task.contextPolicy).toBe('worldbuilding_scope');
		expect(task.outputFormat).toBe('json_brainstorm_session');
		expect(task.targetEntityId).toBe('proj-1');
	});

	it('falls back to "continue" for remaining cut TaskTypes (outline/draft/summarize)', () => {
		// plan-025 removed these runtime agents from the V1 surface.
		// plan-043 reintroduces BrainstormAgent separately, so only the
		// still-cut actions fall through to the DEFAULT_TASK.
		for (const action of ['outline', 'draft', 'summarize_scene']) {
			expect(resolveTask(action, ctx).taskType).toBe('continue');
		}
	});

	it('routes ask-mode context to worldbuilding_scope when no scene is active', () => {
		const task = resolveTask('ask', {
			...ctx,
			activeSceneId: null,
		});
		expect(task.taskType).toBe('chat');
		expect(task.contextPolicy).toBe('worldbuilding_scope');
		expect(task.targetEntityId).toBe('ch-1');
	});

	it('keeps ask-mode context on scene_plus_adjacent when a scene is active', () => {
		const task = resolveTask('ask', ctx);
		expect(task.taskType).toBe('chat');
		expect(task.contextPolicy).toBe('scene_plus_adjacent');
		expect(task.targetEntityId).toBe('scene-1');
	});
});
