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

	it('falls back to "continue" for cut TaskTypes (brainstorm/outline/draft/summarize)', () => {
		// plan-025: these actions were removed from the V1 surface.
		// They now fall through to the DEFAULT_TASK rather than
		// producing a structured prompt for a runtime agent that does
		// not exist.
		for (const action of ['brainstorm', 'outline', 'draft', 'summarize_scene']) {
			expect(resolveTask(action, ctx).taskType).toBe('continue');
		}
	});
});
