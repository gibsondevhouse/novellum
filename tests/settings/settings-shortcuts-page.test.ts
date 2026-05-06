/**
 * Tests for src/routes/settings/shortcuts/+page.svelte
 *
 * Mocks $lib/keyboard/index.js to return 3 sample actions,
 * then asserts rendering and interaction behaviours.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync, tick } from 'svelte';
import type { ActionEntry } from '../../src/lib/keyboard/keymap-registry.js';

// ── Mock the keyboard module ─────────────────────────────────────────────────

const listActionsMock = vi.fn<() => ActionEntry[]>();
const saveBindingMock = vi.fn();
const resetBindingMock = vi.fn();
const resetAllMock = vi.fn();
const loadSavedBindingsMock = vi.fn();

vi.mock('$lib/keyboard/index.js', () => ({
	listActions: () => listActionsMock(),
	saveBinding: (...args: unknown[]) => saveBindingMock(...args),
	resetBinding: (...args: unknown[]) => resetBindingMock(...args),
	resetAll: (...args: unknown[]) => resetAllMock(...args),
	loadSavedBindings: (...args: unknown[]) => loadSavedBindingsMock(...args),
	loadBindings: (...args: unknown[]) => loadSavedBindingsMock(...args),
	hasConflict: vi.fn().mockReturnValue(null),
}));

// ── Sample test data ─────────────────────────────────────────────────────────

const SAMPLE_ACTIONS: ActionEntry[] = [
	{
		id: 'action-a',
		label: 'Action A',
		description: 'Do thing A',
		default: 'Meta+A',
		current: 'Meta+A',
	},
	{
		id: 'action-b',
		label: 'Action B',
		description: 'Do thing B',
		default: 'Meta+B',
		current: 'Meta+X',
	},
	{
		id: 'action-c',
		label: 'Action C',
		description: 'Do thing C',
		default: 'Meta+C',
		current: 'Meta+C',
	},
];

import ShortcutsPage from '../../src/routes/settings/shortcuts/+page.svelte';

/**
 * Wait for async event-handler state changes to flush to the DOM.
 * The async handleKeydown awaits saveBinding, which updates $state.
 * A single tick() is not enough; we need to:
 * 1. Let the awaited promise in the handler resolve (1st microtask)
 * 2. Let Svelte flush the resulting state change (2nd round)
 */
async function flush() {
	await Promise.resolve(); // drain handleKeydown's awaited saveBinding
	await tick(); // flush Svelte's pending effects to the DOM
}

