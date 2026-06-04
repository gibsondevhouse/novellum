import { expect, test, type APIRequestContext } from '@playwright/test';

const OUTLINE_CHECKPOINT_OWNER_ID = 'outlineDraftCheckpoints.v1';
const OUTLINE_DRAFT_SCHEMA_VERSION = '1.0.0';
const OUTLINE_DRAFT_ARTIFACT_TYPE = 'vibe-outline.draft';
const OUTLINE_DRAFT_ARTIFACT_VERSION = 1;

interface OutlineDraftCheckpoint {
	id: string;
	projectId: string;
	version: string;
	lifecycle: 'draft' | 'review' | 'accepted' | 'rejected';
	updatedAt: string;
	acceptance: {
		materializedCounts: Record<string, number>;
		hierarchyRootIds: { arcIds: string[] };
	} | null;
}

interface CheckpointEnvelope {
	ok: boolean;
	checkpoint: OutlineDraftCheckpoint;
}

type HierarchyTable =
	| 'arcs'
	| 'acts'
	| 'milestones'
	| 'chapters'
	| 'scenes'
	| 'beats'
	| 'stages';

async function createProject(request: APIRequestContext, title: string): Promise<string> {
	const response = await request.post('/api/db/projects', { data: { title } });
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

async function createExistingArc(
	request: APIRequestContext,
	projectId: string,
	title: string,
): Promise<string> {
	const response = await request.post('/api/db/arcs', {
		data: {
			projectId,
			title,
			description: 'Pre-existing outline content.',
			purpose: 'Conflict fixture',
			arcType: 'main',
			order: 0,
		},
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

function checkpointUrl(projectId: string, checkpointId: string): string {
	return `/api/db/project-metadata/${encodeURIComponent(projectId)}/pipeline/${OUTLINE_CHECKPOINT_OWNER_ID}/${encodeURIComponent(checkpointId)}`;
}

function buildOutlineDraft(projectId: string, variant: string) {
	const prefix = `${variant}-${projectId}`;
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: `outline-${prefix}`,
		projectId,
		slug: `outline-${prefix}`,
		title: `Generated Outline ${variant}`,
		sourceContext: {
			summary: 'Fixture-backed generated outline.',
			includedDomains: ['characters', 'plotThreads'],
			entityCounts: { characters: 1, plotThreads: 1 },
			contextHash: `ctx-${variant}`,
			promptVersion: 'outline-generation-prompt.v1',
		},
		arcs: [
			{
				id: `arc-${prefix}`,
				slug: `arc-${prefix}`,
				title: 'Main Arc',
				order: 0,
				summary: 'A courier follows the wrong map into a faction war.',
				purpose: 'Track the main conspiracy reveal.',
				acts: [
					{
						id: `act-${prefix}`,
						slug: `act-${prefix}`,
						title: 'Act One',
						order: 0,
						summary: 'The ledger surfaces.',
						chapters: [
							{
								id: `chapter-${prefix}`,
								slug: `chapter-${prefix}`,
								title: 'Chapter One',
								order: 0,
								summary: 'A courier accepts the wrong job.',
								scenes: [
									{
										id: `scene-${prefix}`,
										slug: `scene-${prefix}`,
										title: 'Scene One',
										order: 0,
										summary: 'The archive door will not open.',
										intent: {
											goal: 'Recover the missing ledger.',
											conflict: 'The faction courier refuses to hand it over.',
											turn: 'The ledger contains the protagonist name.',
											outcome: 'The protagonist becomes implicated in the conspiracy.',
										},
										povCharacterId: 'char-1',
										characterIds: ['char-1'],
										locationIds: ['archive'],
										plotThreadIds: ['ledger'],
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

async function putCheckpoint(
	request: APIRequestContext,
	projectId: string,
	checkpointId: string,
	body: Record<string, unknown>,
): Promise<CheckpointEnvelope> {
	const url = checkpointUrl(projectId, checkpointId);
	const response = await request.put(url, { data: body });
	expect(response.ok(), `PUT ${url} failed: ${response.status()} ${await response.text()}`).toBe(
		true,
	);
	return (await response.json()) as CheckpointEnvelope;
}

async function getCheckpoint(
	request: APIRequestContext,
	projectId: string,
	checkpointId: string,
): Promise<OutlineDraftCheckpoint | null> {
	const response = await request.get(checkpointUrl(projectId, checkpointId));
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { value: OutlineDraftCheckpoint | null };
	return payload.value;
}

async function reviewCheckpoint(
	request: APIRequestContext,
	projectId: string,
	checkpointId: string,
): Promise<OutlineDraftCheckpoint> {
	const response = await putCheckpoint(request, projectId, checkpointId, {
		operation: 'review',
		reviewer: 'outline-e2e',
		note: 'Fixture-backed generation is ready for review.',
	});
	expect(response.checkpoint.lifecycle).toBe('review');
	return response.checkpoint;
}

async function fetchRows(
	request: APIRequestContext,
	table: HierarchyTable,
	projectId: string,
): Promise<unknown[]> {
	const response = await request.get(`/api/db/${table}?projectId=${encodeURIComponent(projectId)}`);
	expect(response.ok()).toBe(true);
	return (await response.json()) as unknown[];
}

async function fetchHierarchyCounts(
	request: APIRequestContext,
	projectId: string,
): Promise<Record<HierarchyTable, number>> {
	const entries = await Promise.all(
		(['arcs', 'acts', 'milestones', 'chapters', 'scenes', 'beats', 'stages'] as const).map(
			async (table) => [table, (await fetchRows(request, table, projectId)).length] as const,
		),
	);
	return Object.fromEntries(entries) as Record<HierarchyTable, number>;
}

function totalHierarchyRows(counts: Record<HierarchyTable, number>): number {
	return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

async function acceptCheckpoint(
	request: APIRequestContext,
	checkpoint: OutlineDraftCheckpoint,
): Promise<{ status: number; body: Record<string, unknown> }> {
	const response = await request.post(`/api/outline/checkpoints/${checkpoint.id}/accept`, {
		data: {
			projectId: checkpoint.projectId,
			expectedUpdatedAt: checkpoint.updatedAt,
			expectedVersion: checkpoint.version,
			acceptedBy: 'outline-e2e',
		},
	});
	return {
		status: response.status(),
		body: (await response.json()) as Record<string, unknown>,
	};
}

test.describe('outline generation review gate', () => {
	test('reviews, rejects, and explicitly accepts fixture-backed generated outlines', async ({
		request,
	}) => {
		const projectId = await createProject(request, `E2E Outline Review ${Date.now()}`);
		try {
			expect(totalHierarchyRows(await fetchHierarchyCounts(request, projectId))).toBe(0);

			const rejectedCheckpointId = `outline-reject-${projectId}`;
			const rejectedDraft = await putCheckpoint(request, projectId, rejectedCheckpointId, {
				operation: 'upsert',
				value: {
					draft: buildOutlineDraft(projectId, 'reject'),
					version: OUTLINE_DRAFT_SCHEMA_VERSION,
				},
			});
			expect(rejectedDraft.checkpoint.lifecycle).toBe('draft');
			await reviewCheckpoint(request, projectId, rejectedCheckpointId);

			const rejected = await putCheckpoint(request, projectId, rejectedCheckpointId, {
				operation: 'reject',
				rejectedBy: 'outline-e2e',
				reason: 'Author wants a leaner midpoint.',
			});
			expect(rejected.checkpoint.lifecycle).toBe('rejected');
			expect(totalHierarchyRows(await fetchHierarchyCounts(request, projectId))).toBe(0);

			const acceptedCheckpointId = `outline-accept-${projectId}`;
			const generated = await putCheckpoint(request, projectId, acceptedCheckpointId, {
				operation: 'upsert',
				value: {
					draft: buildOutlineDraft(projectId, 'accept'),
					version: OUTLINE_DRAFT_SCHEMA_VERSION,
				},
			});
			expect(generated.checkpoint.lifecycle).toBe('draft');
			expect(totalHierarchyRows(await fetchHierarchyCounts(request, projectId))).toBe(0);

			const reviewed = await reviewCheckpoint(request, projectId, acceptedCheckpointId);
			expect(totalHierarchyRows(await fetchHierarchyCounts(request, projectId))).toBe(0);

			const accepted = await acceptCheckpoint(request, reviewed);
			expect(accepted.status).toBe(200);
			expect(accepted.body).toMatchObject({
				ok: true,
				materialization: {
					counts: {
						arcs: 1,
						acts: 1,
						milestones: 1,
						chapters: 1,
						scenes: 1,
						beats: 0,
						stages: 0,
					},
				},
			});

			const counts = await fetchHierarchyCounts(request, projectId);
			expect(counts).toMatchObject({
				arcs: 1,
				acts: 1,
				milestones: 1,
				chapters: 1,
				scenes: 1,
				beats: 0,
				stages: 0,
			});
			const stored = await getCheckpoint(request, projectId, acceptedCheckpointId);
			expect(stored).toMatchObject({
				lifecycle: 'accepted',
				acceptance: {
					materializedCounts: {
						arcs: 1,
						acts: 1,
						milestones: 1,
						chapters: 1,
						scenes: 1,
					},
					hierarchyRootIds: {
						arcIds: [`arc-accept-${projectId}`],
					},
				},
			});
		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('blocks accept when a project already has outline hierarchy rows', async ({ request }) => {
		const projectId = await createProject(request, `E2E Outline Conflict ${Date.now()}`);
		try {
			await createExistingArc(request, projectId, 'Existing Arc');
			expect(await fetchHierarchyCounts(request, projectId)).toMatchObject({
				arcs: 1,
				acts: 0,
				milestones: 0,
				chapters: 0,
				scenes: 0,
				beats: 0,
				stages: 0,
			});

			const checkpointId = `outline-conflict-${projectId}`;
			await putCheckpoint(request, projectId, checkpointId, {
				operation: 'upsert',
				value: {
					draft: buildOutlineDraft(projectId, 'conflict'),
					version: OUTLINE_DRAFT_SCHEMA_VERSION,
				},
			});
			const reviewed = await reviewCheckpoint(request, projectId, checkpointId);

			const blocked = await acceptCheckpoint(request, reviewed);
			expect(blocked.status).toBe(409);
			expect(blocked.body).toMatchObject({
				code: 'outline_conflict',
				meta: {
					counts: {
						arcs: 1,
					},
				},
			});

			expect(await fetchHierarchyCounts(request, projectId)).toMatchObject({
				arcs: 1,
				acts: 0,
				milestones: 0,
				chapters: 0,
				scenes: 0,
				beats: 0,
				stages: 0,
			});
			const stored = await getCheckpoint(request, projectId, checkpointId);
			expect(stored?.lifecycle).toBe('review');
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
