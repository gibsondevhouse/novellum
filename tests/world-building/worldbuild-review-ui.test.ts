/**
 * Review UI state regression tests for the agentic worldbuild scan.
 *
 * Tests the suggestion store selectors and state transitions that drive the
 * proposal review UI. Uses `upsertSuggestionLocal` to seed state and
 * `refreshSuggestions(null)` to reset between tests (no network calls).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
	upsertSuggestionLocal,
	refreshSuggestions,
	getSuggestions,
	getPendingCountForCategory,
	hasPendingForCategory,
	getTotalPendingCount,
	getSuggestionsByCategory,
	getSuggestionsByStatus,
} from '../../src/modules/world-building/stores/worldbuild-suggestion-state.svelte.js';
import type { WorldbuildProposalRecord } from '../../src/lib/ai/pipeline/worldbuild-proposal-schema.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = new Date().toISOString();

function makeProposal(
	overrides: Partial<WorldbuildProposalRecord>,
): WorldbuildProposalRecord {
	return {
		proposalId: 'prop-001',
		projectId: 'proj-001',
		categoryId: 'personae',
		entityKind: 'character',
		status: 'pending_review',
		generatedAt: NOW,
		sourceContext: {
			title: 'Test Novel',
			genre: 'fantasy',
			logline: 'A courier runs.',
			synopsisHash: 'abc12345',
		},
		confidence: 0.8,
		reasoningSummary: 'Test.',
		payload: { name: 'Elara Voss' },
		dedupeKey: 'personae:character:elara voss',
		acceptance: null,
		rejection: null,
		...overrides,
	};
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(async () => {
	// refreshSuggestions(null) resets suggestions = [] without any network call
	await refreshSuggestions(null);
});

describe('initial state (after reset)', () => {
	it('getSuggestions returns empty array', () => {
		expect(getSuggestions()).toHaveLength(0);
	});

	it('getPendingCountForCategory returns 0 for all domains', () => {
		for (const domain of ['personae', 'atlas', 'archive', 'threads', 'chronicles'] as const) {
			expect(getPendingCountForCategory(domain)).toBe(0);
		}
	});

	it('getTotalPendingCount returns 0', () => {
		expect(getTotalPendingCount()).toBe(0);
	});

	it('hasPendingForCategory returns false for all domains', () => {
		for (const domain of ['personae', 'atlas', 'archive', 'threads', 'chronicles'] as const) {
			expect(hasPendingForCategory(domain)).toBe(false);
		}
	});
});

describe('upsertSuggestionLocal: adding pending proposals', () => {
	it('increments pending count for the proposal category', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae' }));
		expect(getPendingCountForCategory('personae')).toBe(1);
		expect(hasPendingForCategory('personae')).toBe(true);
	});

	it('does not affect counts in other categories', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae' }));
		expect(getPendingCountForCategory('atlas')).toBe(0);
		expect(getPendingCountForCategory('archive')).toBe(0);
	});

	it('counts proposals across multiple categories correctly', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae' }));
		upsertSuggestionLocal(makeProposal({ proposalId: 'p2', categoryId: 'personae' }));
		upsertSuggestionLocal(makeProposal({ proposalId: 'p3', categoryId: 'atlas' }));

		expect(getPendingCountForCategory('personae')).toBe(2);
		expect(getPendingCountForCategory('atlas')).toBe(1);
		expect(getTotalPendingCount()).toBe(3);
	});

	it('does not count accepted or rejected proposals as pending', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae', status: 'accepted' }));
		upsertSuggestionLocal(makeProposal({ proposalId: 'p2', categoryId: 'personae', status: 'rejected' }));
		expect(getPendingCountForCategory('personae')).toBe(0);
		expect(getTotalPendingCount()).toBe(0);
	});

	it('does not count failed_validation proposals as pending', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', status: 'failed_validation' }));
		expect(getTotalPendingCount()).toBe(0);
	});
});

describe('upsertSuggestionLocal: update (accept/reject) transitions', () => {
	it('accepting a proposal removes it from pending count', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae', status: 'pending_review' }));
		expect(getPendingCountForCategory('personae')).toBe(1);

		upsertSuggestionLocal(makeProposal({
			proposalId: 'p1',
			categoryId: 'personae',
			status: 'accepted',
			acceptance: { acceptedAt: NOW, acceptedBy: null, projectionTarget: 'personae', projectedToCanon: true },
		}));
		expect(getPendingCountForCategory('personae')).toBe(0);
		expect(getTotalPendingCount()).toBe(0);
	});

	it('rejecting a proposal removes it from pending count', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae', status: 'pending_review' }));
		upsertSuggestionLocal(makeProposal({
			proposalId: 'p1',
			categoryId: 'personae',
			status: 'rejected',
			rejection: { rejectedAt: NOW, rejectedBy: null, reason: '' },
		}));
		expect(getPendingCountForCategory('personae')).toBe(0);
	});

	it('upsert replaces the existing record with the same proposalId', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', status: 'pending_review' }));
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', status: 'accepted' }));

		const all = getSuggestions();
		expect(all).toHaveLength(1);
		expect(all[0].status).toBe('accepted');
	});

	it('partial accept leaves other pending proposals unaffected', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae', status: 'pending_review' }));
		upsertSuggestionLocal(makeProposal({ proposalId: 'p2', categoryId: 'personae', status: 'pending_review' }));

		// Accept only p1
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae', status: 'accepted' }));

		expect(getPendingCountForCategory('personae')).toBe(1);
		expect(getTotalPendingCount()).toBe(1);
	});
});

describe('getSuggestionsByCategory', () => {
	it('returns only proposals for the specified category', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae' }));
		upsertSuggestionLocal(makeProposal({ proposalId: 'p2', categoryId: 'atlas' }));

		expect(getSuggestionsByCategory('personae')).toHaveLength(1);
		expect(getSuggestionsByCategory('atlas')).toHaveLength(1);
		expect(getSuggestionsByCategory('archive')).toHaveLength(0);
	});

	it('filters by status when provided', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae', status: 'pending_review' }));
		upsertSuggestionLocal(makeProposal({ proposalId: 'p2', categoryId: 'personae', status: 'accepted' }));

		expect(getSuggestionsByCategory('personae', 'pending_review')).toHaveLength(1);
		expect(getSuggestionsByCategory('personae', 'accepted')).toHaveLength(1);
		expect(getSuggestionsByCategory('personae')).toHaveLength(2);
	});
});

describe('getSuggestionsByStatus', () => {
	it('returns all proposals with the given status across categories', () => {
		upsertSuggestionLocal(makeProposal({ proposalId: 'p1', categoryId: 'personae', status: 'pending_review' }));
		upsertSuggestionLocal(makeProposal({ proposalId: 'p2', categoryId: 'atlas', status: 'pending_review' }));
		upsertSuggestionLocal(makeProposal({ proposalId: 'p3', categoryId: 'personae', status: 'accepted' }));

		expect(getSuggestionsByStatus('pending_review')).toHaveLength(2);
		expect(getSuggestionsByStatus('accepted')).toHaveLength(1);
		expect(getSuggestionsByStatus('rejected')).toHaveLength(0);
	});
});
