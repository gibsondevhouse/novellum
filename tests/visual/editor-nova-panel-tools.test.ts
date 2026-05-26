import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * plan-023 stage-006 phase-004 — Editor Nova panel tool-call/tool-result baseline.
 *
 * Mounts the editor, opens the Nova panel, then seeds one tool-call +
 * one tool-result message via a runtime test hook exposed by the Nova
 * module. This keeps the baseline deterministic without relying on
 * `/src/*` imports that only exist in `pnpm dev`.
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
	// TODO(V1.1): see editor-nova-panel.test.ts — same Linux CI hang.
	test.skip('Editor with Nova panel showing a tool-call + tool-result pair — 1280×800', async ({
		page,
		request,
	}) => {
		const { projectId } = await seedEditorProject(request, 'Tools');
		try {
			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto(`/projects/${projectId}/editor`);
			await waitForStableRender(page);

			const novaToggle = page.getByRole('button', { name: 'Nova', exact: true });
			await novaToggle.click();
			await page.waitForSelector('aside[aria-label="Nova copilot"]');

			await page.evaluate(async () => {
				const hook = (
					window as Window & {
						__NOVELLUM_NOVA_TEST__?: {
							session: {
								clear: () => void;
								append: (message: {
									role: string;
									content: string;
									status?: string;
									toolId?: string;
									toolPayload?: unknown;
								}) => void;
							};
						};
					}
				).__NOVELLUM_NOVA_TEST__;

				if (!hook?.session) throw new Error('Nova test hook missing');

				hook.session.clear();
				hook.session.append({
					role: 'user',
					content: 'Add a new character named Aria.',
					status: 'complete',
				});
				hook.session.append({
					role: 'tool-call',
					content: '',
					toolId: 'worldbuilding.create-character',
					toolPayload: { name: 'Aria', role: 'protagonist', summary: 'A reluctant hero.' },
				});
				hook.session.append({
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
