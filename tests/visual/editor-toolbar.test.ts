import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * plan-023 stage-002 phase-005 — Editor toolbar visual baselines.
 *
 *  1. 1280×800 — full editor toolbar visible in pill-shaped chrome.
 *  2. 900×800  — narrower viewport; PillToolbar wraps via flex-wrap
 *     (decision logged in impl-log: wrap > "More" menu for v1).
 */

async function waitForStableRender(page: Page) {
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(500);
}

async function seedEditorProject(request: APIRequestContext, label: string) {
	const projectRes = await request.post('/api/db/projects', {
		data: { title: `Visual Editor Toolbar ${label}` },
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
			content: '<p>The toolbar should hover above this scene.</p>',
		},
	});
	expect(sceneRes.ok()).toBe(true);

	return { projectId };
}

test.describe('Visual Regression — Editor toolbar (plan-023 stage-002)', () => {
	test('Editor toolbar — 1280×800 (desktop, full pill)', async ({ page, request }) => {
		const { projectId } = await seedEditorProject(request, 'Desktop');
		try {
			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto(`/projects/${projectId}/editor`);
			await waitForStableRender(page);
			const toolbar = page.locator('header.editor-toolbar');
			await expect(toolbar).toBeVisible();
			await expect(toolbar).toHaveScreenshot('editor-toolbar-1280x800.png');
		} finally {
			await request.delete(`/api/db/projects/${projectId}`);
		}
	});

	test('Editor toolbar — 900×800 (narrow, wraps)', async ({ page, request }) => {
		const { projectId } = await seedEditorProject(request, 'Narrow');
		try {
			await page.setViewportSize({ width: 900, height: 800 });
			await page.goto(`/projects/${projectId}/editor`);
			await waitForStableRender(page);
			const toolbar = page.locator('header.editor-toolbar');
			await expect(toolbar).toBeVisible();
			await expect(toolbar).toHaveScreenshot('editor-toolbar-900x800.png');
		} finally {
			await request.delete(`/api/db/projects/${projectId}`);
		}
	});
});
