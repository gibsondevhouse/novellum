import { test, expect } from '@playwright/test';

test.describe('Onboarding flow', () => {
	test('navigates through all steps and ends at /', async ({ page }) => {
		// Force onboarding by navigating directly to /onboarding.
		await page.goto('/onboarding');
		await expect(page).toHaveURL(/onboarding/);

		// Step through each onboarding step until the final completion action.
		const continueButton = page.getByRole('button', { name: /continue|next|get started/i });

		// Step through all steps until no more continue buttons or redirect occurs.
		let steps = 0;
		while ((await continueButton.count()) > 0 && steps < 10) {
			await continueButton.click();
			steps++;
			// If redirect happened, break.
			if (!page.url().includes('onboarding')) break;
		}

		// After completing onboarding, should be at root or /projects.
		await expect(page).not.toHaveURL(/onboarding/);
	});
});
