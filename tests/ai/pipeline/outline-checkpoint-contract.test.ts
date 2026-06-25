import { afterEach, describe, expect, it, vi } from 'vitest';
import { AUTHOR_DRAFT_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/author-draft-contract.js';
import { WORLDBUILD_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	type OutlineDraft,
	type OutlineDraftCheckpointRecord,
} from '$lib/ai/pipeline/outline-draft-contract.js';
import {
	OUTLINE_CHECKPOINT_OWNER_ID,
	OutlineCheckpointHelperError,
	assertOutlineCheckpointCanAccept,
	assertOutlineCheckpointCanReject,
	canAcceptOutlineCheckpoint,
	canRejectOutlineCheckpoint,
	createOutlineCheckpointAcceptBody,
	createOutlineCheckpointRejectBody,
	createOutlineCheckpointReviewBody,
	createOutlineCheckpointUpsertBody,
	normalizeOutlineCheckpointId,
	type OutlineCheckpointAcceptTarget,
	type OutlineCheckpointRejectTarget,
} from '$lib/ai/pipeline/outline-checkpoint-contract.js';
import {
	acceptOutlineCheckpoint,
	rejectOutlineCheckpoint,
	reviewOutlineCheckpoint,
	upsertOutlineCheckpoint,
} from '$lib/project-metadata.js';

function createDraft(): OutlineDraft {
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: 'outline-1',
		projectId: 'proj-1',
		slug: 'outline-one',
		title: 'Outline One',
		sourceContext: {
			summary: 'Seeded from current worldbuilding.',
			includedDomains: ['characters'],
			entityCounts: { characters: 2 },
		},
		arcs: [
			{
				id: 'arc-1',
				slug: 'arc-one',
				title: 'Arc One',
				order: 0,
				summary: '',
				purpose: '',
				acts: [
					{
						id: 'act-1',
						slug: 'act-one',
						title: 'Act One',
						order: 0,
						summary: '',
						chapters: [
							{
								id: 'chapter-1',
								slug: 'chapter-one',
								title: 'Chapter One',
								order: 0,
								summary: '',
								scenes: [
									{
										id: 'scene-1',
										slug: 'scene-one',
										title: 'Scene One',
										order: 0,
										summary: '',
										intent: {
											goal: 'Find the archive.',
											conflict: 'The rival faction arrives first.',
											turn: 'The archive is a trap.',
											outcome: 'The protagonist escapes with a partial map.',
										},
										characterIds: [],
										locationIds: [],
										plotThreadIds: [],
									},
								],
							},
						],
					},
				],
			},
		],
	};
}

function createCheckpoint(lifecycle: OutlineDraftCheckpointRecord['lifecycle']): OutlineDraftCheckpointRecord {
	const now = new Date().toISOString();
	return {
		id: 'checkpoint-1',
		projectId: 'proj-1',
		ownerId: OUTLINE_CHECKPOINT_OWNER_ID,
		taskKey: 'vibe-outline.draft',
		version: OUTLINE_DRAFT_SCHEMA_VERSION,
		lifecycle,
		draft: createDraft(),
		createdAt: now,
		updatedAt: now,
		review: null,
		acceptance: null,
		rejection: null,
	};
}

