import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	getPipelineTaskLabel,
	PIPELINE_TASK_KEYS,
} from '../../src/lib/ai/pipeline/task-catalog.js';
import { checkpointLifecycleLabel } from '../../src/lib/review-gate-labels.js';

const OUTLINE_ROUTE_SOURCE = 'src/routes/projects/[id]/outline/+page.svelte';

describe('outline checkpoint labels', () => {
	it('maps checkpoint lifecycles to author-readable labels', () => {
		expect(checkpointLifecycleLabel('draft')).toBe('Draft');
		expect(checkpointLifecycleLabel('review')).toBe('In review');
		expect(checkpointLifecycleLabel('accepted')).toBe('Accepted');
		expect(checkpointLifecycleLabel('rejected')).toBe('Rejected');
	});

	it('maps known pipeline task keys to readable names', () => {
		expect(getPipelineTaskLabel(PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE)).toBe(
			'Worldbuilding premise',
		);
		expect(getPipelineTaskLabel(PIPELINE_TASK_KEYS.AUTHOR_OUTLINE)).toBe('Author outline');
		expect(getPipelineTaskLabel(PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT)).toBe('Scene draft');
	});

	it('humanizes unknown task keys without exposing the raw key first', () => {
		const rawKey = 'vibe-author.experimental-outline';
		const label = getPipelineTaskLabel(rawKey);

		expect(label).toBe('Experimental Outline task');
		expect(label).not.toBe(rawKey);
		expect(label.startsWith('vibe-author')).toBe(false);
	});

	it('uses display helpers in the outline checkpoint queue and detail surface', () => {
		const source = readFileSync(OUTLINE_ROUTE_SOURCE, 'utf8');

		expect(source).toContain('checkpointQueueFilterLabel(filter)');
		expect(source).toContain('checkpointLifecycleLabel(cp.lifecycle)');
		expect(source).toContain('getPipelineTaskLabel(cp.taskKey)');
		expect(source).toContain('data-task-key={cp.taskKey}');
		expect(source).toContain('Task key');
		expect(source).not.toContain('{cp.lifecycle}</span>');
		expect(source).not.toContain('{cp.taskKey}</span>');
	});
});
