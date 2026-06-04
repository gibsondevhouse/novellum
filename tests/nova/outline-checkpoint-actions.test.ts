import { describe, expect, it, vi } from 'vitest';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	OUTLINE_DRAFT_TASK_KEY,
	type OutlineDraft,
	type OutlineDraftCheckpointRecord,
} from '../../src/lib/ai/pipeline/outline-draft-contract.js';
import {
	createOutlineCheckpointActions,
} from '../../src/modules/nova/services/outline-checkpoint-actions.js';

const now = '2026-06-03T14:55:00.000Z';

function createDraft(projectId = 'project-1'): OutlineDraft {
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: `outline-${projectId}`,
		projectId,
		slug: `outline-${projectId}`,
		title: 'Storm Ledger Outline',
		sourceContext: {
			summary: 'Ready context.',
			includedDomains: ['characters'],
			entityCounts: { characters: 1 },
			contextHash: 'ctx-123',
			promptVersion: 'outline-generation-prompt.v1',
		},
		arcs: [
			{
				id: `arc-${projectId}`,
				slug: `arc-${projectId}`,
				title: 'Arc One',
				order: 0,
				summary: '',
				purpose: '',
				acts: [
					{
						id: `act-${projectId}`,
						slug: `act-${projectId}`,
						title: 'Act One',
						order: 0,
						summary: '',
						chapters: [
							{
								id: `chapter-${projectId}`,
								slug: `chapter-${projectId}`,
								title: 'Chapter One',
								order: 0,
								summary: '',
								scenes: [
									{
										id: `scene-${projectId}`,
										slug: `scene-${projectId}`,
										title: 'Scene One',
										order: 0,
										summary: '',
										intent: {
											goal: 'Recover the weather ledger.',
											conflict: 'A rival courier blocks the archive.',
											turn: 'The ledger names the protagonist.',
											outcome: 'The protagonist inherits the conspiracy.',
										},
										characterIds: ['char-1'],
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

function createCheckpoint(
	lifecycle: OutlineDraftCheckpointRecord['lifecycle'] = 'review',
): OutlineDraftCheckpointRecord {
	return {
		id: 'checkpoint-1',
		projectId: 'project-1',
		ownerId: OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
		taskKey: OUTLINE_DRAFT_TASK_KEY,
		version: OUTLINE_DRAFT_SCHEMA_VERSION,
		lifecycle,
		draft: createDraft(),
		createdAt: now,
		updatedAt: now,
		review:
			lifecycle === 'review'
				? {
						reviewedAt: now,
						reviewer: 'outline-generation-route',
						note: 'Ready for review.',
					}
				: null,
		acceptance:
			lifecycle === 'accepted'
				? {
						acceptedAt: now,
						acceptedBy: 'author',
						note: '',
						projectionMode: 'atomic',
						materializedCounts: {
							arcs: 1,
							acts: 1,
							milestones: 0,
							chapters: 1,
							scenes: 1,
							beats: 0,
							stages: 0,
						},
						hierarchyRootIds: {
							arcIds: ['arc-project-1'],
						},
						sceneIntentPersisted: true,
					}
				: null,
		rejection:
			lifecycle === 'rejected'
				? {
						rejectedAt: now,
						rejectedBy: 'author',
						reason: 'Too much plot too early.',
					}
				: null,
	};
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function requestBody(fetchMock: ReturnType<typeof vi.fn>): Record<string, unknown> {
	const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
	return JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
}

describe('outline checkpoint actions', () => {
	it('accepts through the server materialization route', async () => {
		const accepted = createCheckpoint('accepted');
		const fetchMock = vi.fn(async () =>
			jsonResponse({ checkpoint: accepted, materialization: { arcs: 1, scenes: 1 } }),
		);
		const actions = createOutlineCheckpointActions({ fetch: fetchMock });

		const result = await actions.accept({
			projectId: ' project-1 ',
			checkpoint: createCheckpoint('review'),
			acceptedBy: ' author ',
			note: ' looks good ',
		});

		expect(result.checkpoint.lifecycle).toBe('accepted');
		expect(result.materialization).toEqual({ arcs: 1, scenes: 1 });
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/outline/checkpoints/checkpoint-1/accept',
			expect.objectContaining({ method: 'POST' }),
		);
		expect(requestBody(fetchMock)).toEqual({
			projectId: 'project-1',
			acceptedBy: 'author',
			note: 'looks good',
			expectedUpdatedAt: now,
			expectedVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		});
	});

	it('surfaces accept conflict responses without changing the checkpoint locally', async () => {
		const fetchMock = vi.fn(async () =>
			jsonResponse(
				{
					error: 'Existing outline hierarchy is populated.',
					code: 'outline_conflict',
					meta: { arcs: 1 },
				},
				409,
			),
		);
		const actions = createOutlineCheckpointActions({ fetch: fetchMock });

		await expect(
			actions.accept({ projectId: 'project-1', checkpoint: createCheckpoint('review') }),
		).rejects.toMatchObject({
			status: 409,
			code: 'outline_conflict',
			message: 'Existing outline hierarchy is populated.',
			meta: { arcs: 1 },
		});
	});

	it('rejects through the pipeline metadata route with a required trimmed reason', async () => {
		const rejected = createCheckpoint('rejected');
		const fetchMock = vi.fn(async () => jsonResponse({ checkpoint: rejected }));
		const actions = createOutlineCheckpointActions({ fetch: fetchMock });

		const result = await actions.reject({
			projectId: 'project-1',
			checkpoint: createCheckpoint('review'),
			rejectedBy: ' author ',
			reason: ' Too structural. ',
		});

		expect(result.checkpoint.lifecycle).toBe('rejected');
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/db/project-metadata/project-1/pipeline/outlineDraftCheckpoints.v1/checkpoint-1',
			expect.objectContaining({ method: 'PUT' }),
		);
		expect(requestBody(fetchMock)).toEqual({
			operation: 'reject',
			rejectedBy: 'author',
			reason: 'Too structural.',
		});
	});

	it('surfaces structured route failures and blocks blank reject reasons before fetch', async () => {
		const fetchMock = vi.fn(async () =>
			jsonResponse({ error: { message: 'Route failed.', code: 'route_failed' } }, 500),
		);
		const actions = createOutlineCheckpointActions({ fetch: fetchMock });

		await expect(
			actions.reject({
				projectId: 'project-1',
				checkpoint: createCheckpoint('review'),
				reason: 'Real reason.',
			}),
		).rejects.toMatchObject({
			status: 500,
			code: 'route_failed',
			message: 'Route failed.',
		});

		await expect(
			actions.reject({
				projectId: 'project-1',
				checkpoint: createCheckpoint('review'),
				reason: '  ',
			}),
		).rejects.toThrow('Reject reason is required.');
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
