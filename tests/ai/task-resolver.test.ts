import { describe, it, expect } from 'vitest';
import { resolveTask } from '../../src/lib/ai/task-resolver.js';

const ctx = {
	activeProjectId: 'proj-1',
	activeSceneId: 'scene-1',
	activeBeatId: null,
	activeChapterId: 'ch-1',
};

describe('task-resolver', () => {
	it('resolves "brainstorm" action', () => {
		const task = resolveTask('brainstorm', ctx);
		expect(task.taskType).toBe('brainstorm');
		expect(task.contextPolicy).toBe('scene_plus_adjacent');
		expect(task.outputFormat).toBe('bullet_list');
	});

	it('resolves "draft" action', () => {
		const task = resolveTask('draft', ctx);
		expect(task.taskType).toBe('draft');
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
});
