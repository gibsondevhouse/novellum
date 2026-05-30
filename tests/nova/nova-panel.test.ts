/**
 * plan-023 stage-004 phase-002 — NovaPanel component test.
 * stage-005 phase-006 — assertions updated for the chat UI.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import { NovaPanel, novaPanel, novaSession, aiSession } from '$modules/nova';

const PANEL_WIDTH_STORAGE_KEY = 'novellum.nova.panel.width';

function installMatchMediaHarness(initialMatches = false): {
	setMatches: (next: boolean) => void;
	restore: () => void;
} {
	const original = window.matchMedia;
	const listeners = new Set<(event: MediaQueryListEvent) => void>();
	const mediaQuery = '(max-width: 900px)';
	const mql = {
		matches: initialMatches,
		media: mediaQuery,
		onchange: null,
		addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
			listeners.add(listener);
		},
		removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
			listeners.delete(listener);
		},
		addListener: (listener: (event: MediaQueryListEvent) => void) => {
			listeners.add(listener);
		},
		removeListener: (listener: (event: MediaQueryListEvent) => void) => {
			listeners.delete(listener);
		},
		dispatchEvent: () => true,
	} as MediaQueryList;

	Object.defineProperty(window, 'matchMedia', {
		value: vi.fn().mockReturnValue(mql),
		writable: true,
		configurable: true,
	});

	return {
		setMatches(next: boolean) {
			(mql as { matches: boolean }).matches = next;
			const event = { matches: next, media: mediaQuery } as MediaQueryListEvent;
			for (const listener of listeners) listener(event);
			if (typeof mql.onchange === 'function') mql.onchange(event);
		},
		restore() {
			Object.defineProperty(window, 'matchMedia', {
				value: original,
				writable: true,
				configurable: true,
			});
		},
	};
}

describe('NovaPanel.svelte', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		document.documentElement.style.removeProperty('--nova-panel-width');
		document.documentElement.style.removeProperty('--nova-panel-open-offset');
		window.sessionStorage.clear();
		window.localStorage.clear();
		novaPanel.close();
		novaSession.clear();
		aiSession.__resetForTests();
	});

	afterEach(() => {
		novaPanel.close();
		novaSession.clear();
		window.sessionStorage.clear();
		window.localStorage.clear();
		document.documentElement.style.removeProperty('--nova-panel-width');
		document.documentElement.style.removeProperty('--nova-panel-open-offset');
	});

	it('renders nothing when closed', () => {
		const cmp = mount(NovaPanel, { target });
		flushSync();
		expect(target.querySelector('aside')).toBeNull();
		unmount(cmp);
	});

	it('renders an accessible aside with explicit Nova header identity when open', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		flushSync();
		const aside = target.querySelector('aside');
		expect(aside).not.toBeNull();
		expect(aside?.getAttribute('aria-label')).toBe('Nova panel');
		const title = target.querySelector('#nova-panel-title');
		expect(title?.textContent?.trim()).toBe('Nova');
		const status = target.querySelector('.nova-header-status');
		expect((status?.textContent ?? '').trim().length).toBeGreaterThan(0);
		expect(target.querySelector('.nova-greeting')).not.toBeNull();
		expect(target.querySelector('.nova-starter-btn')).not.toBeNull();
		expect(target.querySelector('.nova-quick-prompt')).toBeNull();
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
		expect(textarea?.getAttribute('aria-label')).toBe('Ask Nova');
		expect(textarea?.disabled).toBe(false);
		const modeSelect = target.querySelector('.nova-mode-select') as HTMLSelectElement | null;
		expect(modeSelect?.getAttribute('aria-label')).toBe('Nova mode');
		const send = target.querySelector('.nova-action-send');
		expect(send).not.toBeNull();
		unmount(cmp);
	});

	it('keeps context disclosure discoverable when key is configured', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		aiSession.keyConfigured = true;
		aiSession.checked = true;
		flushSync();

		const tray = target.querySelector('.nova-session-tray');
		expect(tray).not.toBeNull();
		expect(tray?.getAttribute('aria-label')).toBe('Context disclosure');
		unmount(cmp);
	});

	it('removes unwired attachment affordances from the composer', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		flushSync();

		expect(target.querySelector('.nova-upload-icon')).toBeNull();
		expect(target.querySelector('.nova-attachment-input')).toBeNull();
		expect(target.querySelector('[aria-label="Staged attachments"]')).toBeNull();
		unmount(cmp);
	});

	it('preserves resize bounds when hydrating stored panel width', () => {
		window.localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, '999');
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		flushSync();

		const handle = target.querySelector('.nova-resize-handle') as HTMLButtonElement | null;
		expect(handle).not.toBeNull();
		expect(handle?.getAttribute('aria-valuenow')).toBe('520');
		expect(document.documentElement.style.getPropertyValue('--nova-panel-width')).toBe('520px');
		unmount(cmp);
	});

	it('supports keyboard resizing controls without exceeding bounds', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		flushSync();

		const handle = target.querySelector('.nova-resize-handle') as HTMLButtonElement | null;
		expect(handle).not.toBeNull();
		expect(handle?.getAttribute('aria-valuenow')).toBe('360');

		handle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		flushSync();
		expect(handle?.getAttribute('aria-valuenow')).toBe('376');

		handle?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true }),
		);
		flushSync();
		expect(handle?.getAttribute('aria-valuenow')).toBe('344');

		handle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
		flushSync();
		expect(handle?.getAttribute('aria-valuenow')).toBe('280');

		handle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		flushSync();
		expect(handle?.getAttribute('aria-valuenow')).toBe('520');
		unmount(cmp);
	});

	it('publishes and updates app-shell open offset while open, then resets on close', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		flushSync();

		const handle = target.querySelector('.nova-resize-handle') as HTMLButtonElement | null;
		expect(handle).not.toBeNull();
		expect(document.documentElement.style.getPropertyValue('--nova-panel-open-offset')).toBe(
			'360px',
		);

		handle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		flushSync();
		expect(document.documentElement.style.getPropertyValue('--nova-panel-open-offset')).toBe(
			'376px',
		);

		novaPanel.close();
		flushSync();
		expect(document.documentElement.style.getPropertyValue('--nova-panel-open-offset')).toBe(
			'0px',
		);
		unmount(cmp);
	});

	it('uses explicit constrained and compact viewport states while keeping composer usable', () => {
		const media = installMatchMediaHarness(false);
		try {
			window.localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, '300');
			const cmp = mount(NovaPanel, { target });
			novaPanel.open();
			flushSync();

			const aside = target.querySelector('aside');
			const handle = target.querySelector('.nova-resize-handle') as HTMLButtonElement | null;
			const textarea = target.querySelector('textarea.nova-input') as HTMLTextAreaElement | null;

			expect(aside?.getAttribute('data-viewport-state')).toBe('constrained');
			expect(handle?.disabled).toBe(false);
			expect(textarea).not.toBeNull();
			expect(textarea?.disabled).toBe(false);
			expect(document.documentElement.style.getPropertyValue('--nova-panel-open-offset')).toBe(
				'300px',
			);

			media.setMatches(true);
			flushSync();

			expect(aside?.getAttribute('data-viewport-state')).toBe('compact');
			expect(handle?.disabled).toBe(true);
			expect(textarea?.disabled).toBe(false);
			expect(document.documentElement.style.getPropertyValue('--nova-panel-open-offset')).toBe(
				'0px',
			);
			unmount(cmp);
		} finally {
			media.restore();
		}
	});
});
