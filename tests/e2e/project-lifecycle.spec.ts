import { test, expect, type APIRequestContext } from '@playwright/test';

async function setOnboardingCompleted(request: APIRequestContext): Promise<void> {
	const response = await request.put('/api/db/preferences/app.onboarding.completed', {
		data: { value: true },
	});
	expect(response.ok()).toBe(true);
}

async function createProject(request: APIRequestContext, title: string): Promise<string> {
	const response = await request.post('/api/db/projects', {
		data: { title, targetWordCount: 80000 },
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function createChapter(
	request: APIRequestContext,
	projectId: string,
	title: string,
): Promise<string> {
	const response = await request.post('/api/db/chapters', {
		data: {
			projectId,
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
			content: '',
		},
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

test.describe('Project lifecycle', () => {
	test('creates a project, opens the editor, and navigates to export', async ({ page, request }) => {
		await setOnboardingCompleted(request);
		const projectId = await createProject(request, `E2E Test Novel ${Date.now()}`);
		try {
			const chapterId = await createChapter(request, projectId, 'Chapter 1');
			const sceneId = await createScene(request, projectId, chapterId, 'Opening Scene');

			await page.goto(`/projects/${projectId}/editor/${sceneId}`);
			const editorArea = page.locator('[contenteditable="true"]').first();
			await editorArea.click();
			await page.keyboard.type('Once upon a time in a workspace far away.');

			await expect(page.locator('.save-status')).toContainText(/saving|saved|retrying/i, {
				timeout: 7000,
			});

			await page.goto(`/projects/${projectId}`);
			await page.getByRole('button', { name: /export manuscript/i }).click();
			await expect(page.getByRole('dialog', { name: /export json options/i })).toBeVisible();
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
