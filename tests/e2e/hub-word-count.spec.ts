import { test, expect, type APIRequestContext } from '@playwright/test';

async function setOnboardingCompleted(request: APIRequestContext): Promise<void> {
	const response = await request.put('/api/db/preferences/app.onboarding.completed', {
		data: { value: true },
	});
	expect(response.ok()).toBe(true);
}

async function createProject(request: APIRequestContext, title: string): Promise<string> {
	const response = await request.post('/api/db/projects', { data: { title, targetWordCount: 1000 } });
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

async function createSceneWithContent(
	request: APIRequestContext,
	projectId: string,
	chapterId: string,
): Promise<void> {
	const text = 'The quick brown fox jumped over the lazy dog. '.repeat(10).trim();
	const response = await request.post('/api/db/scenes', {
		data: {
			projectId,
			chapterId,
			title: 'Opening scene',
			summary: '',
			order: 0,
			content: text,
			wordCount: text.split(/\s+/).length,
		},
	});
	expect(response.ok()).toBe(true);
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

test.describe('Hub word count', () => {
	test('shows a word count > 0 after creating a project with content', async ({ page, request }) => {
		await setOnboardingCompleted(request);

		const projectId = await createProject(request, `Word Count Test Novel ${Date.now()}`);
		try {
			const chapterId = await createChapter(request, projectId, 'Chapter 1');
			await createSceneWithContent(request, projectId, chapterId);

			await page.goto(`/projects/${projectId}`);
			await expect(page.locator('.hub-progress-card .hub-card__value')).toBeVisible();

			const text = (await page.locator('.hub-progress-card .hub-card__value').textContent()) ?? '0';
			const count = parseInt(text.replace(/[^\d]/g, ''), 10);
			expect(Number.isFinite(count)).toBe(true);
			expect(count).toBeGreaterThan(0);
		} finally {
			await deleteProject(request, projectId);
		}
	});
});
