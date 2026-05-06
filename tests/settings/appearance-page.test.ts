import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync, tick } from 'svelte';

const getPreference = vi.fn();
const setPreference = vi.fn();

vi.mock('$lib/preferences.js', () => ({
	getPreference: (...args: unknown[]) => getPreference(...args),
	setPreference: (...args: unknown[]) => setPreference(...args),
	deletePreference: vi.fn(),
}));

// ThemeSelector pulls in window.matchMedia + theme service. Stub the
// component out — the appearance page test only cares about the new
// pickers it owns.
vi.mock('$modules/settings', async () => {
	const stub = await import('./fixtures/theme-selector-stub.svelte');
	return { ThemeSelector: stub.default };
});

import AppearancePage from '../../src/routes/settings/appearance/+page.svelte';
import { appearance } from '../../src/lib/stores/appearance.svelte.js';

describe('settings/appearance/+page.svelte', () => {
	let target: HTMLElement;
	let component: ReturnType<typeof mount> | null = null;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		document.documentElement.style.removeProperty('--editor-font-size');
		document.documentElement.style.removeProperty('--editor-line-height');
		getPreference.mockReset();
		setPreference.mockReset();
		// Defaults so onMount hydrate() resolves cleanly.
		getPreference.mockImplementation(async (_key: string, fallback: unknown) => fallback);
		// Reset singleton state between tests.
		appearance.fontSize = 'default';
		appearance.lineSpacing = 'relaxed';
		appearance.hydrated = false;
	});

	afterEach(() => {
		if (component) {
			unmount(component);
			component = null;
		}
	});

	function radioGroups(): HTMLElement[] {
		return Array.from(target.querySelectorAll('[role="radiogroup"]'));
	}

	function radiosIn(group: HTMLElement): HTMLButtonElement[] {
		return Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
	}

	it('renders the Appearance heading and three subsections', () => {
		component = mount(AppearancePage, { target, props: {} });
		flushSync();

		expect(target.querySelector('h1')?.textContent).toBe('Appearance');
		const headings = Array.from(target.querySelectorAll('h2')).map(
			(h) => h.textContent?.trim(),
		);
		expect(headings).toEqual(['Theme', 'Editor Text Size', 'Editor Line Spacing']);
	});

	it('mounts the ThemeSelector under the Theme subsection', () => {
		component = mount(AppearancePage, { target, props: {} });
		flushSync();
		expect(target.querySelector('[data-testid="theme-selector-stub"]')).toBeTruthy();
	});

	it('renders three font-size radios reflecting the current store value', () => {
		component = mount(AppearancePage, { target, props: {} });
		flushSync();

		const groups = radioGroups();
		expect(groups).toHaveLength(2);
		const fontGroup = groups[0];
		const radios = radiosIn(fontGroup);
		expect(radios.map((r) => r.querySelector('.picker__pill-label')?.textContent?.trim()))
			.toEqual(['Small', 'Default', 'Large']);
		// Default state: "Default" pill is checked.
		expect(radios[1].getAttribute('aria-checked')).toBe('true');
		expect(radios[0].getAttribute('aria-checked')).toBe('false');
		expect(radios[2].getAttribute('aria-checked')).toBe('false');
	});

	it('flips aria-checked and persists when a font-size pill is clicked', async () => {
		component = mount(AppearancePage, { target, props: {} });
		flushSync();

		const fontGroup = radioGroups()[0];
		const [smallPill, , largePill] = radiosIn(fontGroup);
		largePill.click();
		flushSync();
		await tick();

		const refreshed = radiosIn(fontGroup);
		expect(refreshed[2].getAttribute('aria-checked')).toBe('true');
		expect(refreshed[1].getAttribute('aria-checked')).toBe('false');
		expect(setPreference).toHaveBeenCalledWith('app.editor.fontSize', 'large');
		expect(document.documentElement.style.getPropertyValue('--editor-font-size'))
			.toBe('var(--text-lg)');

		smallPill.click();
		flushSync();
		await tick();
		expect(setPreference).toHaveBeenCalledWith('app.editor.fontSize', 'small');
	});

	it('flips aria-checked and persists when a line-spacing pill is clicked', async () => {
		component = mount(AppearancePage, { target, props: {} });
		flushSync();

		const lineGroup = radioGroups()[1];
		const radios = radiosIn(lineGroup);
		expect(radios.map((r) => r.querySelector('.picker__pill-label')?.textContent?.trim()))
			.toEqual(['Tight', 'Normal', 'Relaxed']);
		// Default: "Relaxed" pill is checked.
		expect(radios[2].getAttribute('aria-checked')).toBe('true');

		radios[0].click();
		flushSync();
		await tick();

		const refreshed = radiosIn(lineGroup);
		expect(refreshed[0].getAttribute('aria-checked')).toBe('true');
		expect(refreshed[2].getAttribute('aria-checked')).toBe('false');
		expect(setPreference).toHaveBeenCalledWith('app.editor.lineSpacing', 'tight');
		expect(document.documentElement.style.getPropertyValue('--editor-line-height'))
			.toBe('var(--leading-tight)');
	});
});
