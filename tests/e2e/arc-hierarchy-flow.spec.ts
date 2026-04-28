import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * End-to-end coverage for the Arc → Act → Chapter → Scene workspace flow
 * delivered in plan-013.
 *
 * Prerequisites:
 *   - Dev server running at http://localhost:5173 (`pnpm run dev`).
 *
 * The spec seeds entities via the canonical SQLite-backed `/api/db/*`
 * endpoints to keep the test deterministic and free from AI/network calls.
 */

async function createProject(request: APIRequestContext, title: string): Promise<string> {
	const response = await request.post('/api/db/projects', { data: { title } });
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function createArc(
	request: APIRequestContext,
	projectId: string,
	title: string,
): Promise<string> {
	const response = await request.post('/api/db/arcs', {
		data: {
			projectId,
			title,
			purpose: 'E2E arc',
			description: '',
			arcType: 'main',
			status: 'planning',
			order: 0,
			tags: [],
			characterIds: [],
		},
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function createAct(
	request: APIRequestContext,
	projectId: string,
	arcId: string,
	title: string,
): Promise<string> {
	const response = await request.post('/api/db/acts', {
		data: {
			projectId,
			arcId,
			title,
			planningNotes: '',
			order: 0,
			status: 'planning',
		},
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function createChapter(
	request: APIRequestContext,
	projectId: string,
	actId: string,
	title: string,
): Promise<string> {
	const response = await request.post('/api/db/chapters', {
		data: {
			projectId,
			actId,
			title,
			summary: '',
			order: 0,
			wordCount: 0,
		},
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function createScene(
	request: APIRequestContext,
	projectId: string,
	chapterId: string,
	title: string,
): Promise<string> {
	const response = await request.post('/api/db/scenes', {
		data: {
			projectId,
			chapterId,
			title,
			summary: '',
			order: 0,
			wordCount: 0,
		},
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

test.describe('Arc → Act → Chapter → Scene hierarchy flow', () => {
	test('navigates the full hierarchy and persists across reload', async ({ page, request }) => {
		const projectId = await createProject(request, `E2E Hierarchy ${Date.now()}`);
		const arcId = await createArc(request, projectId, 'The Departure');
		const actId = await createAct(request, projectId, arcId, 'Act One');
		const chapterId = await createChapter(request, projectId, actId, 'Chapter 1');
		await createScene(request, projectId, chapterId, 'Opening');

		// Arcs index
		await page.goto(`/projects/${projectId}/arcs`);
		await expect(page.getByText('The Departure', { exact: false })).toBeVisible();

		// Arc detail
		await page.goto(`/projects/${projectId}/arcs/${arcId}`);
		await expect(page.getByText('Act One', { exact: false })).toBeVisible();

		// Act detail
		await page.goto(`/projects/${projectId}/arcs/${arcId}/acts/${actId}`);
		await expect(page.getByText('Chapter 1', { exact: false })).toBeVisible();

		// Chapter detail
		await page.goto(`/projects/${projectId}/arcs/${arcId}/acts/${actId}/chapters/${chapterId}`);
		await expect(page.getByText('Opening', { exact: false })).toBeVisible();

		// Reload and re-verify chapter detail still shows the scene
		await page.reload();
		await expect(page.getByText('Opening', { exact: false })).toBeVisible();
	});

	test('returns 404 for an arc that does not belong to the project', async ({ page, request }) => {
		const projectA = await createProject(request, `E2E Project A ${Date.now()}`);
		const projectB = await createProject(request, `E2E Project B ${Date.now()}`);
		const arcId = await createArc(request, projectA, 'Foreign Arc');

		const response = await page.goto(`/projects/${projectB}/arcs/${arcId}`);
		expect(response?.status()).toBe(404);
	});
});
