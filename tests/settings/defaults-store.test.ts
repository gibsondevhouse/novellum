import { describe, it, expect, beforeEach, vi } from 'vitest';

const getPreference = vi.fn();
const setPreference = vi.fn();

vi.mock('$lib/preferences.js', () => ({
	getPreference: (...args: unknown[]) => getPreference(...args),
	setPreference: (...args: unknown[]) => setPreference(...args),
}));

beforeEach(() => {
	getPreference.mockReset();
	setPreference.mockReset();
	vi.resetModules();
});

async function loadStore() {
	return await import('../../src/lib/stores/defaults.svelte.js');
}

describe('defaults store', () => {
	it('exposes the canonical defaults before hydration', async () => {
		const { defaults } = await loadStore();
		expect(defaults.homePage).toBe('library');
		expect(defaults.readerView).toBe('classic');
		expect(defaults.projectType).toBe('novel');
		expect(defaults.hydrated).toBe(false);
	});

	it('hydrate() reads all three preferences in parallel and sets reactive state', async () => {
		getPreference.mockImplementation(async (key: string) => {
			if (key === 'app.defaults.homePage') return 'last-project';
			if (key === 'app.defaults.readerView') return 'book';
			if (key === 'app.defaults.projectType') return 'collection';
			return undefined;
		});

		const { defaults } = await loadStore();
		await defaults.hydrate();

		expect(getPreference).toHaveBeenCalledWith('app.defaults.homePage', 'library');
		expect(getPreference).toHaveBeenCalledWith('app.defaults.readerView', 'classic');
		expect(getPreference).toHaveBeenCalledWith('app.defaults.projectType', 'novel');
		expect(defaults.homePage).toBe('last-project');
		expect(defaults.readerView).toBe('book');
		expect(defaults.projectType).toBe('collection');
		expect(defaults.hydrated).toBe(true);
	});

	it('hydrate() falls back to defaults when preferences are absent', async () => {
		getPreference.mockImplementation(async (_key: string, fallback: unknown) => fallback);

		const { defaults } = await loadStore();
		await defaults.hydrate();

		expect(defaults.homePage).toBe('library');
		expect(defaults.readerView).toBe('classic');
		expect(defaults.projectType).toBe('novel');
		expect(defaults.hydrated).toBe(true);
	});

	it('hydrate() is idempotent — second call performs no additional reads', async () => {
		getPreference.mockImplementation(async (_key: string, fallback: unknown) => fallback);

		const { defaults } = await loadStore();
		await defaults.hydrate();
		const callsAfterFirst = getPreference.mock.calls.length;
		await defaults.hydrate();
		expect(getPreference.mock.calls.length).toBe(callsAfterFirst);
	});

	it('concurrent hydrate() calls share a single in-flight read', async () => {
		let resolveAll!: () => void;
		const gate = new Promise<void>((r) => {
			resolveAll = r;
		});
		getPreference.mockImplementation(async (_key: string, fallback: unknown) => {
			await gate;
			return fallback;
		});

		const { defaults } = await loadStore();
		const p1 = defaults.hydrate();
		const p2 = defaults.hydrate();
		resolveAll();
		await Promise.all([p1, p2]);
		// 3 keys × 1 hydrate cycle = 3 calls (not 6).
		expect(getPreference).toHaveBeenCalledTimes(3);
	});

	it('setDefaultHomePage writes the preference and updates reactive state', async () => {
		const { defaults } = await loadStore();
		await defaults.setDefaultHomePage('last-read');
		expect(defaults.homePage).toBe('last-read');
		expect(defaults.getDefaultHomePage()).toBe('last-read');
		expect(setPreference).toHaveBeenCalledWith('app.defaults.homePage', 'last-read');
	});

	it('setDefaultReaderView writes the preference and updates reactive state', async () => {
		const { defaults } = await loadStore();
		await defaults.setDefaultReaderView('fullscreen');
		expect(defaults.readerView).toBe('fullscreen');
		expect(defaults.getDefaultReaderView()).toBe('fullscreen');
		expect(setPreference).toHaveBeenCalledWith('app.defaults.readerView', 'fullscreen');
	});

	it('setDefaultProjectType writes the preference and updates reactive state', async () => {
		const { defaults } = await loadStore();
		await defaults.setDefaultProjectType('story');
		expect(defaults.projectType).toBe('story');
		expect(defaults.getDefaultProjectType()).toBe('story');
		expect(setPreference).toHaveBeenCalledWith('app.defaults.projectType', 'story');
	});
});
