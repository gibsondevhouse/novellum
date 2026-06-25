import { describe, expect, it } from 'vitest';
import {
	createProseDiff,
	createProseDiffMarkup,
	renderProseDiffMarkup,
} from '$lib/ai/pipeline/prose-diff-helper.js';

describe('prose diff helper', () => {
	it('returns a stable unchanged segment when prose matches', () => {
		const diff = createProseDiff('same paragraph', 'same paragraph');

		expect(diff.hasChanges).toBe(false);
		expect(diff.insertedText).toBe('');
		expect(diff.deletedText).toBe('');
		expect(diff.segments).toEqual([{ operation: 'equal', text: 'same paragraph' }]);
		expect(renderProseDiffMarkup(diff)).toBe('same paragraph');
	});

	it('wraps inserted prose in operational insert tags', () => {
		const diff = createProseDiff('The cat sat.', 'The brave cat sat.');

		expect(diff.hasChanges).toBe(true);
		expect(diff.insertedText).toBe('brave ');
		expect(diff.deletedText).toBe('');
		expect(diff.segments).toEqual([
			{ operation: 'equal', text: 'The ' },
			{ operation: 'insert', text: 'brave ' },
			{ operation: 'equal', text: 'cat sat.' },
		]);
		expect(renderProseDiffMarkup(diff)).toBe('The <ins>brave </ins>cat sat.');
	});

	it('wraps removed prose in operational delete tags', () => {
		expect(createProseDiffMarkup('The tired cat sat.', 'The cat sat.')).toBe(
			'The <del>tired </del>cat sat.',
		);
	});

	it('represents replacements as adjacent delete and insert operations', () => {
		const diff = createProseDiff('old', 'new');

		expect(diff.insertedText).toBe('new');
		expect(diff.deletedText).toBe('old');
		expect(renderProseDiffMarkup(diff)).toBe('<del>old</del><ins>new</ins>');
	});

	it('treats empty current text as a full insertion', () => {
		const diff = createProseDiff('', 'Generated prose.');

		expect(diff.segments).toEqual([{ operation: 'insert', text: 'Generated prose.' }]);
		expect(renderProseDiffMarkup(diff)).toBe('<ins>Generated prose.</ins>');
	});

	it('treats empty generated text as a full deletion', () => {
		expect(createProseDiffMarkup('<draft & notes>', '')).toBe(
			'<del>&lt;draft &amp; notes&gt;</del>',
		);
	});

	it('normalizes nullish inputs to empty prose', () => {
		expect(createProseDiffMarkup(null, undefined)).toBe('');
		expect(createProseDiffMarkup(undefined, 'Draft')).toBe('<ins>Draft</ins>');
	});
});
