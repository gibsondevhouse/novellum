import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * plan-023 stage-004 phase-002 — Nova panel baseline.
 *
 * Mounts the editor with a seeded project, toggles the Nova panel via
 * the toolbar button, and captures a 1280×800 baseline. Reuses the
 * seeded-project pattern from `view-in-reader-handoff.test.ts`.
 */

async function waitForStableRender(page: Page) {
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(500);
}

async function seedEditorProject(request: APIRequestContext, label: string) {
	const projectRes = await request.post('/api/db/projects', {
		data: { title: `Visual Nova Panel ${label}` },
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
			content: '<p>The Nova panel should be visible alongside the manuscript.</p>',
		},
	});
	expect(sceneRes.ok()).toBe(true);

	return { projectId };
}

test.describe('Visual Regression — Editor Nova panel (plan-023 stage-004)', () => {
	test('Editor with Nova panel toggled open — 1280×800', async ({ page, request }) => {
		const { projectId } = await seedEditorProject(request, 'Toggle');
		try {
			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto(`/projects/${projectId}/editor`);
			await waitForStableRender(page);

			const novaToggle = page.getByRole('button', { name: 'Nova' });
			await novaToggle.click();
			await page.waitForSelector('aside[aria-label="Nova copilot"]');
			await page.waitForTimeout(250);

			await expect(page).toHaveScreenshot('editor-nova-panel.png');
		} finally {
			await request.delete(`/api/db/projects/${projectId}`);
		}
	});
});
