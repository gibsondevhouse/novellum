import { describe, it, expect } from 'vitest';
import { resolvePromptScaffold } from '../../../src/lib/ai/pipeline/prompt-library.js';
import { PROMPT_SEEDS } from '../../../src/lib/ai/pipeline/prompt-library-seeds.js';

describe('Prompt Library', () => {
	it('returns the seed prompt when no template is provided', () => {
		const stageKey = 'vibe-worldbuild.premise';
		const scaffold = resolvePromptScaffold(stageKey);
		expect(scaffold).toEqual(PROMPT_SEEDS[stageKey]);
	});

	it('returns the seed prompt when template list is empty', () => {
		const stageKey = 'vibe-worldbuild.premise';
		const scaffold = resolvePromptScaffold(stageKey, []);
		expect(scaffold).toEqual(PROMPT_SEEDS[stageKey]);
	});

	it('replaces the task field if template content is not JSON', () => {
		const stageKey = 'vibe-worldbuild.premise';
		const customTask = 'Custom task description';
		const templates = [{ type: stageKey, content: customTask }];
		
		const scaffold = resolvePromptScaffold(stageKey, templates);
		
		expect(scaffold.task).toBe(customTask);
		expect(scaffold.role).toBe(PROMPT_SEEDS[stageKey].role);
		expect(scaffold.constraints).toEqual(PROMPT_SEEDS[stageKey].constraints);
		expect(scaffold.outputFormat).toBe(PROMPT_SEEDS[stageKey].outputFormat);
	});

	it('merges fields if template content is valid JSON', () => {
		const stageKey = 'vibe-worldbuild.premise';
		const override = {
			role: 'Custom Role',
			task: 'Custom Task',
			constraints: ['Constraint 1'],
			outputFormat: 'custom_format'
		};
		const templates = [{ type: stageKey, content: JSON.stringify(override) }];
		
		const scaffold = resolvePromptScaffold(stageKey, templates);
		
		expect(scaffold.role).toBe(override.role);
		expect(scaffold.task).toBe(override.task);
		expect(scaffold.constraints).toEqual(override.constraints);
		expect(scaffold.outputFormat).toBe(override.outputFormat);
	});

	it('partially merges fields if template JSON is incomplete', () => {
		const stageKey = 'vibe-worldbuild.premise';
		const override = {
			task: 'Partial Task Override'
		};
		const templates = [{ type: stageKey, content: JSON.stringify(override) }];
		
		const scaffold = resolvePromptScaffold(stageKey, templates);
		
		expect(scaffold.task).toBe(override.task);
		expect(scaffold.role).toBe(PROMPT_SEEDS[stageKey].role);
		expect(scaffold.constraints).toEqual(PROMPT_SEEDS[stageKey].constraints);
	});

	it('throws an error for unknown stage keys', () => {
		expect(() => resolvePromptScaffold('unknown.stage')).toThrow(/No prompt seed found/);
	});
});

import { buildPrompt } from '../../../src/lib/ai/prompt-builder.js';
import { NOVA_IDENTITY_BLOCK, OUTPUT_FORMAT_DESCRIPTIONS } from '../../../src/lib/ai/constants.js';

describe('Prompt Builder Integration', () => {
	it('integrates pipeline scaffolds into buildPrompt', () => {
		const stageKey = 'vibe-worldbuild.premise';
		const seed = PROMPT_SEEDS[stageKey];
		const task = {
			taskType: 'pipeline' as const,
			role: 'Legacy Role',
			targetEntityId: 'proj-123',
			contextPolicy: 'continuity_scope' as const,
			outputFormat: 'json_worldbuild_premise',
			pipelineTask: {
				key: stageKey,
				family: 'vibe-worldbuild' as const,
				stage: 'premise'
			}
		};

		const ctx = {
			policy: 'continuity_scope' as const,
			scene: null,
			adjacentScenes: [],
			chapter: null,
			beats: [],
			characters: [],
			locations: [],
			loreEntries: [],
			plotThreads: [],
			templates: []
		};

		const prompt = buildPrompt(task, ctx);

		// Assert ROLE contains Nova identity + scaffold role
		expect(prompt).toContain('## ROLE');
		expect(prompt).toContain(NOVA_IDENTITY_BLOCK);
		expect(prompt).toContain(seed.role);

		// Assert TASK contains scaffold task
		expect(prompt).toContain('## TASK');
		expect(prompt).toContain(seed.task);

		// Assert CONSTRAINTS contains at least one scaffold constraint
		expect(prompt).toContain('## CONSTRAINTS');
		expect(prompt).toContain(seed.constraints[0]);

		// Assert OUTPUT FORMAT contains the descriptor, not the raw key
		expect(prompt).toContain('## OUTPUT FORMAT');
		expect(prompt).toContain(OUTPUT_FORMAT_DESCRIPTIONS[seed.outputFormat]);
		expect(prompt).not.toContain('## OUTPUT FORMAT\n' + seed.outputFormat);
	});
});
