import { describe, expect, it } from 'vitest';
import {
	buildProposalDuplicateCandidates,
	MIN_DUPLICATE_EVIDENCE_SCORE,
} from '$lib/ai/pipeline/worldbuild-proposal-schema.js';

describe('buildProposalDuplicateCandidates', () => {
	it('surfaces exact normalized canon matches as review evidence', () => {
		const candidates = buildProposalDuplicateCandidates({
			categoryId: 'personae',
			entityKind: 'character',
			identifier: '  ELARA   VOSS ',
			canonIdentifiers: ['Elara Voss'],
		});

		expect(candidates).toHaveLength(1);
		expect(candidates[0]).toMatchObject({
			displayName: 'Elara Voss',
			matchKind: 'exact_key',
			score: 1,
		});
		expect(candidates[0].evidence[0].kind).toBe('exact_key');
	});

	it('surfaces near matches without requiring exact key collisions', () => {
		const candidates = buildProposalDuplicateCandidates({
			categoryId: 'atlas',
			entityKind: 'location',
			identifier: 'Glass Delta Crossing',
			canonIdentifiers: ['Glass Delta Market', 'Unrelated Citadel'],
		});

		expect(candidates).toHaveLength(1);
		expect(candidates[0].displayName).toBe('Glass Delta Market');
		expect(candidates[0].matchKind).toBe('token_overlap');
		expect(candidates[0].score).toBeGreaterThanOrEqual(MIN_DUPLICATE_EVIDENCE_SCORE);
	});

	it('sorts candidates by score and caps the returned evidence list', () => {
		const candidates = buildProposalDuplicateCandidates({
			categoryId: 'threads',
			entityKind: 'plot_thread',
			identifier: 'Missing Courier Conspiracy',
			canonIdentifiers: [
				'Missing Courier',
				'Courier Conspiracy',
				'Missing Conspiracy',
				'Sea Festival',
			],
			maxCandidates: 2,
		});

		expect(candidates).toHaveLength(2);
		expect(candidates[0].score).toBeGreaterThanOrEqual(candidates[1].score);
		expect(candidates.map((candidate) => candidate.displayName)).not.toContain('Sea Festival');
	});

	it('does not produce evidence for weak token overlap', () => {
		const candidates = buildProposalDuplicateCandidates({
			categoryId: 'chronicles',
			entityKind: 'timeline_event',
			identifier: 'The Fall of Tal',
			canonIdentifiers: ['Winter Treaty', 'Ash Coronation'],
		});

		expect(candidates).toHaveLength(0);
	});
});
