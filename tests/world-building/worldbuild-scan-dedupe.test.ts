import { describe, expect, it } from 'vitest';
import {
	buildProposalDedupeKey,
	isDuplicateProposalKey,
	clampConfidence,
	MIN_PROPOSAL_CONFIDENCE,
	MAX_PROPOSALS_PER_SCAN,
} from '../../src/lib/ai/pipeline/worldbuild-proposal-schema.js';

describe('buildProposalDedupeKey', () => {
	it('builds a colon-delimited key from category, entityKind, and identifier', () => {
		const key = buildProposalDedupeKey('personae', 'character', 'Elara Voss');
		expect(key).toBe('personae:character:elara voss');
	});

	it('lowercases the primary identifier', () => {
		const key = buildProposalDedupeKey('atlas', 'location', 'THE DUSTMARKET');
		expect(key).toBe('atlas:location:the dustmarket');
	});

	it('collapses multiple spaces in the identifier', () => {
		const key = buildProposalDedupeKey('archive', 'lore_entry', 'The  Binding  Accord');
		expect(key).toBe('archive:lore_entry:the binding accord');
	});

	it('trims leading and trailing whitespace from the identifier', () => {
		const key = buildProposalDedupeKey('threads', 'plot_thread', '  Lost Courier  ');
		expect(key).toBe('threads:plot_thread:lost courier');
	});

	it('produces the same key for semantically equivalent identifiers', () => {
		const k1 = buildProposalDedupeKey('chronicles', 'timeline_event', 'Fall of Tal');
		const k2 = buildProposalDedupeKey('chronicles', 'timeline_event', 'fall of TAL');
		expect(k1).toBe(k2);
	});

	it('distinguishes keys from different categories', () => {
		const k1 = buildProposalDedupeKey('personae', 'character', 'Elara');
		const k2 = buildProposalDedupeKey('atlas', 'location', 'Elara');
		expect(k1).not.toBe(k2);
	});

	it('distinguishes keys from different entity kinds', () => {
		const k1 = buildProposalDedupeKey('archive', 'lore_entry', 'The Accord');
		const k2 = buildProposalDedupeKey('archive', 'faction', 'The Accord');
		expect(k1).not.toBe(k2);
	});
});

describe('isDuplicateProposalKey', () => {
	it('returns true when candidate key is in the existing set', () => {
		const existing = new Set(['personae:character:elara voss', 'atlas:location:ember city']);
		expect(isDuplicateProposalKey('personae:character:elara voss', existing)).toBe(true);
	});

	it('returns false when candidate key is not in the existing set', () => {
		const existing = new Set(['personae:character:elara voss']);
		expect(isDuplicateProposalKey('personae:character:doran tal', existing)).toBe(false);
	});

	it('returns false for an empty existing set', () => {
		expect(isDuplicateProposalKey('personae:character:new char', new Set())).toBe(false);
	});

	it('is case-sensitive (dedupe keys are pre-normalized to lowercase)', () => {
		const existing = new Set(['personae:character:elara voss']);
		// Non-normalized key would not match
		expect(isDuplicateProposalKey('personae:character:Elara Voss', existing)).toBe(false);
	});
});

describe('clampConfidence', () => {
	it('returns the value unchanged when within [0, 1]', () => {
		expect(clampConfidence(0.75)).toBe(0.75);
	});

	it('clamps values above 1 to 1', () => {
		expect(clampConfidence(1.5)).toBe(1);
	});

	it('clamps values below 0 to 0', () => {
		expect(clampConfidence(-0.1)).toBe(0);
	});

	it('returns exactly 0 and 1 for boundary inputs', () => {
		expect(clampConfidence(0)).toBe(0);
		expect(clampConfidence(1)).toBe(1);
	});
});

describe('proposal constants', () => {
	it('MIN_PROPOSAL_CONFIDENCE is 0.2', () => {
		expect(MIN_PROPOSAL_CONFIDENCE).toBe(0.2);
	});

	it('MAX_PROPOSALS_PER_SCAN is 5', () => {
		expect(MAX_PROPOSALS_PER_SCAN).toBe(5);
	});
});
