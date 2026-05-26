import { test, expect, type APIRequestContext } from '@playwright/test';

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

test.describe('Onboarding flow', () => {
	test('navigates through all steps and ends at project hub', async ({ page, request }) => {
		let createdProjectId: string | null = null;
		try {
			await page.goto('/onboarding');
			await expect(page).toHaveURL(/onboarding/);

			await page.getByRole('button', { name: /get started/i }).click();
			await page.getByRole('button', { name: /got it/i }).click();
			await page.getByRole('button', { name: /^continue$/i }).click();
			await page.getByRole('button', { name: /i understand/i }).click();
			await page.getByRole('button', { name: /skip for now/i }).click();

			await page.getByLabel(/project title/i).fill(`Onboarding E2E ${Date.now()}`);
			await page.getByRole('button', { name: /create project/i }).click();

			await expect(page).toHaveURL(/\/projects\/[^/]+/);
			const match = page.url().match(/\/projects\/([^/?#]+)/);
			createdProjectId = match?.[1] ?? null;
		} finally {
			if (createdProjectId) {
				await deleteProject(request, createdProjectId);
			}
		}
	});
});
