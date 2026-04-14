import { test, expect } from '@playwright/test';

/**
 * Visual Regression Test Suite
 *
 * Captures screenshots of representative routes and compares them against
 * stored baselines using Playwright's built-in `toHaveScreenshot()`.
 *
 * Prerequisites:
 *   - Dev server running at http://localhost:5173 (`pnpm run dev`)
 *   - Chromium installed (`pnpm exec playwright install chromium`)
 *
 * Usage:
 *   Run tests:        pnpm run test:visual
 *   Update baselines: pnpm run test:visual -- --update-snapshots
 *
 * Threshold policy:
 *   maxDiffPixelRatio: 0.01 (1%) — accounts for anti-aliasing,
 *   sub-pixel rendering, and minor font rendering differences across
 *   environments while catching meaningful layout regressions.
 *
 * Limitations:
 *   Project-specific routes (e.g. /projects/[id]/hub) require a valid
 *   project ID with seeded test data. These are excluded from the
 *   automated baseline suite. To test project routes, create a project
 *   manually and add its ID to the projectRoutes array below.
 */

/** Wait for page to be fully rendered and idle before capturing */
async function waitForStableRender(page: import('@playwright/test').Page) {
	await page.waitForLoadState('networkidle');
	// Allow any CSS transitions or post-render effects to settle
	await page.waitForTimeout(500);
}

test.describe('Visual Regression — Route Family Baselines', () => {
	test.beforeAll(async ({ browser }) => {
		// Verify dev server is accessible
		const context = await browser.newContext();
		const page = await context.newPage();
		try {
			const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 });
			expect(response?.status()).toBeLessThan(400);
		} catch {
			throw new Error(
				'Dev server not reachable at http://localhost:5173. ' +
					'Start it with `pnpm run dev` before running visual regression tests.'
			);
		} finally {
			await context.close();
		}
	});

	/*
	 * ─── Application-Level Routes ───────────────────────────────────
	 * These routes are accessible without project-specific data.
	 */

	test('Home / Library — full page', async ({ page }) => {
		await page.goto('/');
		await waitForStableRender(page);
		await expect(page).toHaveScreenshot('home-library.png');
	});

	test('Books shelf — full page', async ({ page }) => {
		await page.goto('/books');
		await waitForStableRender(page);
		await expect(page).toHaveScreenshot('books-shelf.png');
	});

	test('Stories — full page', async ({ page }) => {
		await page.goto('/stories');
		await waitForStableRender(page);
		await expect(page).toHaveScreenshot('stories.png');
	});

	test('Settings — full page', async ({ page }) => {
		await page.goto('/settings');
		await waitForStableRender(page);
		await expect(page).toHaveScreenshot('settings.png');
	});

	test('Images — full page', async ({ page }) => {
		await page.goto('/images');
		await waitForStableRender(page);
		await expect(page).toHaveScreenshot('images.png');
	});

	test('Nova — full page', async ({ page }) => {
		await page.goto('/nova');
		await waitForStableRender(page);
		await expect(page).toHaveScreenshot('nova.png');
	});

	/*
	 * ─── Project-Level Routes ───────────────────────────────────────
	 * These require a valid project ID with seeded data.
	 * Uncomment and set PROJECT_ID to enable project route baselines.
	 *
	 * const PROJECT_ID = 'your-test-project-id';
	 *
	 * test('Project Hub', async ({ page }) => {
	 *   await page.goto(`/projects/${PROJECT_ID}/hub`);
	 *   await waitForStableRender(page);
	 *   await expect(page).toHaveScreenshot('project-hub.png');
	 * });
	 *
	 * test('Project Editor', async ({ page }) => {
	 *   await page.goto(`/projects/${PROJECT_ID}/editor`);
	 *   await waitForStableRender(page);
	 *   await expect(page).toHaveScreenshot('project-editor.png');
	 * });
	 *
	 * test('Project World Building', async ({ page }) => {
	 *   await page.goto(`/projects/${PROJECT_ID}/world`);
	 *   await waitForStableRender(page);
	 *   await expect(page).toHaveScreenshot('project-world.png');
	 * });
	 */
});
