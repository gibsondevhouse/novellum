import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	acceptProposal,
	rejectProposal,
} from '../../src/modules/world-building/services/worldbuilding-proposal-service.js';
import type { WorldbuildProposalRecord } from '../../src/lib/ai/pipeline/worldbuild-proposal-schema.js';

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function lastJsonBody(fetchMock: ReturnType<typeof vi.fn>): Record<string, unknown> {
	const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
	return JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
}

function makeProposal(overrides: Partial<WorldbuildProposalRecord> = {}): WorldbuildProposalRecord {
	return {
		proposalId: 'proposal-1',
		projectId: 'project-1',
		categoryId: 'personae',
		entityKind: 'character',
		status: 'accepted',
		generatedAt: '2026-06-16T12:30:00.000Z',
		sourceContext: {
			title: 'Service Test',
			genre: 'fantasy',
			logline: 'A city forgets its founder.',
			synopsisHash: 'service',
		},
		confidence: 0.87,
		reasoningSummary: 'Adds a service-test proposal.',
		payload: { name: 'Iren Voss' },
		dedupeKey: 'personae:character:iren-voss',
		acceptance: {
			acceptedAt: '2026-06-16T12:31:00.000Z',
			acceptedBy: null,
			projectionTarget: 'personae',
			projectedToCanon: true,
		},
		rejection: null,
		...overrides,
	};
}

describe('worldbuilding proposal service', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('includes projectId when accepting a proposal', async () => {
		const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(acceptProposal('project-1', 'proposal-1')).resolves.toEqual({ ok: true });

		expect(fetchMock).toHaveBeenCalledWith('/api/worldbuilding/proposals/proposal-1/accept', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ projectId: 'project-1' }),
		});
	});

	it('returns the accepted proposal from successful accept responses', async () => {
		const proposal = makeProposal();
		const fetchMock = vi.fn(async () => jsonResponse({ ok: true, proposal }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(acceptProposal('project-1', 'proposal-1')).resolves.toEqual({
			ok: true,
			proposal,
		});
	});

	it('includes projectId and reason when rejecting a proposal', async () => {
		const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(rejectProposal('project-1', 'proposal-1', 'Conflicts with canon.')).resolves.toEqual({
			ok: true,
		});

		expect(fetchMock).toHaveBeenCalledWith('/api/worldbuilding/proposals/proposal-1/reject', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				projectId: 'project-1',
				reason: 'Conflicts with canon.',
			}),
		});
		expect(lastJsonBody(fetchMock)).toEqual({
			projectId: 'project-1',
			reason: 'Conflicts with canon.',
		});
	});

	it('returns status and message text from failed reject responses', async () => {
		const fetchMock = vi.fn(async () => jsonResponse({ message: 'Proposal is already accepted.' }, 422));
		vi.stubGlobal('fetch', fetchMock);

		await expect(rejectProposal('project-1', 'proposal-1', 'No longer needed.')).resolves.toEqual({
			ok: false,
			error: 'Proposal is already accepted.',
			status: 422,
			code: undefined,
		});
	});
});
