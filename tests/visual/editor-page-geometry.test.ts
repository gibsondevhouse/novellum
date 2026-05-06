import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * plan-023 stage-001 — Editor page geometry visual baselines.
 *
 * Captures two viewports of the rewritten editor page surface:
 *   1. 1280×800 — page is visibly inset, capped at the editor measure,
 *      shadowed and rounded card on the surface-raised background.
 *   2. 600×900 — page collapses to full-bleed (no shadow / radius)
 *      so phones do not waste horizontal pixels on margins.
 *
 * Snapshots live under
 *   tests/visual/__screenshots__/visual/editor-page-geometry.test.ts/.
 */

async function waitForStableRender(page: Page) {
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(500);
}

async function seedEditorProject(request: APIRequestContext, label: string) {
	const projectRes = await request.post('/api/db/projects', {
		data: { title: `Visual Editor Geometry ${label}` },
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
			title: 'Opening',
			order: 0,
			content:
				'<p>The city woke under a wire-thin rain.</p><p>Every streetlight hummed like an old machine refusing sleep.</p>',
		},
	});
	expect(sceneRes.ok()).toBe(true);

	return { projectId };
}

test.describe('Visual Regression — Editor page geometry (plan-023 stage-001)', () => {
	test('Editor page — 1280×800 inset (desktop)', async ({ page, request }) => {
		const { projectId } = await seedEditorProject(request, 'Desktop');
		try {
			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto(`/projects/${projectId}/editor`);
			await waitForStableRender(page);
			await expect(page).toHaveScreenshot('editor-page-1280x800.png');
		} finally {
			await request.delete(`/api/db/projects/${projectId}`);
		}
	});

	test('Editor page — 600×900 full-bleed (mobile)', async ({ page, request }) => {
		const { projectId } = await seedEditorProject(request, 'Mobile');
		try {
			await page.setViewportSize({ width: 600, height: 900 });
			await page.goto(`/projects/${projectId}/editor`);
			await waitForStableRender(page);
			await expect(page).toHaveScreenshot('editor-page-600x900.png');
		} finally {
			await request.delete(`/api/db/projects/${projectId}`);
		}
	});
});
