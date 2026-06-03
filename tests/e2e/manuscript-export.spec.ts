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
	content: string,
): Promise<void> {
	const response = await request.post('/api/db/scenes', {
		data: {
			projectId,
			chapterId,
			title,
			summary: '',
			order: 0,
			wordCount: content.split(/\s+/).filter(Boolean).length,
			content,
		},
	});
	expect(response.ok()).toBe(true);
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

test.describe('Manuscript export', () => {
	test('opens the dialog and downloads a Markdown manuscript', async ({ page, request }) => {
		await setOnboardingCompleted(request);
		const title = `E2E Export Novel ${Date.now()}`;
		const projectId = await createProject(request, title);
		try {
			const chapterId = await createChapter(request, projectId, 'Chapter 1');
			await createScene(
				request,
				projectId,
				chapterId,
				'Opening Scene',
				'Once upon a time, the manuscript export path worked.',
			);

			await page.goto(`/projects/${projectId}`);
			await page.getByRole('button', { name: /export manuscript/i }).click();
			const dialog = page.getByRole('dialog', { name: /export manuscript/i });
			await expect(dialog).toBeVisible();
			await expect(dialog.getByText(/1 of 1 chapter selected/i)).toBeVisible();

			const downloadPromise = page.waitForEvent('download');
			await dialog.getByRole('button', { name: /^export manuscript$/i }).click();
			const download = await downloadPromise;

			expect(download.suggestedFilename()).toMatch(/\.md$/);
			await expect(dialog.getByText(/downloaded .*\.md/i)).toBeVisible();
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
