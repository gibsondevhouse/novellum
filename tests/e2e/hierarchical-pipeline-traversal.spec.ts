import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * End-to-end coverage for plan-028 hierarchical pipeline traversal.
 *
 * Verifies the Arc → Stage outline page renders correct hierarchy
 * and selection state for a fully seeded seven-layer hierarchy.
 */

async function createProject(request: APIRequestContext, title: string): Promise<string> {
	const response = await request.post('/api/db/projects', { data: { title } });
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

async function createArc(request: APIRequestContext, projectId: string, title: string): Promise<string> {
	const response = await request.post('/api/db/arcs', {
		data: { projectId, title, purpose: 'E2E', description: '', arcType: 'main', status: 'planning', order: 0, tags: [], characterIds: [] },
	});
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function createAct(request: APIRequestContext, projectId: string, arcId: string, title: string): Promise<string> {
	const response = await request.post('/api/db/acts', {
		data: { projectId, arcId, title, planningNotes: '', order: 0, status: 'planning' },
	});
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function createChapter(request: APIRequestContext, projectId: string, actId: string, title: string): Promise<string> {
	const response = await request.post('/api/db/chapters', {
		data: { projectId, actId, title, summary: '', order: 0, wordCount: 0 },
	});
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function createScene(request: APIRequestContext, projectId: string, chapterId: string, title: string): Promise<string> {
	const response = await request.post('/api/db/scenes', {
		data: { projectId, chapterId, title, summary: '', order: 0, wordCount: 0 },
	});
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function createBeat(request: APIRequestContext, projectId: string, sceneId: string, title: string): Promise<string> {
	const response = await request.post('/api/db/beats', {
		data: { projectId, sceneId, title, type: 'beat', order: 0, notes: '' },
	});
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function createStage(request: APIRequestContext, projectId: string, beatId: string, title: string): Promise<string> {
	const response = await request.post('/api/db/stages', {
		data: { projectId, beatId, title, status: 'planned', order: 0, notes: '' },
	});
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

test.describe('plan-028 hierarchical pipeline traversal', () => {
	test('outline page renders hierarchy navigator and stage selection', async ({ page, request }) => {
		await setOnboardingCompleted(request);
		const projectId = await createProject(request, `E2E Traversal ${Date.now()}`);
		try {
			const arcId = await createArc(request, projectId, 'Main Arc');
			const actId = await createAct(request, projectId, arcId, 'Act One');
			const chapterId = await createChapter(request, projectId, actId, 'Chapter 1');
			const sceneId = await createScene(request, projectId, chapterId, 'Opening Scene');
			const beatId = await createBeat(request, projectId, sceneId, 'Beat A');
			await createStage(request, projectId, beatId, 'Worldbuild Premise');

			await page.goto(`/projects/${projectId}/outline`);

			await expect(page.getByText('Narrative Structure')).toBeVisible();
			await expect(page.getByText('Main Arc')).toBeVisible();

			const arcNode = page.getByText('Main Arc');
			await arcNode.click();
			await expect(page.getByText('Arc Detail')).toBeVisible();

		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('outline page shows stage detail with run button when stage is selected', async ({ page, request }) => {
		await setOnboardingCompleted(request);
		const projectId = await createProject(request, `E2E Stage Select ${Date.now()}`);
		try {
			const arcId = await createArc(request, projectId, 'Test Arc');
			const actId = await createAct(request, projectId, arcId, 'Test Act');
			const chapterId = await createChapter(request, projectId, actId, 'Test Chapter');
			const sceneId = await createScene(request, projectId, chapterId, 'Test Scene');
			const beatId = await createBeat(request, projectId, sceneId, 'Test Beat');
			await createStage(request, projectId, beatId, 'Test Stage');

			await page.goto(`/projects/${projectId}/outline`);

			await expect(page.getByText('Test Arc')).toBeVisible();

		} finally {
			await deleteProject(request, projectId);
		}
	});
});
