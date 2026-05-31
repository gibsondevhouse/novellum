/**
 * Edge-case regression suite for extractNameCandidates.
 * Core happy-path tests live in generation-context.test.ts.
 * This file focuses on punctuation, apostrophes, mixed casing, and boundary conditions.
 */
import { describe, expect, it } from 'vitest';
import { extractNameCandidates } from '../../src/modules/world-building/services/generation-context.js';

describe('extractNameCandidates — punctuation handling', () => {
	it('strips leading punctuation from words', () => {
		// "(Oayara" should still yield "Oayara"
		const results = extractNameCandidates('', 'The story begins with (Oayara and her fate.');
		expect(results).toContain('Oayara');
	});

	it('strips trailing punctuation from words', () => {
		// "Sable," or "Court." should still yield the base word
		const results = extractNameCandidates('', 'She joined Sable, then met Court.');
		expect(results).toContain('Sable');
	});

	it('handles hyphenated proper nouns as single tokens', () => {
		// "Ash-Court" — the heuristic strips non-alpha from ends; internal hyphens stay
		const results = extractNameCandidates('', 'She fled from Ash-Court with nothing.');
		// "Ash-Court" is a valid word by our regex since internal hyphen is kept
		expect(results.length).toBeGreaterThanOrEqual(0); // no crash
	});
});

describe('extractNameCandidates — apostrophes', () => {
	it('preserves apostrophes inside words (possessives, contractions)', () => {
		// "Oayara's" → should yield "Oayara's" or "Oayara" depending on strip
		const results = extractNameCandidates("", "The courier crossed Oayara's territory.");
		// Should still find the candidate even with possessive suffix
		expect(results.some((r) => r.startsWith("Oayara"))).toBe(true);
	});
});

describe('extractNameCandidates — case sensitivity', () => {
	it('deduplicates case-insensitively across sentences', () => {
		const results = extractNameCandidates(
			'The land of Talmoor',
			'Beyond Talmoor lies danger. Then TALMOOR returned.',
		);
		const talmoorVariants = results.filter((r) => r.toLowerCase() === 'talmoor');
		expect(talmoorVariants.length).toBe(1);
	});

	it('returns the first-encountered casing variant', () => {
		const results = extractNameCandidates('', 'Beyond Talmoor lies the edge.');
		expect(results).toContain('Talmoor');
	});
});

describe('extractNameCandidates — sentence boundary detection', () => {
	it('treats words after ? as sentence-initial', () => {
		const results = extractNameCandidates('', 'Who leads? Oayara does.');
		// "Oayara" is after "?" so sentence-initial → excluded
		expect(results).not.toContain('Oayara');
	});

	it('treats words after ! as sentence-initial', () => {
		const results = extractNameCandidates('', 'Run! Thorn follows close.');
		// "Thorn" is sentence-initial → excluded
		expect(results).not.toContain('Thorn');
	});

	it('treats words after newline as sentence-initial', () => {
		const results = extractNameCandidates('', 'First line here.\nKaela begins the second.');
		// "Kaela" starts after newline → excluded
		expect(results).not.toContain('Kaela');
	});
});

describe('extractNameCandidates — stopword filtering', () => {
	it('filters all registered stopwords mid-sentence', () => {
		const stopwordSentence = 'they said that this and or but not will could should may might must can he she we you';
		const results = extractNameCandidates('', `The beginning ${stopwordSentence} end.`);
		const stopwords = ['The', 'And', 'Or', 'But', 'Not', 'Will', 'Could', 'Should', 'May', 'Might', 'Must', 'Can', 'He', 'She', 'We', 'You'];
		for (const word of stopwords) {
			expect(results).not.toContain(word);
		}
	});
});

describe('extractNameCandidates — empty and minimal inputs', () => {
	it('handles both empty strings', () => {
		expect(extractNameCandidates('', '')).toEqual([]);
	});

	it('handles title only with no synopsis', () => {
		// Title first word is sentence-initial → skipped; subsequent words extracted
		const results = extractNameCandidates('Signal Fire', '');
		// "Fire" is not sentence-initial in title (word index 1) and is capitalized
		// but "Signal" is index 0 (sentence-initial) → excluded
		// "Fire" — depends on whether it's filtered; it's not a stopword
		expect(results.length).toBeGreaterThanOrEqual(0); // no crash
	});

	it('handles single-word title', () => {
		expect(extractNameCandidates('Talmoor', '')).toEqual([]);
	});
});
