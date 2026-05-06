/**
 * plan-023 stage-005 phase-006 — NovaPanel chat interactions.
 *
 * Drives the panel via real DOM events; the chat service is mocked so
 * we can observe the user-message append + assistant streaming without
 * touching `OpenRouterClient`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync, tick } from 'svelte';

const sendNovaChatMock = vi.fn();

vi.mock('$modules/nova/services/chat-service.js', () => ({
	sendNovaChat: (...args: unknown[]) => sendNovaChatMock(...args),
}));

import { NovaPanel, novaPanel, novaSession } from '$modules/nova';

describe('NovaPanel.svelte — chat interactions', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		window.sessionStorage.clear();
		novaPanel.close();
		novaSession.clear();
		sendNovaChatMock.mockReset();
	});

	afterEach(() => {
		novaPanel.close();
		novaSession.clear();
		window.sessionStorage.clear();
	});

	it('typing into the textarea + submitting calls sendNovaChat with the prompt', async () => {
		sendNovaChatMock.mockImplementation(async (input: { prompt: string }) => {
			novaSession.append({ role: 'user', content: input.prompt, status: 'complete' });
		});
		const cmp = mount(NovaPanel, {
			target,
			props: { projectId: 'p1', activeSceneId: 's1', activeChapterId: 'c1' },
		});
		novaPanel.open();
		flushSync();

		const textarea = target.querySelector('textarea.nova-input') as HTMLTextAreaElement;
		textarea.value = 'Hello Nova';
		textarea.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		const form = target.querySelector('form.nova-input-form') as HTMLFormElement;
		form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
		await tick();

		expect(sendNovaChatMock).toHaveBeenCalledWith(
			expect.objectContaining({
				prompt: 'Hello Nova',
				projectId: 'p1',
				activeSceneId: 's1',
				activeChapterId: 'c1',
			}),
		);

		flushSync();
		expect(target.textContent).toContain('Hello Nova');
		unmount(cmp);
	});

	it('shows the typing indicator while streaming with empty content', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		novaSession.append({ role: 'user', content: 'hi', status: 'complete' });
		novaSession.beginStream('nova');
		flushSync();

		expect(target.querySelector('.nova-typing')).not.toBeNull();
		unmount(cmp);
	});

	it('replaces Send with Stop while streaming', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		novaSession.beginStream('nova');
		flushSync();

		expect(target.querySelector('.nova-action-send')).toBeNull();
		const stop = target.querySelector('.nova-action-abort') as HTMLButtonElement;
		expect(stop).not.toBeNull();
		expect(stop.textContent?.trim()).toBe('Stop');

		stop.click();
		flushSync();
		expect(novaSession.isStreaming).toBe(false);
		expect(novaSession.messages.at(-1)?.status).toBe('aborted');
		unmount(cmp);
	});

	it('shows "(aborted)" trailing label on aborted assistant messages', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		const stream = novaSession.beginStream('nova');
		novaSession.appendDelta(stream.id, 'partial');
		novaSession.abort(stream.id);
		flushSync();

		expect(target.querySelector('.nova-aborted')?.textContent).toContain('aborted');
		expect(target.textContent).toContain('partial');
		unmount(cmp);
	});

	it('quick-prompt button invokes onQuickPrompt with a non-empty payload', async () => {
		const onQuickPrompt = vi.fn();
		const cmp = mount(NovaPanel, {
			target,
			props: { activeSceneId: 's1', onQuickPrompt },
		});
		novaPanel.open();
		flushSync();

		const btn = target.querySelector('.nova-quick-prompt') as HTMLButtonElement | null;
		expect(btn).not.toBeNull();
		btn!.click();
		await tick();
		expect(onQuickPrompt).toHaveBeenCalledTimes(1);
		expect(typeof onQuickPrompt.mock.calls[0][0]).toBe('string');
		expect(onQuickPrompt.mock.calls[0][0].length).toBeGreaterThan(0);
		unmount(cmp);
	});
});
