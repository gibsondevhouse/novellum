import { test, expect } from '@playwright/test';

test.describe('Project lifecycle', () => {
	test('creates a project, opens the editor, and navigates to export', async ({ page }) => {
		await page.goto('/');

		// Create a new project.
		const newProjectButton = page.getByRole('button', { name: /new project/i });
		await newProjectButton.click();

		// Fill in the project title.
		const titleInput = page.getByLabel(/title/i);
		await titleInput.fill('E2E Test Novel');
		await page.getByRole('button', { name: /create|save/i }).click();

		// Should be in the project hub or editor.
		await expect(page).toHaveURL(/projects\//);

		// Open the editor (navigate to it if in hub).
		const editorLink = page.getByRole('link', { name: /editor|write/i });
		if ((await editorLink.count()) > 0) {
			await editorLink.click();
		}

		// Type into the editor.
		const editorArea = page.locator('[contenteditable="true"]').first();
		await editorArea.click();
		await page.keyboard.type('Once upon a time in a workspace far away.');

		// Autosave indicator should appear (saved / autosaved / check).
		await expect(
			page
				.getByText(/saved|autosaved/i)
				.or(page.locator('[data-testid="autosave-status"]'))
		).toBeVisible({ timeout: 5000 });

		// Navigate to export.
		const exportLink = page
			.getByRole('button', { name: /export/i })
			.or(page.getByRole('link', { name: /export/i }));
		await exportLink.click();
		await expect(
			page
				.getByRole('dialog')
				.or(page.locator('[data-testid="export-modal"]'))
		).toBeVisible();
	});
});
