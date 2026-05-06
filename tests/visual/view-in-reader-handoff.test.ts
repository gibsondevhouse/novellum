import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * plan-023 stage-003 phase-004 — view-in-reader handoff baseline.
 *
 * Confirms that visiting `/books/<id>?scene=<sceneId>` mounts the reader
 * cleanly with a real seeded scene id. Default reader mode is `classic`,
 * so the layout we capture is ClassicReaderView with the deep-link prop
 * applied. The single 1280×800 baseline guards against regressions in
 * the route-level wiring (query param read, prop forwarding, no error
 * boundary firing).
 */

async function waitForStableRender(page: Page) {
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(500);
}

async function seedReaderProject(request: APIRequestContext, label: string) {
	const projectRes = await request.post('/api/db/projects', {
		data: { title: `Visual View-in-Reader ${label}` },
	});
	expect(projectRes.ok()).toBe(true);
	const { id: projectId } = (await projectRes.json()) as { id: string };

	const chapterRes = await request.post('/api/db/chapters', {
		data: { projectId, title: 'Chapter One', order: 0 },
	});
	expect(chapterRes.ok()).toBe(true);
	const { id: chapterId } = (await chapterRes.json()) as { id: string };

	const sceneRes = await request.post('/api/db/scenes', {
		data: {
			projectId,
			chapterId,
			title: 'Opening Scene',
			order: 0,
			content: '<p>The reader should mount cleanly with the deep-link prop applied.</p>',
		},
	});
	expect(sceneRes.ok()).toBe(true);
	const { id: sceneId } = (await sceneRes.json()) as { id: string };

	return { projectId, sceneId };
}

test.describe('Visual Regression — View-in-Reader handoff (plan-023 stage-003)', () => {
	test('Reader at /books/[id]?scene=<sceneId> — 1280×800', async ({ page, request }) => {
		const { projectId, sceneId } = await seedReaderProject(request, 'Handoff');
		try {
			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto(`/books/${projectId}?scene=${encodeURIComponent(sceneId)}`);
			await waitForStableRender(page);
			// Sanity: the URL's `?scene=` query is preserved (route does not rewrite it).
			expect(page.url()).toContain(`scene=${encodeURIComponent(sceneId)}`);
			await expect(page).toHaveScreenshot('view-in-reader-handoff.png');
		} finally {
			await request.delete(`/api/db/projects/${projectId}`);
		}
	});
});
