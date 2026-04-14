import { describe, it, expect, vi } from 'vitest';
import { parseConsistencyIssues, executeContinuityCheck } from '../../src/lib/ai/continuity-agent.js';
import * as contextEngine from '../../src/lib/ai/context-engine.js';
import * as openrouter from '../../src/lib/ai/openrouter.js';
import type { AiTask } from '../../src/lib/ai/types.js';

describe('parseConsistencyIssues', () => {
	it('parses a well-formed JSON issue list', () => {
		const raw = JSON.stringify([
			{
				type: 'timeline',
				severity: 'error',
				description: 'Scene occurs before character arrives',
				entityIds: ['char-1'],
			},
			{
				type: 'character',
				severity: 'warning',
				description: 'Character eye color changes',
				entityIds: [],
			},
		]);
		const result = parseConsistencyIssues(raw);
		expect(result).toHaveLength(2);
		expect(result[0].type).toBe('timeline');
		expect(result[0].severity).toBe('error');
		expect(result[1].entityIds).toEqual([]);
	});

	it('returns empty array for empty JSON array', () => {
		expect(parseConsistencyIssues('[]')).toEqual([]);
	});

	it('returns empty array for malformed JSON', () => {
		expect(parseConsistencyIssues('not json at all')).toEqual([]);
	});

	it('returns empty array when no JSON array found', () => {
		expect(parseConsistencyIssues('Here are the issues: ...')).toEqual([]);
	});

	it('coerces unknown type to "character"', () => {
		const raw = JSON.stringify([
			{ type: 'unknown_type', severity: 'warning', description: 'test', entityIds: [] },
		]);
		const result = parseConsistencyIssues(raw);
		expect(result[0].type).toBe('character');
	});

	it('handles JSON embedded in surrounding prose', () => {
		const raw =
			'Here are the issues:\n[\n{"type":"lore","severity":"error","description":"Lore violated","entityIds":[]}\n]\nEnd of analysis.';
		const result = parseConsistencyIssues(raw);
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe('lore');
	});
});

vi.mock('../../src/lib/ai/openrouter.js', () => ({
	OpenRouterClient: class MockOpenRouterClient {
		complete() {}
	},
	MissingCredentialsError: class MissingCredentialsError extends Error {}
}));

vi.mock('../../src/lib/ai/context-engine.js', () => ({
	buildContext: vi.fn()
}));

const mockTask: AiTask = {
	taskType: 'continuity_check',
	role: 'tester',
	targetEntityId: null,
	contextPolicy: 'continuity_scope',
	outputFormat: 'json_issue_list'
};

describe('executeContinuityCheck', () => {
	it('integrates context, prompt, and openrouter perfectly', async () => {
		vi.mocked(contextEngine.buildContext).mockResolvedValueOnce({
			policy: 'continuity_scope',
			scene: null, adjacentScenes: [], chapter: null, beats: [], characters: [], locations: [], loreEntries: [], plotThreads: []
		});

		const completeMock = vi.fn().mockResolvedValue({
			text: '[\n{"type":"character","severity":"warning","description":"Hair color","entityIds":[]}\n]',
			model: 'openai/gpt-4o',
			tokensUsed: 10
		});
		
		openrouter.OpenRouterClient.prototype.complete = completeMock;

		const res = await executeContinuityCheck('proj1', mockTask);
		
		expect(contextEngine.buildContext).toHaveBeenCalledWith(mockTask, 'proj1');
		expect(completeMock).toHaveBeenCalled();
		expect(res).toHaveLength(1);
		expect(res[0].description).toBe('Hair color');
	});
});

