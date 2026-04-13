import { describe, it, expect } from 'vitest';
import { parseConsistencyIssues } from '../../src/lib/ai/continuity-agent.js';

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