describe('settings/shortcuts/+page.svelte', () => {
	let target: HTMLElement;
	let component: ReturnType<typeof mount> | null = null;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);

		listActionsMock.mockReset();
		saveBindingMock.mockReset();
		resetBindingMock.mockReset();
		resetAllMock.mockReset();
		loadSavedBindingsMock.mockReset();

		listActionsMock.mockReturnValue(SAMPLE_ACTIONS);
		loadSavedBindingsMock.mockResolvedValue(undefined);
		saveBindingMock.mockResolvedValue({ ok: true });
		resetBindingMock.mockResolvedValue(undefined);
		resetAllMock.mockResolvedValue(undefined);
	});

	afterEach(() => {
		if (component) {
			unmount(component);
			component = null;
		}
	});

	// ── Rendering ─────────────────────────────────────────────────────────────

	it('renders the Shortcuts heading', () => {
		component = mount(ShortcutsPage, { target });
		flushSync();
		expect(target.querySelector('h1')?.textContent).toBe('Shortcuts');
	});

	it('renders all 3 action labels', () => {
		component = mount(ShortcutsPage, { target });
		flushSync();
		expect(target.textContent).toContain('Action A');
		expect(target.textContent).toContain('Action B');
		expect(target.textContent).toContain('Action C');
	});

	it('renders all 3 action descriptions', () => {
		component = mount(ShortcutsPage, { target });
		flushSync();
		expect(target.textContent).toContain('Do thing A');
		expect(target.textContent).toContain('Do thing B');
		expect(target.textContent).toContain('Do thing C');
	});

	it('renders a table with role="grid"', () => {
		component = mount(ShortcutsPage, { target });
		flushSync();
		expect(target.querySelector('[role="grid"]')).toBeTruthy();
	});

	it('renders a "Reset all shortcuts" button', () => {
		component = mount(ShortcutsPage, { target });
		flushSync();
		const buttons = Array.from(target.querySelectorAll('button'));
		const resetAllBtn = buttons.find((b) => /reset all/i.test(b.textContent ?? ''));
		expect(resetAllBtn).toBeTruthy();
	});

	it('renders Edit and Reset buttons for each action', () => {
		component = mount(ShortcutsPage, { target });
		flushSync();
		const editButtons = target.querySelectorAll<HTMLButtonElement>(
			'button[aria-label^="Edit shortcut"]',
		);
		const resetButtons = target.querySelectorAll<HTMLButtonElement>(
			'button[aria-label^="Reset shortcut"]',
		);
		expect(editButtons).toHaveLength(3);
		expect(resetButtons).toHaveLength(3);
	});

	// ── Recording mode ────────────────────────────────────────────────────────

	it('clicking Edit button shows "Press any key…" text', async () => {
		component = mount(ShortcutsPage, { target });
		flushSync();

		const editButton = target.querySelector<HTMLButtonElement>(
			'button[aria-label="Edit shortcut for Action A"]',
		);
		expect(editButton).toBeTruthy();
		editButton!.click();
		await tick();

		expect(target.textContent).toContain('Press any key…');
	});

	it('clicking Edit button shows Esc hint', async () => {
		component = mount(ShortcutsPage, { target });
		flushSync();

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Edit shortcut for Action A"]')!
			.click();
		await tick();

		expect(target.textContent).toContain('Esc to cancel');
	});

	it('only the targeted row enters recording mode when Edit is clicked', async () => {
		component = mount(ShortcutsPage, { target });
		flushSync();

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Edit shortcut for Action A"]')!
			.click();
		await tick();

		// Only one "Press any key…" should appear
		const recordings = target.querySelectorAll('.shortcuts__recording');
		expect(recordings).toHaveLength(1);
	});

	// ── Escape cancels recording ───────────────────────────────────────────────

	it('pressing Escape while recording cancels recording', async () => {
		component = mount(ShortcutsPage, { target });
		flushSync();

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Edit shortcut for Action A"]')!
			.click();
		await tick();
		expect(target.textContent).toContain('Press any key…');

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await tick();

		expect(target.textContent).not.toContain('Press any key…');
	});

	it('Cancel button also cancels recording', async () => {
		component = mount(ShortcutsPage, { target });
		flushSync();

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Edit shortcut for Action A"]')!
			.click();
		await tick();

		const cancelBtn = target.querySelector<HTMLButtonElement>('.shortcuts__btn--cancel');
		expect(cancelBtn).toBeTruthy();
		cancelBtn!.click();
		await tick();

		expect(target.textContent).not.toContain('Press any key…');
	});

	// ── Inline error: conflict ────────────────────────────────────────────────

	it('shows inline conflict error when saveBinding returns conflict', async () => {
		saveBindingMock.mockResolvedValue({ ok: false, error: 'conflict' });

		component = mount(ShortcutsPage, { target });
		flushSync();

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Edit shortcut for Action A"]')!
			.click();
		await tick();

		window.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'B', metaKey: true, bubbles: true }),
		);
		await flush();

		const errors = target.querySelectorAll('[role="alert"]');
		expect(errors.length).toBeGreaterThan(0);
		const errorText = Array.from(errors)
			.map((e) => e.textContent)
			.join(' ');
		expect(errorText).toContain('already used');
	});

	it('recording stays open after a conflict error', async () => {
		saveBindingMock.mockResolvedValue({ ok: false, error: 'conflict' });

		component = mount(ShortcutsPage, { target });
		flushSync();

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Edit shortcut for Action A"]')!
			.click();
		await tick();

		window.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'B', metaKey: true, bubbles: true }),
		);
		await flush();

		// Recording should still be active
		expect(target.textContent).toContain('Press any key…');
	});

	// ── Inline error: deny-list ───────────────────────────────────────────────

	it('shows inline deny-list error when saveBinding returns denied', async () => {
		saveBindingMock.mockResolvedValue({ ok: false, error: 'denied' });

		component = mount(ShortcutsPage, { target });
		flushSync();

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Edit shortcut for Action A"]')!
			.click();
		await tick();

		window.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Q', metaKey: true, bubbles: true }),
		);
		await flush();

		const errors = target.querySelectorAll('[role="alert"]');
		expect(errors.length).toBeGreaterThan(0);
		const errorText = Array.from(errors)
			.map((e) => e.textContent)
			.join(' ');
		expect(errorText).toContain('reserved');
	});

	// ── Successful key capture ────────────────────────────────────────────────

	it('pressing a key exits recording mode on successful save', async () => {
		component = mount(ShortcutsPage, { target });
		flushSync();

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Edit shortcut for Action A"]')!
			.click();
		await tick();

		window.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Z', metaKey: true, bubbles: true }),
		);
		await flush();

		expect(saveBindingMock).toHaveBeenCalledWith('action-a', 'Meta+Z');
		expect(target.textContent).not.toContain('Press any key…');
	});

	// ── Reset per row ─────────────────────────────────────────────────────────

	it('clicking Reset button for an action calls resetBinding with correct id', async () => {
		component = mount(ShortcutsPage, { target });
		flushSync();

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Reset shortcut for Action A"]')!
			.click();
		await tick();

		expect(resetBindingMock).toHaveBeenCalledWith('action-a');
	});

	it('clicking Reset refreshes the action list', async () => {
		component = mount(ShortcutsPage, { target });
		flushSync();

		const callsBefore = listActionsMock.mock.calls.length;

		target
			.querySelector<HTMLButtonElement>('button[aria-label="Reset shortcut for Action A"]')!
			.click();
		await tick();

		expect(listActionsMock.mock.calls.length).toBeGreaterThan(callsBefore);
	});

	// ── Reset all ─────────────────────────────────────────────────────────────

	it('clicking "Reset all shortcuts" calls resetAll', async () => {
		component = mount(ShortcutsPage, { target });
		flushSync();

		const buttons = Array.from(target.querySelectorAll('button'));
		const resetAllBtn = buttons.find((b) => /reset all/i.test(b.textContent ?? ''));
		expect(resetAllBtn).toBeTruthy();
		resetAllBtn!.click();
		await tick();

		expect(resetAllMock).toHaveBeenCalled();
	});

	it('clicking "Reset all shortcuts" refreshes the action list', async () => {
		component = mount(ShortcutsPage, { target });
		flushSync();

		const callsBefore = listActionsMock.mock.calls.length;

		const buttons = Array.from(target.querySelectorAll('button'));
		buttons.find((b) => /reset all/i.test(b.textContent ?? ''))!.click();
		await tick();

		expect(listActionsMock.mock.calls.length).toBeGreaterThan(callsBefore);
	});
});
