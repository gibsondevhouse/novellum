import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * plan-023 stage-005 phase-006 — Editor Nova panel mid-conversation baseline.
 *
 * Mounts the editor with a seeded project, opens the Nova panel via the
 * toolbar button, intercepts `/api/ai` to return a deterministic SSE
 * stream, types a prompt, submits, and waits for the assistant message
 * to settle into the `complete` status. The resulting baseline shows a
 * full conversation (user bubble + assistant prose).
 */

async function waitForStableRender(page: Page) {
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(500);
}

async function seedEditorProject(request: APIRequestContext, label: string) {
	const projectRes = await request.post('/api/db/projects', {
		data: { title: `Visual Nova Conversation ${label}` },
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

function buildSseBody(text: string): string {
	const event = JSON.stringify({ choices: [{ delta: { content: text } }] });
	return `data: ${event}\n\ndata: [DONE]\n\n`;
}

test.describe('Visual Regression — Editor Nova conversation (plan-023 stage-005)', () => {
	test('Editor with Nova panel mid-conversation — 1280×800', async ({ page, request }) => {
		const { projectId } = await seedEditorProject(request, 'Mid');
		try {
			await page.route('**/api/ai', async (route) => {
				await route.fulfill({
					status: 200,
					headers: {
						'Content-Type': 'text/event-stream',
						'Cache-Control': 'no-cache',
						Connection: 'keep-alive',
					},
					body: buildSseBody(
						'Sure — the opening leans into a quiet, observational tone. To raise the stakes, consider sharpening the protagonist\'s immediate goal in the first paragraph.',
					),
				});
			});

			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto(`/projects/${projectId}/editor`);
			await waitForStableRender(page);

			const novaToggle = page.getByRole('button', { name: 'Nova' });
			await novaToggle.click();
			await page.waitForSelector('aside[aria-label="Nova copilot"]');

			const textarea = page.locator('textarea.nova-input');
			await textarea.fill('How can I sharpen the opening?');
			await page.locator('.nova-action-send').click();

			// Wait for the assistant bubble to settle into a non-empty,
			// non-streaming state.
			await page.waitForFunction(() => {
				const bubbles = document.querySelectorAll(
					'.nova-bubble-nova:not(.is-error)',
				);
				const last = bubbles[bubbles.length - 1] as HTMLElement | undefined;
				if (!last) return false;
				const hasTyping = last.querySelector('.nova-typing');
				return !hasTyping && (last.textContent ?? '').trim().length > 20;
			});
			await page.waitForTimeout(250);

			await expect(page).toHaveScreenshot('editor-nova-panel-conversation.png');
		} finally {
			await request.delete(`/api/db/projects/${projectId}`);
		}
	});
});
