import { describe, expect, it } from 'vitest';
import { Orchestrator } from '../../../src/lib/ai/orchestrator.js';
import { resolveTask } from '../../../src/lib/ai/task-resolver.js';
import { OUTLINE_HIERARCHY } from '../../../src/lib/ai/pipeline/contracts.js';
import {
	PIPELINE_TASK_FAMILIES,
	PIPELINE_TASK_KEYS,
	resolvePipelineAction,
} from '../../../src/lib/ai/pipeline/task-catalog.js';

const uiCtx = {
	activeProjectId: 'project-1',
	activeSceneId: 'scene-1',
	activeBeatId: 'beat-1',
	activeChapterId: 'chapter-1',
};

describe('pipeline contracts', () => {
	it('catalog includes worldbuild and author stage families', () => {
		expect(PIPELINE_TASK_FAMILIES['vibe-worldbuild']).toHaveLength(4);
		expect(PIPELINE_TASK_FAMILIES['vibe-author']).toHaveLength(4);
		expect(PIPELINE_TASK_FAMILIES['vibe-worldbuild']).toContain(
			PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE,
		);
		expect(PIPELINE_TASK_FAMILIES['vibe-author']).toContain(
			PIPELINE_TASK_KEYS.AUTHOR_REVISION_PACK,
		);
	});

	it('resolveTask returns typed pipeline tasks for pipeline actions', () => {
		const task = resolveTask(`pipeline:${PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE}`, uiCtx);
		expect(task.taskType).toBe('pipeline');
		expect(task.pipelineTask).toEqual({
			key: PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE,
			family: 'vibe-worldbuild',
			stage: 'premise',
		});
		expect(task.targetEntityId).toBe('project-1');
	});

	it('throws actionable error for unknown pipeline stage keys', () => {
		expect(() => resolveTask('pipeline:vibe-worldbuild.non-existent', uiCtx)).toThrow(
			/Unknown pipeline stage key/,
		);
	});

	it('orchestrator returns typed artifact envelopes with default lifecycle and 7-layer hierarchy', async () => {
		const pipelineTask = resolvePipelineAction(`pipeline:${PIPELINE_TASK_KEYS.AUTHOR_OUTLINE}`);
		if (!pipelineTask) {
			throw new Error('Expected pipeline task definition for author outline');
		}

		const orchestrator = new Orchestrator();
		const artifact = await orchestrator.runPipeline({
			task: pipelineTask,
			payload: { outline: [] },
			hierarchyReferences: {
				milestones: ['milestone-1'],
				stages: ['stage-1'],
			},
			stageStatusById: {
				'stage-1': 'planned',
			},
		});

		expect(artifact.taskKey).toBe(PIPELINE_TASK_KEYS.AUTHOR_OUTLINE);
		expect(artifact.pipeline).toBe('vibe-author');
		expect(artifact.lifecycle).toBe('draft');
		expect(artifact.hierarchy.order).toEqual(OUTLINE_HIERARCHY);
		expect(artifact.hierarchy.references.acts).toEqual([]);
		expect(artifact.hierarchy.references.milestones).toEqual(['milestone-1']);
		expect(artifact.hierarchy.references.stages).toEqual(['stage-1']);
		expect(artifact.hierarchy.stageStatusById).toEqual({ 'stage-1': 'planned' });
	});

	it('orchestrator preserves explicit lifecycle overrides', async () => {
		const pipelineTask = resolvePipelineAction(`pipeline:${PIPELINE_TASK_KEYS.AUTHOR_PREMISE}`);
		if (!pipelineTask) {
			throw new Error('Expected pipeline task definition for author premise');
		}

		const orchestrator = new Orchestrator();
		const artifact = await orchestrator.runPipeline({
			task: pipelineTask,
			payload: { premise: 'x' },
			lifecycle: 'review',
		});

		expect(artifact.lifecycle).toBe('review');
	});
});
