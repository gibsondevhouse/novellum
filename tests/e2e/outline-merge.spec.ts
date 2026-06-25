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
}

interface CheckpointEnvelope {
	ok: boolean;
	checkpoint: OutlineDraftCheckpoint;
}

async function createProject(request: APIRequestContext): Promise<string> {
	const response = await request.post('/api/db/projects', {
		data: {
			title: `Outline Merge E2E ${Date.now()}`,
			genre: 'fantasy',
			logline: 'A courier tests a map that changes hands at every bridge.',
			synopsis: 'The selected merge test keeps only the second scene from a generated checkpoint.',
		},
	});
	expect(response.ok(), `Project create failed: ${response.status()} ${await response.text()}`).toBe(
		true,
	);
	return ((await response.json()) as { id: string }).id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

function checkpointUrl(projectId: string, checkpointId: string): string {
	return `/api/db/project-metadata/${encodeURIComponent(projectId)}/pipeline/${OUTLINE_CHECKPOINT_OWNER_ID}/${encodeURIComponent(checkpointId)}`;
}

function buildOutlineDraft(projectId: string) {
	const prefix = `merge-${projectId}`;
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: `outline-${prefix}`,
		projectId,
		slug: `outline-${prefix}`,
		title: 'Selective Merge Outline',
		sourceContext: {
			summary: 'Fixture-backed outline checkpoint for selective merge.',
			includedDomains: ['characters', 'plotThreads'],
			entityCounts: { characters: 1, plotThreads: 1 },
			contextHash: `ctx-${prefix}`,
			promptVersion: 'outline-generation-prompt.v1',
		},
		arcs: [
			{
				id: `arc-${prefix}`,
				slug: `arc-${prefix}`,
				title: 'The Bridge Ledger',
				order: 0,
				summary: 'A courier learns the bridge toll is a secret.',
				purpose: 'Track selective merge behavior.',
				acts: [
					{
						id: `act-${prefix}`,
						slug: `act-${prefix}`,
						title: 'Act One',
						order: 0,
						summary: 'The ledger crosses the river.',
						chapters: [
							{
								id: `chapter-${prefix}`,
								slug: `chapter-${prefix}`,
								title: 'Chapter One',
								order: 0,
								summary: 'The courier chooses which path matters.',
								scenes: [
									{
										id: `scene-one-${prefix}`,
										slug: `scene-one-${prefix}`,
										title: 'The Unselected Toll Gate',
										order: 0,
										summary: 'This scene should remain unmaterialized.',
										intent: {
											goal: 'Pay the old toll.',
											conflict: 'The bridge keeper refuses stale coins.',
											turn: 'The courier spots a newer bridge downstream.',
											outcome: 'The old route is abandoned.',
										},
										povCharacterId: 'char-courier',
										characterIds: ['char-courier'],
										locationIds: ['old-bridge'],
										plotThreadIds: ['ledger'],
									},
									{
										id: `scene-two-${prefix}`,
										slug: `scene-two-${prefix}`,
										title: 'The Selected Moon Bridge',
										order: 1,
										summary: 'This scene should be materialized.',
										intent: {
											goal: 'Cross the moon bridge before dawn.',
											conflict: 'The bridge is closing for the festival.',
											turn: 'The toll keeper recognizes the ledger mark.',
											outcome: 'The courier earns a dangerous escort.',
										},
										povCharacterId: 'char-courier',
										characterIds: ['char-courier'],
										locationIds: ['moon-bridge'],
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
	expect(response.ok(), `PUT ${url} failed: ${response.status()} ${await response.text()}`).toBe(true);
	return (await response.json()) as CheckpointEnvelope;
}

async function seedReviewCheckpoint(
	request: APIRequestContext,
	projectId: string,
): Promise<OutlineDraftCheckpoint> {
	const checkpointId = `outline-merge-${projectId}`;
	const upserted = await putCheckpoint(request, projectId, checkpointId, {
		operation: 'upsert',
		value: {
			draft: buildOutlineDraft(projectId),
			version: OUTLINE_DRAFT_SCHEMA_VERSION,
		},
	});
	expect(upserted.checkpoint.lifecycle).toBe('draft');

	const reviewed = await putCheckpoint(request, projectId, checkpointId, {
		operation: 'review',
		reviewer: 'outline-merge-e2e',
		note: 'Ready for selective merge browser verification.',
	});
	expect(reviewed.checkpoint.lifecycle).toBe('review');
	return reviewed.checkpoint;
}

async function fetchScenes(request: APIRequestContext, projectId: string): Promise<Array<{ id: string; title: string }>> {
	const response = await request.get(`/api/db/scenes?projectId=${encodeURIComponent(projectId)}`);
	expect(response.ok()).toBe(true);
	return (await response.json()) as Array<{ id: string; title: string }>;
}

test.describe('outline selective merge', () => {
	test('accepts the checked merge tree subset from Nova', async ({ page, request }) => {
		test.setTimeout(60_000);
		const projectId = await createProject(request);
		const checkpoint = await seedReviewCheckpoint(request, projectId);
		const prefix = `merge-${projectId}`;
		const unselectedSceneId = `scene-one-${prefix}`;
		const selectedSceneId = `scene-two-${prefix}`;

		try {
			await page.route('**/api/settings/ai-status?*', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ configured: true, providerId: 'openrouter' }),
				});
			});

			await page.goto(`/projects/${projectId}/editor?panel=ai&chapterId=outline-merge-e2e`);

			const card = page.getByTestId('nova-outline-draft-checkpoint-card');
			await expect(card).toBeVisible();
			await expect(card).toContainText('Selective Merge Outline');
			await expect(card.getByTestId('outline-merge-selected-count')).toHaveText('5 selected');

			const unselectedScene = card.locator(`[data-node-id="scene:${unselectedSceneId}"]`);
			const selectedScene = card.locator(`[data-node-id="scene:${selectedSceneId}"]`);
			await expect(unselectedScene).toBeChecked();
			await expect(selectedScene).toBeChecked();

			await unselectedScene.scrollIntoViewIfNeeded();
			await unselectedScene.focus();
			await page.keyboard.press('Space');
			await expect(unselectedScene).not.toBeChecked();
			await expect(selectedScene).toBeChecked();
			await expect(card.getByTestId('outline-merge-selected-count')).toHaveText('4 selected');

			await card.getByTestId('nova-outline-accept').evaluate((button: HTMLButtonElement) => {
				button.click();
			});
			await expect(card.getByTestId('nova-outline-confirm-accept')).toBeVisible();
			await card.getByTestId('nova-outline-confirm-accept').evaluate((button: HTMLButtonElement) => {
				button.click();
			});
			await expect(card).toHaveAttribute('data-lifecycle', 'accepted');
			await expect(card).toContainText('Accepted outline checkpoint.');

			const scenes = await fetchScenes(request, projectId);
			expect(scenes.map((scene) => ({ id: scene.id, title: scene.title }))).toEqual([
				{ id: selectedSceneId, title: 'The Selected Moon Bridge' },
			]);

			const storedCheckpointResponse = await request.get(checkpointUrl(projectId, checkpoint.id));
			expect(storedCheckpointResponse.ok()).toBe(true);
			const storedCheckpoint = (await storedCheckpointResponse.json()) as {
				value: OutlineDraftCheckpoint & {
					acceptance: { materializedCounts: { scenes: number }; sceneIntentPersisted: boolean };
				};
			};
			expect(storedCheckpoint.value.lifecycle).toBe('accepted');
			expect(storedCheckpoint.value.acceptance.materializedCounts.scenes).toBe(1);
			expect(storedCheckpoint.value.acceptance.sceneIntentPersisted).toBe(true);
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
