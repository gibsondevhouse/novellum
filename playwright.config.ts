import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for visual regression testing.
 *
 * Requires the dev server to be running at http://localhost:5173 before executing.
 * Run: `pnpm run dev` in a separate terminal.
 */
export default defineConfig({
	testDir: './tests/visual',
	outputDir: './tests/visual/test-results',
	snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',

	/* Fail fast — visual regression is not a large suite */
	fullyParallel: false,
	retries: 0,
	workers: 1,

	reporter: [['list'], ['html', { outputFolder: 'tests/visual/playwright-report', open: 'never' }]],

	use: {
		baseURL: process.env.BASE_URL || 'http://localhost:5173',
		/* Consistent viewport for screenshot comparison */
		viewport: { width: 1280, height: 720 },
		/* No animations — deterministic screenshots */
		reducedMotion: 'reduce',
		colorScheme: 'dark',
		screenshot: 'only-on-failure'
	},

	expect: {
		toHaveScreenshot: {
			/* 1% pixel tolerance for anti-aliasing and rendering variance */
			maxDiffPixelRatio: 0.01,
			animations: 'disabled'
		}
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
