import { test, expect, type APIRequestContext } from '@playwright/test';

async function setOnboardingCompleted(request: APIRequestContext): Promise<void> {
	const response = await request.put('/api/db/preferences/app.onboarding.completed', {
		data: { value: true },
	});
	expect(response.ok()).toBe(true);
}

test.describe('AI key configuration', () => {
	test('renders the OpenRouter settings controls', async ({ page, request }) => {
		await setOnboardingCompleted(request);

		await page.goto('/settings/ai');
		await expect(page).toHaveURL(/settings\/ai/);
		await expect(page.getByRole('heading', { name: /ai integration/i })).toBeVisible();

		const keyInput = page
			.getByLabel(/openrouter api key|replace openrouter api key/i)
			.or(page.locator('input[type="password"]').first());
		await expect(keyInput).toBeVisible();

		const saveButton = page
			.getByRole('button', { name: /save key|replace key/i })
			.or(page.getByRole('button', { name: /save|apply/i }));
		await expect(saveButton.first()).toBeVisible();
		await expect(page.getByRole('button', { name: /test connection/i })).toBeVisible();
	});
});
