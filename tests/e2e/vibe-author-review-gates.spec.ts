import { test, expect, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';

/**
 * End-to-end coverage for the vibe-author review-gate flow shipped in
 * plan-027-v1.1-scoping / stage-003 / phase-003.
 *
 * The cards rendered by part-002 (`NovaSceneDraftCard`,
 * `NovaRevisionPackCard`) MUST NOT mutate manuscript content — Accept
 * surfaces an envelope to the future editor accept-pipeline, Reject is
 * local-only, and Copy uses the clipboard. This spec mirrors
 * `vibe-worldbuild-checkpoints.spec.ts` and exercises the shared
 * `/api/db/project-metadata/{projectId}/pipeline/{ownerId}/{key}`
 * lifecycle for both author task keys, then asserts that neither
 * `chapters` nor `scenes` were touched as a side effect.
 *
 * Prerequisites:
 *   - Preview server running at http://localhost:4173 (Playwright launches it).
 */

const OWNER_ID = 'vibe-author';
const SCENE_DRAFT_KEY = 'vibe-author.scene-draft';
const REVISION_PACK_KEY = 'vibe-author.revision-pack';

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

function buildSceneDraftArtifact() {
	return {
		id: randomUUID(),
		taskKey: SCENE_DRAFT_KEY,
		family: 'vibe-author' as const,
		stage: 'scene-draft',
		parserVersion: '1.0.0',
		producedAt: new Date().toISOString(),
		lifecycle: 'draft' as const,
		payload: {
			prose:
				'The lantern guttered once before Vesper steadied the wick. She would not let it die tonight.',
			sidecar: {
				sceneId: 'scene-001',
				chapterId: 'chapter-001',
				povCharacterId: 'character-vesper',
				wordCount: 18,
				usedCanonRefs: {
					characterIds: ['character-vesper'],
					locationIds: ['location-bell-tower'],
					factionIds: [],
					loreEntryIds: [],
				},
				uncertainties: ['Confirm whether the bell tower is half-flooded in this scene.'],
				continuityRisks: [],
			},
		},
	};
}

function buildRevisionPackArtifact() {
	return {
		id: randomUUID(),
		taskKey: REVISION_PACK_KEY,
		family: 'vibe-author' as const,
		stage: 'revision-pack',
		parserVersion: '1.0.0',
		producedAt: new Date().toISOString(),
		lifecycle: 'draft' as const,
		payload: {
			summary: 'Two continuity nudges and one pacing tweak.',
			issues: [
				{
					id: 'issue-low-001',
					severity: 'low',
					kind: 'style',
					location: 'chapter-001/scene-001',
					description: 'Repeated adverb in opening paragraph.',
					recommendation: 'Tighten the second sentence.',
				},
				{
					id: 'issue-crit-001',
					severity: 'critical',
					kind: 'continuity',
					location: 'chapter-001/scene-001',
					description: 'Lantern was already extinguished two scenes prior.',
					recommendation: 'Reconcile the lantern timeline before publishing.',
				},
				{
					id: 'issue-high-001',
					severity: 'high',
					kind: 'character',
					location: 'chapter-001/scene-001',
					description: 'POV character knows information not yet introduced.',
					recommendation: 'Move the reveal earlier or recast the POV.',
				},
			],
		},
	};
}

interface CheckpointEnvelope {
	ok: boolean;
	checkpoint: {
		id: string;
		lifecycle: 'draft' | 'review' | 'accepted' | 'rejected';
	};
}

async function putCheckpoint(
	request: APIRequestContext,
	projectId: string,
	key: string,
	checkpointId: string,
	body: Record<string, unknown>,
): Promise<CheckpointEnvelope> {
	const url = `/api/db/project-metadata/${projectId}/pipeline/${OWNER_ID}/${key}/${checkpointId}`;
	const response = await request.put(url, { data: body });
	expect(response.ok(), `PUT ${url} failed: ${response.status()}`).toBe(true);
	return (await response.json()) as CheckpointEnvelope;
}

async function fetchScenes(
	request: APIRequestContext,
	projectId: string,
): Promise<unknown[]> {
	const response = await request.get(`/api/db/scenes?projectId=${projectId}`);
	expect(response.ok()).toBe(true);
	return (await response.json()) as unknown[];
}

async function fetchChapters(
	request: APIRequestContext,
	projectId: string,
): Promise<unknown[]> {
	const response = await request.get(`/api/db/chapters?projectId=${projectId}`);
	expect(response.ok()).toBe(true);
	return (await response.json()) as unknown[];
}

test.describe('vibe-author review-gate flow', () => {
	test('drafts, reviews, accepts and rejects scene-draft + revision-pack envelopes without mutating manuscript content', async ({
		request,
	}) => {
		const projectId = await createProject(request, `E2E Author Review ${Date.now()}`);
		try {
			// Baseline: manuscript is empty for a freshly created project.
			const scenesBefore = await fetchScenes(request, projectId);
			const chaptersBefore = await fetchChapters(request, projectId);
			expect(scenesBefore).toEqual([]);
			expect(chaptersBefore).toEqual([]);

			// ── scene-draft: draft → review → accept ────────────────────
			const sceneDraft = buildSceneDraftArtifact();
			const sceneCheckpointId = sceneDraft.id;

			const draftedScene = await putCheckpoint(
				request,
				projectId,
				SCENE_DRAFT_KEY,
				sceneCheckpointId,
				{ operation: 'upsert', value: { artifact: sceneDraft, version: '1.0.0' } },
			);
			expect(draftedScene.checkpoint.lifecycle).toBe('draft');

			const reviewedScene = await putCheckpoint(
				request,
				projectId,
				SCENE_DRAFT_KEY,
				sceneCheckpointId,
				{ operation: 'review', reviewer: 'author-qa' },
			);
			expect(reviewedScene.checkpoint.lifecycle).toBe('review');

			const acceptedScene = await putCheckpoint(
				request,
				projectId,
				SCENE_DRAFT_KEY,
				sceneCheckpointId,
				{ operation: 'accept', acceptedBy: 'author-qa' },
			);
			expect(acceptedScene.checkpoint.lifecycle).toBe('accepted');

			// Guardrail: accept must NOT auto-write into the manuscript.
			expect(await fetchScenes(request, projectId)).toEqual([]);
			expect(await fetchChapters(request, projectId)).toEqual([]);

			// ── revision-pack: draft → reject ───────────────────────────
			const revisionPack = buildRevisionPackArtifact();
			const revisionCheckpointId = revisionPack.id;

			const draftedRevision = await putCheckpoint(
				request,
				projectId,
				REVISION_PACK_KEY,
				revisionCheckpointId,
				{ operation: 'upsert', value: { artifact: revisionPack, version: '1.0.0' } },
			);
			expect(draftedRevision.checkpoint.lifecycle).toBe('draft');

			const rejectedRevision = await putCheckpoint(
				request,
				projectId,
				REVISION_PACK_KEY,
				revisionCheckpointId,
				{
					operation: 'reject',
					rejectedBy: 'author-qa',
					reason: 'Issue prioritisation needs another pass.',
				},
			);
			expect(rejectedRevision.checkpoint.lifecycle).toBe('rejected');

			// Reject must also leave the manuscript pristine.
			expect(await fetchScenes(request, projectId)).toEqual([]);
			expect(await fetchChapters(request, projectId)).toEqual([]);
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
