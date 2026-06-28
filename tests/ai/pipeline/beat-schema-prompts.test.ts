import { describe, expect, it } from 'vitest';
import { OUTPUT_FORMAT_DESCRIPTIONS } from '$lib/ai/constants.js';
import { resolvePromptScaffold } from '$lib/ai/pipeline/prompt-library.js';
import { PROMPT_SEEDS } from '$lib/ai/pipeline/prompt-library-seeds.js';
import {
	PIPELINE_TASK_CATALOG,
	PIPELINE_TASK_FAMILIES,
	PIPELINE_TASK_KEYS,
	getPipelineTaskDefinition,
} from '$lib/ai/pipeline/task-catalog.js';
import {
	WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT,
	outlineBeatPlanSchema,
} from '$lib/ai/pipeline/worldbuild-schemas.js';

describe('beat schema and prompt registration', () => {
	it('parses a bounded scene beat plan with nested stages', () => {
		const result = outlineBeatPlanSchema.parse({
			sceneId: ' scene-1 ',
			beats: [
				{
					order: '0',
					title: ' Hook ',
					type: 'setup',
					summary: 'The protagonist discovers the map has changed.',
					purpose: 'Establish the impossible event.',
					stages: [
						{
							order: '0',
							title: 'Notice the mismatch',
							purpose: 'Reveal the first concrete contradiction.',
						},
					],
				},
				{
					order: 1,
					title: 'Choice',
					type: 'decision',
					summary: 'She chooses to hide the map from the court.',
					purpose: 'Lock in the scene turn.',
					stages: [
						{
							order: 0,
							title: 'Weigh the risk',
							purpose: 'Clarify the cost of speaking up.',
							status: 'in_progress',
						},
					],
				},
			],
		});

		expect(result.sceneId).toBe('scene-1');
		expect(result.beats).toHaveLength(2);
		expect(result.beats[0].order).toBe(0);
		expect(result.beats[0].title).toBe('Hook');
		expect(result.beats[0].stages[0]).toMatchObject({
			order: 0,
			status: 'planned',
		});
	});

	it('rejects overlong beat plans before database materialization', () => {
		const beat = {
			order: 0,
			title: 'Beat',
			type: 'action',
			summary: 'A bounded story movement.',
			purpose: 'Move the scene.',
			stages: [{ order: 0, title: 'Stage', purpose: 'Make the movement concrete.' }],
		};

		const result = outlineBeatPlanSchema.safeParse({
			sceneId: 'scene-1',
			beats: Array.from({ length: 6 }, (_, order) => ({ ...beat, order })),
		});

		expect(result.success).toBe(false);
	});

	it('registers the vibe-outline.beats prompt, descriptor, schema, and catalog task', () => {
		const taskKey = PIPELINE_TASK_KEYS.OUTLINE_BEATS;
		const definition = getPipelineTaskDefinition(taskKey);

		expect(definition).toEqual(PIPELINE_TASK_CATALOG[taskKey]);
		expect(definition).toMatchObject({
			key: 'vibe-outline.beats',
			family: 'vibe-outline',
			stage: 'beats',
			target: 'scene',
			contextPolicy: 'scene_plus_adjacent',
			outputFormat: 'json_outline_beats',
		});
		expect(PIPELINE_TASK_FAMILIES['vibe-outline']).toEqual([taskKey]);
		expect(PROMPT_SEEDS[taskKey].outputFormat).toBe('json_outline_beats');
		expect(resolvePromptScaffold(taskKey)).toEqual(PROMPT_SEEDS[taskKey]);
		expect(OUTPUT_FORMAT_DESCRIPTIONS.json_outline_beats).toContain('beats[]');
		expect(WORLDBUILD_SCHEMA_BY_OUTPUT_FORMAT.json_outline_beats).toBe(outlineBeatPlanSchema);
	});
});
