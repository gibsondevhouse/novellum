import { test, expect } from '@playwright/test';

/**
 * plan-022 stage-001 — Settings shell visual baseline.
 *
 * Captures the new categorized settings IA at the canonical landing route
 * (`/settings/appearance`) so the PillNav, page header, and placeholder
 * body are pinned together.
 */

async function waitForStableRender(page: import('@playwright/test').Page) {
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(500);
}

test.use({ viewport: { width: 1280, height: 800 } });

test('Settings shell — Appearance landing', async ({ page }) => {
	await page.goto('/settings/appearance');
	await waitForStableRender(page);
	await expect(page).toHaveScreenshot('settings-shell.png');
});
