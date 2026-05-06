import { test, expect } from '@playwright/test';

test.describe('AI key configuration', () => {
	test('enters a key in Settings → AI and sees the configured state', async ({ page }) => {
		await page.goto('/settings/ai');
		await expect(page).toHaveURL(/settings\/ai/);

		// Find the API key input.
		const keyInput = page
			.getByLabel(/api key|openrouter/i)
			.or(page.locator('input[type="password"]').first());
		await keyInput.fill('sk-or-test-key-e2e');

		// Save.
		const saveButton = page.getByRole('button', { name: /save|apply/i });
		await saveButton.click();

		// Expect a "configured" or success indicator.
		await expect(
			page
				.getByText(/configured|saved|key saved/i)
				.or(page.locator('[data-testid="key-status-configured"]'))
		).toBeVisible({ timeout: 3000 });
	});
});
