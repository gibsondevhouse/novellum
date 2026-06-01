import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — use vi.hoisted so references are available inside vi.mock factories
// ---------------------------------------------------------------------------

const {
	acceptProposalAtomicallyMock,
	worldbuildCheckpointServiceMock,
	getProjectMetadataMock,
} = vi.hoisted(() => ({
	acceptProposalAtomicallyMock: vi.fn(),
	worldbuildCheckpointServiceMock: {
		getCheckpoint: vi.fn(),
		listCheckpoints: vi.fn(),
		acceptCheckpoint: vi.fn(),
	},
	getProjectMetadataMock: vi.fn(),
}));

vi.mock('$lib/ai/pipeline/checkpoint-service.js', () => ({
	acceptProposalAtomically: (...args: unknown[]) => acceptProposalAtomicallyMock(...args),
	worldbuildCheckpointService: worldbuildCheckpointServiceMock,
	WorldbuildCheckpointError: class WorldbuildCheckpointError extends Error {
		readonly code: string;
		constructor(code: string, message: string) {
			super(message);
			this.code = code;
		}
	},
}));

vi.mock('$lib/server/project-metadata/project-metadata-service.js', () => ({
	getProjectMetadata: (...args: unknown[]) => getProjectMetadataMock(...args),
	setProjectMetadata: vi.fn(),
}));

// Import after mocks are registered
import { POST as acceptPOST } from '../../src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.js';

// SvelteKit error() throws an HttpError; unwrap it in test context
async function callAccept(
	params: Parameters<typeof acceptPOST>[0],
): Promise<{ status: number; body: unknown }> {
	try {
		const response = await acceptPOST(params);
		return { status: response.status, body: await response.json() };
	} catch (e) {
		const err = e as { status?: number; body?: unknown };
		return { status: err.status ?? 500, body: err.body ?? null };
	}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PROJECT_ID = 'proj-route-001';
const PROPOSAL_ID = 'prop-route-001';

function makeProposal(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
	return {
		proposalId: PROPOSAL_ID,
		projectId: PROJECT_ID,
		categoryId: 'personae',
		entityKind: 'character',
		status: 'pending_review',
		generatedAt: new Date().toISOString(),
		sourceContext: {
			title: 'Test Novel',
			genre: 'fantasy',
			logline: 'A test story.',
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

function makeAcceptRequest(body: Record<string, unknown>): Request {
	return new Request(`http://localhost/api/worldbuilding/proposals/${PROPOSAL_ID}/accept`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/worldbuilding/proposals/[proposalId]/accept', () => {
	beforeEach(() => {
		getProjectMetadataMock.mockReset();
		acceptProposalAtomicallyMock.mockReset();
		worldbuildCheckpointServiceMock.getCheckpoint.mockReset();
		worldbuildCheckpointServiceMock.listCheckpoints.mockReset();
		worldbuildCheckpointServiceMock.acceptCheckpoint.mockReset();
	});

	describe('new-style proposal path', () => {
		it('returns 200 with accepted proposal when atomically accepted', async () => {
			const pendingProposal = makeProposal();
			getProjectMetadataMock.mockReturnValue(pendingProposal);

			const acceptedProposal = makeProposal({
				status: 'accepted',
				acceptance: {
					acceptedAt: new Date().toISOString(),
					acceptedBy: null,
					projectionTarget: 'personae',
					projectedToCanon: true,
				},
			});
			acceptProposalAtomicallyMock.mockReturnValue({ ok: true, proposal: acceptedProposal });

			const { status, body } = await callAccept({
				params: { proposalId: PROPOSAL_ID },
				request: makeAcceptRequest({ projectId: PROJECT_ID }),
			} as Parameters<typeof acceptPOST>[0]);

			expect(status).toBe(200);
			const b = body as { ok: boolean; proposal: Record<string, unknown> };
			expect(b.ok).toBe(true);
			expect(b.proposal.status).toBe('accepted');
			expect((b.proposal.acceptance as Record<string, unknown>)?.projectedToCanon).toBe(true);
			expect(acceptProposalAtomicallyMock).toHaveBeenCalledWith(PROJECT_ID, PROPOSAL_ID);
		});

		it('returns 422 when proposal is already accepted (invalid_transition)', async () => {
			getProjectMetadataMock.mockReturnValue(makeProposal({ status: 'accepted' }));
			acceptProposalAtomicallyMock.mockReturnValue({
				ok: false,
				error: 'Proposal is already accepted and cannot be accepted.',
				code: 'invalid_transition',
			});

			const { status } = await callAccept({
				params: { proposalId: PROPOSAL_ID },
				request: makeAcceptRequest({ projectId: PROJECT_ID }),
			} as Parameters<typeof acceptPOST>[0]);

			expect(status).toBe(422);
		});

		it('returns 422 when projection fails (missing required payload field)', async () => {
			getProjectMetadataMock.mockReturnValue(makeProposal({ payload: {} }));
			acceptProposalAtomicallyMock.mockReturnValue({
				ok: false,
				error: 'Checkpoint projection requires non-empty character name.',
				code: 'projection_failed',
			});

			const { status } = await callAccept({
				params: { proposalId: PROPOSAL_ID },
				request: makeAcceptRequest({ projectId: PROJECT_ID }),
			} as Parameters<typeof acceptPOST>[0]);

			expect(status).toBe(422);
		});

		it('returns 404 when proposal not found in db', async () => {
			getProjectMetadataMock.mockReturnValue(makeProposal());
			acceptProposalAtomicallyMock.mockReturnValue({
				ok: false,
				error: `Proposal ${PROPOSAL_ID} not found.`,
				code: 'not_found',
			});

			const { status } = await callAccept({
				params: { proposalId: PROPOSAL_ID },
				request: makeAcceptRequest({ projectId: PROJECT_ID }),
			} as Parameters<typeof acceptPOST>[0]);

			expect(status).toBe(404);
		});

		it('calls acceptProposalAtomically not setProjectMetadata', async () => {
			getProjectMetadataMock.mockReturnValue(makeProposal());
			acceptProposalAtomicallyMock.mockReturnValue({
				ok: true,
				proposal: makeProposal({ status: 'accepted' }),
			});

			await callAccept({
				params: { proposalId: PROPOSAL_ID },
				request: makeAcceptRequest({ projectId: PROJECT_ID }),
			} as Parameters<typeof acceptPOST>[0]);

			// Must use atomic path — setProjectMetadata should not be called directly
			expect(acceptProposalAtomicallyMock).toHaveBeenCalledOnce();
		});
	});

	describe('legacy checkpoint path', () => {
		it('falls through to legacy path when proposal not in new-style store', async () => {
			// new-style check finds nothing
			getProjectMetadataMock.mockReturnValue(undefined);

			const legacyCheckpoint = { id: PROPOSAL_ID, projectId: PROJECT_ID, lifecycle: 'review' };
			worldbuildCheckpointServiceMock.getCheckpoint.mockReturnValue(legacyCheckpoint);
			worldbuildCheckpointServiceMock.acceptCheckpoint.mockReturnValue({
				...legacyCheckpoint,
				lifecycle: 'accepted',
			});

			const { status, body } = await callAccept({
				params: { proposalId: PROPOSAL_ID },
				request: makeAcceptRequest({ projectId: PROJECT_ID }),
			} as Parameters<typeof acceptPOST>[0]);

			expect(status).toBe(200);
			expect((body as { lifecycle: string }).lifecycle).toBe('accepted');
			expect(acceptProposalAtomicallyMock).not.toHaveBeenCalled();
		});
	});
});
