import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	acceptWorldbuildProposalForReview,
	rejectWorldbuildProposalForReview,
} from '../../src/modules/world-building/services/worldbuild-proposal-actions.js';
import {
	getSuggestionById,
	getTotalPendingCount,
	refreshSuggestions,
	upsertSuggestionLocal,
} from '../../src/modules/world-building/stores/worldbuild-suggestion-state.svelte.js';
import type { WorldbuildProposalRecord } from '../../src/lib/ai/pipeline/worldbuild-proposal-schema.js';

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function makeProposal(
	overrides: Partial<WorldbuildProposalRecord> = {},
): WorldbuildProposalRecord {
	return {
		proposalId: 'proposal-action-001',
		projectId: 'project-action-001',
		categoryId: 'personae',
		entityKind: 'character',
		status: 'pending_review',
		generatedAt: '2026-06-16T12:30:00.000Z',
		sourceContext: {
			title: 'Action Test',
			genre: 'fantasy',
			logline: 'A cartographer redraws a forbidden border.',
			synopsisHash: 'actions',
		},
		confidence: 0.91,
		reasoningSummary: 'Adds a reviewable cartographer.',
		payload: { name: 'Mara Venn', role: 'Cartographer' },
		dedupeKey: 'personae:character:mara-venn',
		acceptance: null,
		rejection: null,
		...overrides,
	};
}

describe('worldbuild proposal review actions', () => {
	beforeEach(async () => {
		await refreshSuggestions(null);
	});

	afterEach(async () => {
		vi.unstubAllGlobals();
		await refreshSuggestions(null);
	});

	it('upserts accepted proposals after server success', async () => {
		const pending = makeProposal();
		const accepted = makeProposal({
			status: 'accepted',
			acceptance: {
				acceptedAt: '2026-06-16T12:31:00.000Z',
				acceptedBy: null,
				projectionTarget: 'personae',
				projectedToCanon: true,
			},
		});
		upsertSuggestionLocal(pending);
		vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: true, proposal: accepted })));

		const result = await acceptWorldbuildProposalForReview(
			pending.projectId,
			pending.proposalId,
		);

		expect(result).toMatchObject({ ok: true, action: 'accepted' });
		expect(getTotalPendingCount()).toBe(0);
		expect(getSuggestionById(pending.proposalId)?.status).toBe('accepted');
	});

	it('upserts rejected proposals after server success', async () => {
		const pending = makeProposal();
		const rejected = makeProposal({
			status: 'rejected',
			rejection: {
				rejectedAt: '2026-06-16T12:32:00.000Z',
				rejectedBy: null,
				reason: 'Not for this draft.',
			},
		});
		upsertSuggestionLocal(pending);
		vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: true, proposal: rejected })));

		const result = await rejectWorldbuildProposalForReview(
			pending.projectId,
			pending.proposalId,
			'Not for this draft.',
		);

		expect(result).toMatchObject({ ok: true, action: 'rejected' });
		expect(getTotalPendingCount()).toBe(0);
		expect(getSuggestionById(pending.proposalId)?.rejection?.reason).toBe('Not for this draft.');
	});

	it('keeps local pending data on conflict responses', async () => {
		const pending = makeProposal();
		upsertSuggestionLocal(pending);
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => jsonResponse({ message: 'Proposal is already accepted.' }, 422)),
		);

		const result = await acceptWorldbuildProposalForReview(
			pending.projectId,
			pending.proposalId,
		);

		expect(result).toEqual({
			ok: false,
			kind: 'conflict',
			error: 'Proposal is already accepted.',
			status: 422,
			code: undefined,
		});
		expect(getTotalPendingCount()).toBe(1);
		expect(getSuggestionById(pending.proposalId)?.status).toBe('pending_review');
	});

	it('keeps local pending data on network failure responses', async () => {
		const pending = makeProposal();
		upsertSuggestionLocal(pending);
		vi.stubGlobal('fetch', vi.fn(async () => {
			throw new Error('Network offline.');
		}));

		const result = await rejectWorldbuildProposalForReview(
			pending.projectId,
			pending.proposalId,
			'Not for this draft.',
		);

		expect(result).toEqual({
			ok: false,
			kind: 'failed',
			error: 'Network offline.',
			status: undefined,
			code: undefined,
		});
		expect(getTotalPendingCount()).toBe(1);
		expect(getSuggestionById(pending.proposalId)?.status).toBe('pending_review');
	});
});
