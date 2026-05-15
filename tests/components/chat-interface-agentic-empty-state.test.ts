import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FILE_PATH = resolve(
	__dirname,
	'..',
	'..',
	'src',
	'modules',
	'ai',
	'components',
	'ChatInterface.svelte',
);

describe('ChatInterface empty-state agentic controls', () => {
	const source = readFileSync(FILE_PATH, 'utf8');

	it('shapes outbound prompts with selected Nova mode', () => {
		expect(source).toContain('buildNovaModePrompt(userPrompt, activeMode)');
	});

	it('does not render non-agentic quick links in the empty state', () => {
		expect(source).not.toContain('<QuickLinks');
		expect(source).not.toContain("import QuickLinks from './QuickLinks.svelte'");
	});

	it('keeps suggestion chips on the same submit path', () => {
		expect(source).toContain('<SuggestionChips label="Director prompts" {suggestions} onselect={handleSubmit} />');
	});
});
