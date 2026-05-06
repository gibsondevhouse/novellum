import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync, tick } from 'svelte';

const getPreference = vi.fn();
const setPreference = vi.fn();

vi.mock('$lib/preferences.js', () => ({
	getPreference: (...args: unknown[]) => getPreference(...args),
	setPreference: (...args: unknown[]) => setPreference(...args),
	deletePreference: vi.fn(),
}));

const { setSelectedModelMock } = vi.hoisted(() => ({ setSelectedModelMock: vi.fn() }));

vi.mock('$lib/stores/model-selection.svelte.js', () => ({
	AVAILABLE_MODELS: [
		{
			id: 'google/gemini-3.1-flash-lite-preview',
			label: 'Gemini 3.1 Flash',
			provider: 'Google',
		},
	],
	getSelectedModel: () => 'google/gemini-3.1-flash-lite-preview',
	setSelectedModel: setSelectedModelMock,
}));

import DefaultsPage from '../../src/routes/settings/defaults/+page.svelte';
import { defaults } from '../../src/lib/stores/defaults.svelte.js';

describe('settings/defaults/+page.svelte', () => {
	let target: HTMLElement;
	let component: ReturnType<typeof mount> | null = null;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		getPreference.mockReset();
		setPreference.mockReset();
		setSelectedModelMock.mockReset();
		getPreference.mockImplementation(async (_key: string, fallback: unknown) => fallback);
		// Reset singleton state between tests.
		defaults.homePage = 'library';
		defaults.readerView = 'classic';
		defaults.projectType = 'novel';
		defaults.hydrated = false;
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

	it('renders the Defaults heading and four subsections', () => {
		component = mount(DefaultsPage, { target, props: {} });
		flushSync();
		expect(target.querySelector('h1')?.textContent).toBe('Defaults');
		const headings = Array.from(target.querySelectorAll('h2')).map(
			(h) => h.textContent?.trim(),
		);
		expect(headings).toEqual([
			'Default Home Page',
			'Default Reader View',
			'Default Project Type',
			'Default AI Model',
		]);
	});

	it('renders four radiogroups (one per subsection)', () => {
		component = mount(DefaultsPage, { target, props: {} });
		flushSync();
		const groups = radioGroups();
		expect(groups).toHaveLength(4);
	});

	it('reflects the current store value in each picker (defaults checked by default)', () => {
		component = mount(DefaultsPage, { target, props: {} });
		flushSync();
		const [home, reader, project] = radioGroups();

		// Home: Library checked.
		const homeRadios = radiosIn(home);
		expect(homeRadios[0].getAttribute('aria-checked')).toBe('true');
		expect(homeRadios[1].getAttribute('aria-checked')).toBe('false');
		expect(homeRadios[2].getAttribute('aria-checked')).toBe('false');

		// Reader: Classic checked.
		const readerRadios = radiosIn(reader);
		expect(readerRadios[0].getAttribute('aria-checked')).toBe('true');

		// Project type: Novel checked.
		const projectRadios = radiosIn(project);
		expect(projectRadios[0].getAttribute('aria-checked')).toBe('true');
	});

	it('clicking a non-active home-page pill calls setPreference exactly once', async () => {
		component = mount(DefaultsPage, { target, props: {} });
		flushSync();

		const [home] = radioGroups();
		const radios = radiosIn(home);
		radios[1].click(); // Last Read Book
		flushSync();
		await tick();

		expect(setPreference).toHaveBeenCalledTimes(1);
		expect(setPreference).toHaveBeenCalledWith('app.defaults.homePage', 'last-read');
		expect(radiosIn(home)[1].getAttribute('aria-checked')).toBe('true');
		expect(radiosIn(home)[0].getAttribute('aria-checked')).toBe('false');
	});

	it('clicking a non-active reader-view pill calls setPreference exactly once', async () => {
		component = mount(DefaultsPage, { target, props: {} });
		flushSync();

		const reader = radioGroups()[1];
		radiosIn(reader)[2].click(); // Fullscreen
		flushSync();
		await tick();

		expect(setPreference).toHaveBeenCalledTimes(1);
		expect(setPreference).toHaveBeenCalledWith('app.defaults.readerView', 'fullscreen');
	});

	it('clicking a non-active project-type pill calls setPreference exactly once', async () => {
		component = mount(DefaultsPage, { target, props: {} });
		flushSync();

		const project = radioGroups()[2];
		radiosIn(project)[1].click(); // Story
		flushSync();
		await tick();

		expect(setPreference).toHaveBeenCalledTimes(1);
		expect(setPreference).toHaveBeenCalledWith('app.defaults.projectType', 'story');
	});

	it('renders the AI Model section with a disabled single-option pill and "More models coming soon" caption', () => {
		component = mount(DefaultsPage, { target, props: {} });
		flushSync();

		const aiGroup = radioGroups()[3];
		const radios = radiosIn(aiGroup);
		expect(radios).toHaveLength(1);
		expect(radios[0].disabled).toBe(true);
		expect(radios[0].getAttribute('aria-checked')).toBe('true');
		expect(radios[0].querySelector('.picker__pill-label')?.textContent?.trim())
			.toBe('Gemini 3.1 Flash');

		// Caption.
		expect(target.textContent).toContain('More models coming soon');
	});

	it('does not invoke setSelectedModel when the only AI model option is disabled', async () => {
		component = mount(DefaultsPage, { target, props: {} });
		flushSync();

		const aiGroup = radioGroups()[3];
		radiosIn(aiGroup)[0].click();
		flushSync();
		await tick();

		// disabled buttons don't fire click handlers in jsdom; setSelectedModel must not be called.
		expect(setSelectedModelMock).not.toHaveBeenCalled();
		// And: no setPreference call escaped from the AI section.
		expect(setPreference).not.toHaveBeenCalled();
	});

	it('uses no emoji or icon glyphs in pill labels', () => {
		component = mount(DefaultsPage, { target, props: {} });
		flushSync();
		const labels = Array.from(target.querySelectorAll('.picker__pill-label')).map(
			(el) => el.textContent ?? '',
		);
		// Conservative emoji range check.
		for (const label of labels) {
			expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(label)).toBe(false);
		}
	});
});
