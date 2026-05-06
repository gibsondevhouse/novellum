import { test, expect } from '@playwright/test';

test.describe('Hub word count', () => {
	test('shows a word count > 0 after creating a project with content', async ({ page }) => {
		await page.goto('/');

		// Create project.
		await page.getByRole('button', { name: /new project/i }).click();
		await page.getByLabel(/title/i).fill('Word Count Test Novel');
		await page.getByRole('button', { name: /create|save/i }).click();

		// Open editor and add content to a scene.
		const editorLink = page.getByRole('link', { name: /editor|write/i });
		if ((await editorLink.count()) > 0) await editorLink.click();

		const editorArea = page.locator('[contenteditable="true"]').first();
		await editorArea.click();
		await page.keyboard.type('The quick brown fox jumped over the lazy dog. '.repeat(10));
		// Wait for autosave.
		await page.waitForTimeout(2000);

		// Navigate back to the hub.
		await page.goto('/');
		// Find the project card and check word count.
		const projectCard = page.getByText('Word Count Test Novel').locator('..').locator('..');
		const wordCountEl = projectCard.getByText(/\d+\s*(words?|w)/i);
		await expect(wordCountEl).toBeVisible({ timeout: 5000 });

		const text = await wordCountEl.textContent();
		const count = parseInt(text?.match(/\d+/)?.[0] ?? '0', 10);
		expect(count).toBeGreaterThan(0);
	});
});
