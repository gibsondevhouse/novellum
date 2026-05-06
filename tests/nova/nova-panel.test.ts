/**
 * plan-023 stage-004 phase-002 — NovaPanel component test.
 * stage-005 phase-006 — assertions updated for the chat UI.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import { NovaPanel, novaPanel, novaSession, aiSession } from '$modules/nova';

describe('NovaPanel.svelte', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		window.sessionStorage.clear();
		novaPanel.close();
		novaSession.clear();
		aiSession.__resetForTests();
	});

	afterEach(() => {
		novaPanel.close();
		novaSession.clear();
		window.sessionStorage.clear();
	});

	it('renders nothing when closed', () => {
		const cmp = mount(NovaPanel, { target });
		flushSync();
		expect(target.querySelector('aside')).toBeNull();
		unmount(cmp);
	});

	it('renders an accessible aside with name "Nova copilot" when open', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		flushSync();
		const aside = target.querySelector('aside');
		expect(aside).not.toBeNull();
		expect(aside?.getAttribute('aria-label')).toBe('Nova copilot');
		expect(target.textContent).toContain("Hi, I'm Nova");
		unmount(cmp);
	});

	it('close button calls novaPanel.close()', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		flushSync();
		const closeBtn = target.querySelector(
			'button[aria-label="Close Nova"]',
		) as HTMLButtonElement | null;
		expect(closeBtn).not.toBeNull();
		closeBtn!.click();
		flushSync();
		expect(novaPanel.isOpen).toBe(false);
		expect(target.querySelector('aside')).toBeNull();
		unmount(cmp);
	});

	it('exposes a real textarea + Send button when no stream is active', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		flushSync();
		const textarea = target.querySelector('textarea.nova-input') as HTMLTextAreaElement | null;
		expect(textarea).not.toBeNull();
		expect(textarea?.disabled).toBe(false);
		const send = target.querySelector('.nova-action-send');
		expect(send).not.toBeNull();
		unmount(cmp);
	});
});