function mockCheckpointResponse(checkpoint = createCheckpoint('review')) {
	const fetchMock = vi.fn(async () => {
		return new Response(JSON.stringify({ checkpoint }), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	});
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
}

function lastFetchCall(fetchMock: ReturnType<typeof vi.fn>): [string, RequestInit] {
	const calls = fetchMock.mock.calls as unknown as Array<[string, RequestInit]>;
	const call = calls.at(-1);
	if (!call) throw new Error('Expected fetch to be called.');
	return call;
}

function lastRequestUrl(fetchMock: ReturnType<typeof vi.fn>): string {
	return String(lastFetchCall(fetchMock)[0]);
}

function lastJsonBody(fetchMock: ReturnType<typeof vi.fn>): Record<string, unknown> {
	const [, init] = lastFetchCall(fetchMock);
	return JSON.parse(String(init.body)) as Record<string, unknown>;
}

describe('outline checkpoint helper contract', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('uses a dedicated owner id that does not collide with shipped checkpoint owners', () => {
		expect(OUTLINE_CHECKPOINT_OWNER_ID).toBe(OUTLINE_DRAFT_CHECKPOINT_OWNER_ID);
		expect(OUTLINE_CHECKPOINT_OWNER_ID).not.toBe(WORLDBUILD_CHECKPOINT_OWNER_ID);
		expect(OUTLINE_CHECKPOINT_OWNER_ID).not.toBe(AUTHOR_DRAFT_CHECKPOINT_OWNER_ID);
	});

	it('creates explicit operation bodies', () => {
		const draft = createDraft();
		expect(createOutlineCheckpointUpsertBody({ draft, version: OUTLINE_DRAFT_SCHEMA_VERSION })).toEqual({
			operation: 'upsert',
			value: { draft, version: OUTLINE_DRAFT_SCHEMA_VERSION },
		});
		expect(createOutlineCheckpointReviewBody({ reviewer: ' reviewer ', note: ' ready ' })).toEqual({
			operation: 'review',
			reviewer: 'reviewer',
			note: 'ready',
		});
		expect(
			createOutlineCheckpointAcceptBody({
				acceptedBy: ' author ',
				expectedUpdatedAt: ' 2026-06-04T15:00:00.000Z ',
				expectedVersion: ` ${OUTLINE_DRAFT_SCHEMA_VERSION} `,
				selectedNodeIds: ['arc:arc-1', 'scene:scene-1'],
			}),
		).toEqual({
			operation: 'accept',
			acceptedBy: 'author',
			expectedUpdatedAt: '2026-06-04T15:00:00.000Z',
			expectedVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
			selectedNodeIds: ['arc:arc-1', 'scene:scene-1'],
		});
		expect(createOutlineCheckpointRejectBody({ rejectedBy: 'author', reason: ' conflict ' })).toEqual({
			operation: 'reject',
			rejectedBy: 'author',
			reason: 'conflict',
		});
	});

	it('blocks malformed checkpoint ids and empty reject reasons before route calls', () => {
		expect(() => normalizeOutlineCheckpointId('  ')).toThrow(OutlineCheckpointHelperError);
		expect(() => createOutlineCheckpointRejectBody({ reason: '  ' })).toThrow(
			OutlineCheckpointHelperError,
		);
	});

	it('does not treat rejected checkpoints as acceptable targets', () => {
		const review = createCheckpoint('review');
		const draft = createCheckpoint('draft');
		const rejected = createCheckpoint('rejected');
		const accepted = createCheckpoint('accepted');

		expect(canAcceptOutlineCheckpoint(review)).toBe(true);
		expect(canAcceptOutlineCheckpoint(rejected)).toBe(false);
		expect(canRejectOutlineCheckpoint(draft)).toBe(true);
		expect(canRejectOutlineCheckpoint(review)).toBe(true);
		expect(canRejectOutlineCheckpoint(accepted)).toBe(false);
		expect(() => assertOutlineCheckpointCanAccept(rejected)).toThrow(OutlineCheckpointHelperError);
		expect(() => assertOutlineCheckpointCanReject(accepted)).toThrow(OutlineCheckpointHelperError);
	});

	it('uses outline owner defaults and mutation bodies in project metadata wrappers', async () => {
		const fetchMock = mockCheckpointResponse();
		const draft = createDraft();

		await upsertOutlineCheckpoint('proj-1', 'checkpoint-1', {
			draft,
			version: OUTLINE_DRAFT_SCHEMA_VERSION,
		});
		expect(lastRequestUrl(fetchMock)).toContain(
			'/api/db/project-metadata/proj-1/pipeline/outlineDraftCheckpoints.v1/checkpoint-1',
		);
		expect(lastJsonBody(fetchMock)).toEqual({
			operation: 'upsert',
			value: { draft, version: OUTLINE_DRAFT_SCHEMA_VERSION },
		});

		await reviewOutlineCheckpoint('proj-1', 'checkpoint-1', { reviewer: 'qa' });
		expect(lastJsonBody(fetchMock)).toEqual({ operation: 'review', reviewer: 'qa' });

		await acceptOutlineCheckpoint(
			'proj-1',
			{
				id: 'checkpoint-1',
				lifecycle: 'review',
				updatedAt: '2026-06-04T15:00:00.000Z',
				version: OUTLINE_DRAFT_SCHEMA_VERSION,
			} satisfies OutlineCheckpointAcceptTarget,
			{ acceptedBy: 'author' },
		);
		expect(lastRequestUrl(fetchMock)).toBe('/api/outline/checkpoints/checkpoint-1/accept');
		expect(lastJsonBody(fetchMock)).toEqual({
			projectId: 'proj-1',
			acceptedBy: 'author',
			expectedUpdatedAt: '2026-06-04T15:00:00.000Z',
			expectedVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		});

		await rejectOutlineCheckpoint(
			'proj-1',
			{ id: 'checkpoint-1', lifecycle: 'draft' } satisfies OutlineCheckpointRejectTarget,
			{ reason: 'Needs a smaller cast.' },
		);
		expect(lastJsonBody(fetchMock)).toEqual({
			operation: 'reject',
			reason: 'Needs a smaller cast.',
		});
	});

	it('fails mutating helpers in SSR/non-browser contexts', async () => {
		vi.stubGlobal('window', undefined);
		vi.stubGlobal('fetch', undefined);

		await expect(
			upsertOutlineCheckpoint('proj-1', 'checkpoint-1', {
				draft: createDraft(),
				version: OUTLINE_DRAFT_SCHEMA_VERSION,
			}),
		).rejects.toThrow('Pipeline checkpoint mutations require a browser context.');
	});
});
