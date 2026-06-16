import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';

const OWNER_ID = 'vibe-worldbuild';
const CHECKPOINT_SCHEMA_VERSION = '1.0.0';
const ARTIFACT_PARSER_VERSION = '1.0.0';

interface OutlineFixture {
	projectId: string;
	stageId: string;
	checkpointId: string;
}

async function createProject(request: APIRequestContext): Promise<string> {
	const response = await request.post('/api/db/projects', {
		data: {
			title: `Outline Review Polish ${Date.now()}`,
			genre: 'fantasy',
			logline: 'A city reorders its history through disputed maps.',
			synopsis: 'An archivist tests whether the map or the memory came first.',
		},
	});
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

async function setOnboardingCompleted(request: APIRequestContext): Promise<void> {
	const response = await request.put('/api/db/preferences/app.onboarding.completed', {
		data: { value: true },
	});
	expect(response.ok()).toBe(true);
}

async function postRecord(
	request: APIRequestContext,
	path: string,
	data: Record<string, unknown>,
): Promise<string> {
	const response = await request.post(path, { data });
	expect(response.ok(), `POST ${path} failed: ${response.status()}`).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function putCheckpoint(
	request: APIRequestContext,
	projectId: string,
	checkpointId: string,
	body: Record<string, unknown>,
): Promise<void> {
	const url = `/api/db/project-metadata/${projectId}/pipeline/${OWNER_ID}/${checkpointId}`;
	const response = await request.put(url, { data: body });
	expect(response.ok(), `PUT ${url} failed: ${response.status()}`).toBe(true);
}

function buildArtifact(input: {
	arcId: string;
	actId: string;
	milestoneId: string;
	chapterId: string;
	sceneId: string;
	beatId: string;
	stageId: string;
	checkpointId: string;
}) {
	return {
		id: input.checkpointId,
		taskKey: 'vibe-worldbuild.premise',
		pipeline: 'vibe-worldbuild',
		stage: 'premise',
		model: null,
		parserVersion: ARTIFACT_PARSER_VERSION,
		producedAt: new Date().toISOString(),
		lifecycle: 'draft',
		hierarchy: {
			order: ['arcs', 'acts', 'milestones', 'chapters', 'scenes', 'beats', 'stages'],
			references: {
				arcs: [input.arcId],
				acts: [input.actId],
				milestones: [input.milestoneId],
				chapters: [input.chapterId],
				scenes: [input.sceneId],
				beats: [input.beatId],
				stages: [input.stageId],
			},
			stageStatusById: { [input.stageId]: 'planned' },
		},
		payload: {
			premise: 'The city charter changes whenever the archive bell rings.',
			conflict: 'Archivists disagree about which version should anchor the outline.',
		},
		notes: ['Seeded for outline review polish browser evidence.'],
	};
}

async function seedOutlineReviewFixture(request: APIRequestContext): Promise<OutlineFixture> {
	await setOnboardingCompleted(request);
	const projectId = await createProject(request);
	const arcId = await postRecord(request, '/api/db/arcs', {
		projectId,
		title: 'Browser Arc',
		purpose: 'Browser verification',
		description: '',
		arcType: 'main',
		status: 'planning',
		order: 0,
		tags: [],
		characterIds: [],
	});
	const actId = await postRecord(request, '/api/db/acts', {
		projectId,
		arcId,
		title: 'Browser Act',
		planningNotes: '',
		order: 0,
		status: 'planning',
	});
	const chapterId = await postRecord(request, '/api/db/chapters', {
		projectId,
		actId,
		title: 'Browser Chapter',
		summary: '',
		order: 0,
		wordCount: 0,
	});
	const milestoneId = await postRecord(request, '/api/db/milestones', {
		projectId,
		actId,
		title: 'Browser Milestone',
		description: '',
		order: 0,
		chapterIds: [chapterId],
	});
	const sceneId = await postRecord(request, '/api/db/scenes', {
		projectId,
		chapterId,
		title: 'Browser Scene',
		summary: '',
		order: 0,
		wordCount: 0,
	});
	const beatId = await postRecord(request, '/api/db/beats', {
		projectId,
		sceneId,
		title: 'Browser Beat',
		type: 'beat',
		order: 0,
		notes: '',
	});
	const stageId = await postRecord(request, '/api/db/stages', {
		projectId,
		beatId,
		title: 'Browser Stage',
		status: 'planned',
		order: 0,
		notes: '',
	});
	const checkpointId = randomUUID();
	const artifact = buildArtifact({
		arcId,
		actId,
		milestoneId,
		chapterId,
		sceneId,
		beatId,
		stageId,
		checkpointId,
	});

	await putCheckpoint(request, projectId, checkpointId, {
		operation: 'upsert',
		value: { artifact, version: CHECKPOINT_SCHEMA_VERSION },
	});
	await putCheckpoint(request, projectId, checkpointId, {
		operation: 'review',
		reviewer: 'outline-polish-e2e',
		note: 'Ready for user-facing detail review.',
	});

	return { projectId, stageId, checkpointId };
}

async function selectStageAndCheckpoint(page: Page, projectId: string): Promise<void> {
	await page.goto(`/projects/${projectId}/outline`);
	await expect(page.getByText('Narrative Structure')).toBeVisible();

	await page.locator('section[data-layer="arc"]').getByRole('button', { name: 'Browser Arc' }).click();
	await page.locator('section[data-layer="act"]').getByRole('button', { name: 'Browser Act' }).click();
	await page
		.locator('section[data-layer="milestone"]')
		.getByRole('button', { name: 'Browser Milestone' })
		.click();
	await page
		.locator('section[data-layer="chapter"]')
		.getByRole('button', { name: 'Browser Chapter' })
		.click();
	await page
		.locator('section[data-layer="scene"]')
		.getByRole('button', { name: 'Browser Scene' })
		.click();
	await page.locator('section[data-layer="beat"]').getByRole('button', { name: 'Browser Beat' }).click();
	await page.locator('section[data-layer="stage"]').getByRole('button', { name: 'Browser Stage' }).click();

	await expect(page.getByRole('heading', { name: 'Stage Detail' })).toBeVisible();
	const checkpointButton = page
		.locator('button.checkpoint-queue__item')
		.filter({ hasText: 'Worldbuilding premise' });
	await expect(checkpointButton).toHaveCount(1);
	await expect(checkpointButton).toContainText('In review');
	await checkpointButton.click();
	await expect(page.locator('section[aria-label="Checkpoint review detail"]')).toBeVisible();
}

async function expectNoTextOverlap(page: Page, selector: string): Promise<void> {
	const overlaps = await page.locator(selector).evaluateAll((nodes) => {
		const elements = nodes
			.filter((node): node is HTMLElement => node instanceof HTMLElement)
			.filter((node) => {
				const style = window.getComputedStyle(node);
				const rect = node.getBoundingClientRect();
				return (
					style.visibility !== 'hidden' &&
					style.display !== 'none' &&
					rect.width > 0 &&
					rect.height > 0
				);
			})
			.map((node, index) => {
				const rect = node.getBoundingClientRect();
				return {
					index,
					text: node.textContent?.trim() ?? '',
					left: rect.left,
					right: rect.right,
					top: rect.top,
					bottom: rect.bottom,
				};
			});

		const failures: string[] = [];
		for (let i = 0; i < elements.length; i += 1) {
			for (let j = i + 1; j < elements.length; j += 1) {
				const a = elements[i];
				const b = elements[j];
				const overlapsX = a.left < b.right - 0.5 && b.left < a.right - 0.5;
				const overlapsY = a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
				if (overlapsX && overlapsY) {
					failures.push(`${a.text} overlaps ${b.text}`);
				}
			}
		}
		return failures;
	});

	expect(overlaps).toEqual([]);
}

test.describe('outline review polish', () => {
	test('desktop checkpoint detail hides raw internals until advanced disclosure opens', async ({
		page,
		request,
	}) => {
		const fixture = await seedOutlineReviewFixture(request);
		try {
			await selectStageAndCheckpoint(page, fixture.projectId);
			const detail = page.locator('section[aria-label="Checkpoint review detail"]');

			await expect(detail).toContainText('Worldbuilding premise');
			await expect(detail).toContainText('In review');
			await expect(detail).toContainText('1 stage');
			await expect(detail).toContainText('Nothing changes until you explicitly accept.');
			await expect(detail.getByText('Raw payload')).toBeHidden();
			await expect(detail.getByText('vibe-worldbuild.premise')).toBeHidden();
			await expect(detail.getByText(fixture.checkpointId)).toBeHidden();

			await expectNoTextOverlap(page, '.checkpoint-queue__item > span, .checkpoint-queue__item > time');
			await expectNoTextOverlap(page, '.checkpoint-detail__fields > dt, .checkpoint-detail__fields > dd');

			await detail.getByText('Advanced details').click();
			await expect(detail.getByText('Raw payload')).toBeVisible();
			await expect(detail.getByText('Task key')).toBeVisible();
			await expect(detail.getByText('vibe-worldbuild.premise')).toBeVisible();
			await expect(detail.getByText(fixture.stageId)).toBeVisible();
		} finally {
			await deleteProject(request, fixture.projectId);
		}
	});

	test('mobile checkpoint detail remains readable without text overlap', async ({
		page,
		request,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		const fixture = await seedOutlineReviewFixture(request);
		try {
			await selectStageAndCheckpoint(page, fixture.projectId);
			const detail = page.locator('section[aria-label="Checkpoint review detail"]');

			await expect(detail).toContainText('Worldbuilding premise');
			await expect(detail).toContainText('In review');
			await expect(detail.getByText('Raw payload')).toBeHidden();

			await expectNoTextOverlap(page, '.checkpoint-queue__item > span, .checkpoint-queue__item > time');
			await expectNoTextOverlap(page, '.checkpoint-detail__fields > dt, .checkpoint-detail__fields > dd');

			await detail.getByText('Advanced details').click();
			await expectNoTextOverlap(
				page,
				'.checkpoint-detail__developer-meta dt, .checkpoint-detail__developer-meta dd',
			);
			await expect(detail.getByText('Raw payload')).toBeVisible();
		} finally {
			await deleteProject(request, fixture.projectId);
		}
	});
});
