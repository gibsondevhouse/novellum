import { describe, expect, it } from 'vitest';
import {
	buildPromptContextNote,
	extractNameCandidates,
	legacyStringToGenerationContext,
	normalizeGenerationContext,
} from '../../src/modules/world-building/services/generation-context.js';

describe('generation-context helpers', () => {
	it('normalizes structured hint payloads', () => {
		const normalized = normalizeGenerationContext({
			note: 'Focus on the title character',
			hints: [
				{ name: 'Oayara', intent: 'target', source: 'title' },
				{ name: 'Ash Court', intent: 'avoid', source: 'manual' },
				{ name: 'False Coast', intent: 'target', source: 'brainstorm' },
			],
		});

		expect(normalized).toBeTruthy();
		expect(normalized?.hints).toHaveLength(3);
		expect(normalized?.hints?.[0]).toMatchObject({
			name: 'Oayara',
			intent: 'target',
			source: 'title',
		});
		expect(normalized?.hints?.[2]).toMatchObject({
			name: 'False Coast',
			intent: 'target',
			source: 'brainstorm',
		});
	});

	it('keeps longer brainstorm context notes intact for prompt grounding', () => {
		const note = `Accepted Brainstorm seeds:\n${'A'.repeat(500)}\n${'B'.repeat(500)}`;
		const normalized = normalizeGenerationContext({
			note,
			hints: [{ name: 'False Coast', intent: 'target', source: 'brainstorm' }],
		});

		expect(normalized?.note?.length).toBeGreaterThan(900);
		expect(normalized?.note).toContain('Accepted Brainstorm seeds');
	});

	it('normalizes legacy targets and avoids arrays', () => {
		const normalized = normalizeGenerationContext({
			targets: ['Ari'],
			avoids: ['Sable Court'],
		});

		expect(normalized?.hints).toEqual([
			{ name: 'Ari', intent: 'target', source: 'manual' },
			{ name: 'Sable Court', intent: 'avoid', source: 'manual' },
		]);
	});

	it('converts legacy free-text context to typed note', () => {
		const converted = legacyStringToGenerationContext('  Keep it coastal-noir.  ');
		expect(converted).toEqual({ note: 'Keep it coastal-noir.' });
	});

	it('resolves conflicting target+avoid for the same name — first-seen intent wins', () => {
		const normalized = normalizeGenerationContext({
			hints: [
				{ name: 'Oayara', intent: 'target', source: 'title' },
				{ name: 'Oayara', intent: 'avoid', source: 'manual' },
			],
		});

		const oayaraHints = normalized?.hints?.filter((h) => h.name.toLowerCase() === 'oayara');
		expect(oayaraHints).toHaveLength(1);
		expect(oayaraHints?.[0].intent).toBe('target');
	});

	it('caps hints at 50 before deduplication', () => {
		const manyHints = Array.from({ length: 60 }, (_, i) => ({
			name: `Entity${i}`,
			intent: 'target' as const,
			source: 'manual' as const,
		}));
		const normalized = normalizeGenerationContext({ hints: manyHints });
		expect(normalized?.hints?.length).toBeLessThanOrEqual(50);
	});

	it('builds prompt note with target and avoid guidance', () => {
		const note = buildPromptContextNote({
			note: 'Ground the output in project context.',
			hints: [
				{ name: 'Oayara', intent: 'target', source: 'title' },
				{ name: 'Ash Court', intent: 'avoid', source: 'manual' },
			],
		});

		expect(note).toContain('Ground the output in project context.');
		expect(note).toContain('Prioritize these entities if relevant: Oayara');
		expect(note).toContain('Avoid making these entities the primary generated outputs: Ash Court');
	});
});

describe('extractNameCandidates', () => {
	it('extracts non-sentence-initial capitalized words', () => {
		const results = extractNameCandidates('The Shadow of Oayara', 'Oayara seeks Sable Court.');
		expect(results).toContain('Oayara');
		expect(results).toContain('Sable');
	});

	it('skips sentence-initial words', () => {
		const results = extractNameCandidates('', 'Thorn is a mercenary. Kaela follows him.');
		// 'Thorn' and 'Kaela' are sentence-initial → excluded
		// 'Kaela' would be excluded too
		expect(results).not.toContain('Thorn');
		expect(results).not.toContain('Kaela');
	});

	it('skips stopwords even when capitalized mid-sentence', () => {
		const results = extractNameCandidates('', 'The kingdom ruled by The and Or and But.');
		expect(results).not.toContain('The');
		expect(results).not.toContain('Or');
		expect(results).not.toContain('But');
	});

	it('deduplicates case-insensitively', () => {
		const results = extractNameCandidates(
			'The tale of Oayara',
			'the story of Oayara continues. Oayara will prevail.',
		);
		const count = results.filter((r) => r.toLowerCase() === 'oayara').length;
		expect(count).toBe(1);
	});

	it('returns empty array for empty inputs', () => {
		expect(extractNameCandidates('', '')).toEqual([]);
	});

	it('caps results at 12', () => {
		const synopsis =
			'a sentence with Alpha Beta Gamma Delta Epsilon Zeta Eta Theta Iota Kappa Lambda Mu Nu Xi Omicron.';
		const results = extractNameCandidates('', synopsis);
		expect(results.length).toBeLessThanOrEqual(12);
	});
});
