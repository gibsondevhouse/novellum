import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync, tick } from 'svelte';
import PillToolbar, {
	type PillToolbarItem,
} from '$lib/components/ui/PillToolbar.svelte';

/**
 * plan-023 stage-002 phase-005 — PillToolbar primitive coverage:
 *  - Renders all three item kinds (button / divider / menu).
 *  - Toggle buttons reflect aria-pressed.
 *  - Roving tabindex: only one button has tabindex="0" at a time.
 *  - Arrow keys move focus and skip disabled buttons.
 *  - Home / End jump to first / last focusable button.
 */

describe('PillToolbar.svelte', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function makeItems(overrides?: Partial<Record<string, boolean>>): PillToolbarItem[] {
		return [
			{
				kind: 'button',
				id: 'bold',
				label: 'Bold',
				icon: 'B',
				pressed: true,
				onSelect: () => {},
			},
			{
				kind: 'button',
				id: 'italic',
				label: 'Italic',
				icon: 'I',
				disabled: overrides?.italicDisabled ?? false,
				onSelect: () => {},
			},
			{ kind: 'divider', id: 'd1' },
			{
				kind: 'button',
				id: 'underline',
				label: 'Underline',
				icon: 'U',
				pressed: false,
				onSelect: () => {},
			},
			{
				kind: 'menu',
				id: 'insert',
				label: 'Insert',
				icon: '+',
				items: [{ id: 'image', label: 'Image', onSelect: () => {} }],
			},
		];
	}

	it('renders all three item kinds', () => {
		const cmp = mount(PillToolbar, {
			target,
			props: { items: makeItems(), ariaLabel: 'Test toolbar' },
		});
		flushSync();

		const toolbar = target.querySelector('[role="toolbar"]') as HTMLElement;
		expect(toolbar).not.toBeNull();
		expect(toolbar.getAttribute('aria-label')).toBe('Test toolbar');

		// 3 button kinds + 1 menu trigger = 4 buttons
		expect(toolbar.querySelectorAll('button').length).toBe(4);
		expect(toolbar.querySelectorAll('[role="separator"]').length).toBe(1);

		// Menu trigger has aria-haspopup
		const menuTrigger = toolbar.querySelector('[aria-haspopup="menu"]') as HTMLButtonElement;
		expect(menuTrigger).not.toBeNull();

		unmount(cmp);
	});

	it('toggle buttons reflect aria-pressed', () => {
		const cmp = mount(PillToolbar, {
			target,
			props: { items: makeItems(), ariaLabel: 'Test toolbar' },
		});
		flushSync();

		const bold = target.querySelector('[aria-label="Bold"]') as HTMLButtonElement;
		const underline = target.querySelector('[aria-label="Underline"]') as HTMLButtonElement;
		expect(bold.getAttribute('aria-pressed')).toBe('true');
		expect(underline.getAttribute('aria-pressed')).toBe('false');

		unmount(cmp);
	});

	it('roving tabindex: only one button has tabindex="0"', () => {
		const cmp = mount(PillToolbar, {
			target,
			props: { items: makeItems(), ariaLabel: 'Test toolbar' },
		});
		flushSync();

		const buttons = Array.from(target.querySelectorAll('[role="toolbar"] button')) as HTMLButtonElement[];
		const zeros = buttons.filter((b) => b.tabIndex === 0);
		expect(zeros).toHaveLength(1);
		expect(zeros[0].getAttribute('aria-label')).toBe('Bold');

		unmount(cmp);
	});

	it('ArrowRight moves focus to the next focusable button', async () => {
		const cmp = mount(PillToolbar, {
			target,
			props: { items: makeItems(), ariaLabel: 'Test toolbar' },
		});
		flushSync();

		const toolbar = target.querySelector('[role="toolbar"]') as HTMLElement;
		const bold = target.querySelector('[aria-label="Bold"]') as HTMLButtonElement;
		bold.focus();
		toolbar.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		flushSync();
		await tick();

		expect(document.activeElement?.getAttribute('aria-label')).toBe('Italic');

		unmount(cmp);
	});

	it('ArrowRight skips disabled buttons', async () => {
		const cmp = mount(PillToolbar, {
			target,
			props: {
				items: makeItems({ italicDisabled: true }),
				ariaLabel: 'Test toolbar',
			},
		});
		flushSync();

		const toolbar = target.querySelector('[role="toolbar"]') as HTMLElement;
		const bold = target.querySelector('[aria-label="Bold"]') as HTMLButtonElement;
		bold.focus();
		toolbar.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		flushSync();
		await tick();

		// Italic is disabled → focus jumps to Underline.
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Underline');

		unmount(cmp);
	});

	it('Home jumps to first, End jumps to last focusable', async () => {
		const cmp = mount(PillToolbar, {
			target,
			props: { items: makeItems(), ariaLabel: 'Test toolbar' },
		});
		flushSync();

		const toolbar = target.querySelector('[role="toolbar"]') as HTMLElement;
		const underline = target.querySelector('[aria-label="Underline"]') as HTMLButtonElement;
		underline.focus();

		toolbar.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		flushSync();
		await tick();
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Insert');

		toolbar.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
		flushSync();
		await tick();
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Bold');

		unmount(cmp);
	});

	it('button click invokes onSelect', () => {
		const onSelect = vi.fn();
		const items: PillToolbarItem[] = [
			{ kind: 'button', id: 'a', label: 'Action', icon: 'A', onSelect },
		];
		const cmp = mount(PillToolbar, {
			target,
			props: { items, ariaLabel: 'T' },
		});
		flushSync();

		const btn = target.querySelector('[aria-label="Action"]') as HTMLButtonElement;
		btn.click();
		expect(onSelect).toHaveBeenCalledTimes(1);

		unmount(cmp);
	});

	it('menu opens when clicked and reveals child items', () => {
		const cmp = mount(PillToolbar, {
			target,
			props: { items: makeItems(), ariaLabel: 'Test toolbar' },
		});
		flushSync();

		const trigger = target.querySelector('[aria-haspopup="menu"]') as HTMLButtonElement;
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		trigger.click();
		flushSync();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(target.querySelector('[role="menu"]')).not.toBeNull();
		expect(target.querySelector('[role="menuitemcheckbox"]')).not.toBeNull();

		unmount(cmp);
	});
});
