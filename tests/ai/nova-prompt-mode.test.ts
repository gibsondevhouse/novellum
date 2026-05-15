import { describe, expect, it } from 'vitest';
import { buildNovaModePrompt } from '../../src/modules/ai/services/nova-prompt-mode.js';

describe('buildNovaModePrompt', () => {
	it('returns empty output for blank prompts', () => {
		expect(buildNovaModePrompt('   ', 'writing')).toBe('');
	});

	it('adds writing-mode direction', () => {
		const output = buildNovaModePrompt('Draft the opening scene.', 'writing');
		expect(output).toContain('Mode: Writing');
		expect(output).toContain('Director brief:');
		expect(output).toContain('Draft the opening scene.');
	});

	it('adds revision-mode direction', () => {
		const output = buildNovaModePrompt('Tighten this chapter.', 'revision');
		expect(output).toContain('Mode: Revision');
		expect(output).toContain('Tighten this chapter.');
	});

	it('adds structure-mode direction', () => {
		const output = buildNovaModePrompt('Build a three-act skeleton.', 'structure');
		expect(output).toContain('Mode: Structure');
		expect(output).toContain('Build a three-act skeleton.');
	});
});
