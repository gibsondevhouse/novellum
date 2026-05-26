import { test, expect, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';

/**
 * End-to-end coverage for the vibe-worldbuild checkpoint flow shipped in
 * plan-027-v1.1-scoping / stage-002.
 *
 * Prerequisites:
 *   - Preview server running at http://localhost:4173 (Playwright launches it).
 *
 * The spec exercises the `/api/db/project-metadata/{projectId}/pipeline/
 * {ownerId}/{key}` endpoints with the discriminated `operation` payload
 * (upsert | review | accept | reject) introduced for the `'pipeline'`
 * metadata scope. No UI exists yet for the worldbuild checkpoint console,
 * so we drive the REST surface directly — matching `arc-hierarchy-flow`'s
 * pattern of seeding entities via `/api/db/*`.
 */

const PIPELINE_TASK_KEY = 'vibe-worldbuild.populated-world-bible';
const OWNER_ID = 'vibe-worldbuild';

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

function buildPopulatedBibleArtifact(taskKey = PIPELINE_TASK_KEY) {
	const factionName = 'Lanternbearers';
	return {
		id: randomUUID(),
		taskKey,
		family: 'vibe-worldbuild',
		stage: 'populated-world-bible',
		parserVersion: '1.0.0',
		producedAt: new Date().toISOString(),
		lifecycle: 'draft',
		payload: {
			canonical: {
				characters: [{ name: 'Vesper Ardent' }],
				locations: [{ name: 'Vault of Quiet Bells' }],
				factions: [{ name: factionName }],
				loreEntries: [{ title: 'The Soft Light Doctrine' }],
				timelineEvents: [{ title: 'Festival of Returning Light' }],
				themes: [{ title: 'Quiet rebellion against forgetting' }],
				glossary: [{ term: 'Lumengloss' }],
				relationships: [{ title: 'Vesper and the Magistrate' }],
			},
			tableWrites: {
				characters: [
					{
						name: 'Vesper Ardent',
						role: 'protagonist',
						bio: 'A lantern-keeper who refuses to extinguish her memories.',
						faction: factionName,
						traits: ['watchful'],
						goals: ['preserve the archives'],
						flaws: ['too trusting'],
						tags: ['lead'],
						notes: 'Mentored by the previous Lantern Warden.',
					},
				],
				locations: [
					{
						name: 'Vault of Quiet Bells',
						description: 'An archive carved into a half-flooded bell tower.',
						tags: ['archive'],
					},
				],
				factions: [
					{
						name: factionName,
						type: 'guild',
						description: 'Keepers of the lantern archives.',
						mission: 'Preserve memory through light.',
						ideology: 'Remembrance is resistance.',
					},
				],
				themes: [
					{
						title: 'Quiet rebellion against forgetting',
						description: 'Memory as an act of defiance.',
						tensionPair: 'remembrance vs erasure',
						imagery: 'half-lit lanterns',
					},
				],
				glossary_terms: [
					{
						term: 'Lumengloss',
						definition: 'A polished crystal that fixes light into a memory token.',
						pronunciation: 'loo-men-gloss',
						category: 'artifact',
					},
				],
				lore_entries: [
					{
						title: 'The Soft Light Doctrine',
						category: 'doctrine',
						content: 'A code dictating how lanterns may be extinguished.',
						tags: ['canon'],
					},
				],
				plot_threads: [
					{
						title: 'Vesper and the Magistrate',
						description: 'A struggle over what should be archived.',
						status: 'planned',
						relatedSceneIds: [],
						relatedCharacterIds: [],
					},
				],
				timeline_events: [
					{
						title: 'Festival of Returning Light',
						description: 'A yearly ritual where lanterns are relit communally.',
						date: 'Year 38',
						relatedCharacterIds: [],
						relatedSceneIds: [],
					},
				],
			},
		},
	};
}

interface CheckpointEnvelope {
	ok: boolean;
	checkpoint: {
		id: string;
		lifecycle: 'draft' | 'review' | 'accepted' | 'rejected';
		review: { reviewer?: string; note?: string; movedAt: string } | null;
		acceptance: { acceptedBy?: string; acceptedAt: string } | null;
		rejection: { reason: string; rejectedBy?: string; rejectedAt: string } | null;
	};
}

async function putCheckpoint(
	request: APIRequestContext,
	projectId: string,
	checkpointId: string,
	body: Record<string, unknown>,
): Promise<CheckpointEnvelope> {
	const url = `/api/db/project-metadata/${projectId}/pipeline/${OWNER_ID}/${checkpointId}`;
	const response = await request.put(url, { data: body });
	expect(response.ok(), `PUT ${url} failed: ${response.status()}`).toBe(true);
	return (await response.json()) as CheckpointEnvelope;
}

async function putCheckpointExpectStatus(
	request: APIRequestContext,
	projectId: string,
	checkpointId: string,
	body: Record<string, unknown>,
	expectedStatus: number,
): Promise<{ status: number; payload: { error: string; code: string } }> {
	const url = `/api/db/project-metadata/${projectId}/pipeline/${OWNER_ID}/${checkpointId}`;
	const response = await request.put(url, { data: body });
	expect(response.status()).toBe(expectedStatus);
	return {
		status: response.status(),
		payload: (await response.json()) as { error: string; code: string },
	};
}

test.describe('vibe-worldbuild checkpoint flow', () => {
	test('drafts, reviews, and accepts a populated world-bible checkpoint', async ({ request }) => {
		const projectId = await createProject(request, `E2E Worldbuild ${Date.now()}`);
		try {
			const artifact = buildPopulatedBibleArtifact();
			const checkpointId = artifact.id;

			// 1. Draft
			const draft = await putCheckpoint(request, projectId, checkpointId, {
				operation: 'upsert',
				value: { artifact, version: '1.0.0' },
			});
			expect(draft.checkpoint.lifecycle).toBe('draft');

			// 2. Move to review
			const reviewed = await putCheckpoint(request, projectId, checkpointId, {
				operation: 'review',
				reviewer: 'qa-bot',
				note: 'Ready for canon adoption.',
			});
			expect(reviewed.checkpoint.lifecycle).toBe('review');
			expect(reviewed.checkpoint.review?.reviewer).toBe('qa-bot');

			// 3. Accept — atomic projection into 8 canon tables
			const accepted = await putCheckpoint(request, projectId, checkpointId, {
				operation: 'accept',
				acceptedBy: 'qa-bot',
			});
			expect(accepted.checkpoint.lifecycle).toBe('accepted');
			expect(accepted.checkpoint.acceptance?.acceptedBy).toBe('qa-bot');

			// Verify canon-side projection landed
			const characters = await request.get(`/api/db/characters?projectId=${projectId}`);
			expect(characters.ok()).toBe(true);
			const characterList = (await characters.json()) as Array<{
				name: string;
				faction: string | null;
				factionId: string | null;
			}>;
			expect(characterList.some((c) => c.name === 'Vesper Ardent')).toBe(true);

			const factions = await request.get(`/api/db/factions?projectId=${projectId}`);
			expect(factions.ok()).toBe(true);
			const factionList = (await factions.json()) as Array<{ id: string; name: string }>;
			const lantern = factionList.find((f) => f.name === 'Lanternbearers');
			expect(lantern).toBeDefined();

			const vesper = characterList.find((c) => c.name === 'Vesper Ardent');
			expect(vesper?.factionId).toBe(lantern?.id);

			// 4. Idempotent re-accept does not duplicate canon writes
			await putCheckpoint(request, projectId, checkpointId, { operation: 'accept' });
			const charactersAfter = (await (
				await request.get(`/api/db/characters?projectId=${projectId}`)
			).json()) as unknown[];
			expect(charactersAfter.length).toBe(characterList.length);
		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('rejects a checkpoint with a reason and prevents canon projection', async ({
		request,
	}) => {
		const projectId = await createProject(request, `E2E Worldbuild Reject ${Date.now()}`);
		try {
			const artifact = buildPopulatedBibleArtifact();
			const checkpointId = artifact.id;

			await putCheckpoint(request, projectId, checkpointId, {
				operation: 'upsert',
				value: { artifact, version: '1.0.0' },
			});

			const rejected = await putCheckpoint(request, projectId, checkpointId, {
				operation: 'reject',
				rejectedBy: 'qa-bot',
				reason: 'Conflicts with established faction hierarchy.',
			});
			expect(rejected.checkpoint.lifecycle).toBe('rejected');
			expect(rejected.checkpoint.rejection?.reason).toContain('Conflicts');

			// Canon tables remain empty for this project
			const characters = (await (
				await request.get(`/api/db/characters?projectId=${projectId}`)
			).json()) as unknown[];
			expect(characters).toEqual([]);

			const factions = (await (
				await request.get(`/api/db/factions?projectId=${projectId}`)
			).json()) as unknown[];
			expect(factions).toEqual([]);

			// 409 on accept-after-reject
			const conflict = await putCheckpointExpectStatus(
				request,
				projectId,
				checkpointId,
				{ operation: 'accept' },
				409,
			);
			expect(conflict.payload.code).toBe('invalid_transition');
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
