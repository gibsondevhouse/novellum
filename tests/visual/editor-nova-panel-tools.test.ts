import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * plan-023 stage-006 phase-004 — Editor Nova panel tool-call/tool-result baseline.
 *
 * Mounts the editor, opens the Nova panel, then seeds one tool-call +
 * one tool-result message via Vite's dev-server source import (the
 * Nova module is already loaded on the page; we reach into its
 * exported `novaSession` store via dynamic import to keep the test
 * deterministic and free of /api/ai mocking).
 */

async function waitForStableRender(page: Page) {
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(500);
}

async function seedEditorProject(request: APIRequestContext, label: string) {
	const projectRes = await request.post('/api/db/projects', {
		data: { title: `Visual Nova Tools ${label}` },
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
			content: '<p>Tool-call rendering baseline.</p>',
		},
	});
	expect(sceneRes.ok()).toBe(true);

	return { projectId };
}

test.describe('Visual Regression — Editor Nova tool-call / tool-result (plan-023 stage-006)', () => {
	test('Editor with Nova panel showing a tool-call + tool-result pair — 1280×800', async ({
		page,
		request,
	}) => {
		const { projectId } = await seedEditorProject(request, 'Tools');
		try {
			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto(`/projects/${projectId}/editor`);
			await waitForStableRender(page);

			const novaToggle = page.getByRole('button', { name: 'Nova' });
			await novaToggle.click();
			await page.waitForSelector('aside[aria-label="Nova copilot"]');

			// Seed messages via the Nova module barrel. The dev server
			// (Vite) serves source files at /src/*; the editor route
			// already imported the module so this dynamic import resolves
			// to the same singleton store.
			await page.evaluate(async () => {
				// @ts-expect-error -- resolved at runtime by the Vite dev server
				const mod = await import('/src/modules/nova/index.ts');
				mod.novaSession.clear();
				mod.novaSession.append({
					role: 'user',
					content: 'Add a new character named Aria.',
					status: 'complete',
				});
				mod.novaSession.append({
					role: 'tool-call',
					content: '',
					toolId: 'worldbuilding.create-character',
					toolPayload: { name: 'Aria', role: 'protagonist', summary: 'A reluctant hero.' },
				});
				mod.novaSession.append({
					role: 'tool-result',
					content: '',
					toolId: 'worldbuilding.create-character',
					toolPayload: {
						status: 'not-yet-supported',
						output: null,
						error:
							'Tool worldbuilding.create-character is registered but not yet wired (planned for plan-XXX).',
					},
				});
			});

			await page.waitForSelector('[data-testid="nova-tool-call"]');
			await page.waitForSelector('[data-testid="nova-tool-result"]');
			await page.waitForTimeout(250);

			await expect(page).toHaveScreenshot('editor-nova-panel-tools.png');
		} finally {
			await request.delete(`/api/db/projects/${projectId}`);
		}
	});
});
