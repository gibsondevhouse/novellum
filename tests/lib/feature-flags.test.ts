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

async function loadFlags() {
	const mod = await import('../../src/lib/feature-flags.svelte.js');
	return mod.featureFlags;
}

describe('feature-flags', () => {
	it('default labsEnabled is false before hydrate', async () => {
		const flags = await loadFlags();
		expect(flags.labsEnabled).toBe(false);
	});

	it('loaded is false before hydrate', async () => {
		const flags = await loadFlags();
		expect(flags.loaded).toBe(false);
	});

	it('hydrate() reads app.labs.enabled from preferences', async () => {
		getPreference.mockResolvedValueOnce(false);
		const flags = await loadFlags();
		await flags.hydrate();
		expect(getPreference).toHaveBeenCalledWith('app.labs.enabled', false);
	});

	it('loaded becomes true after hydrate()', async () => {
		getPreference.mockResolvedValueOnce(false);
		const flags = await loadFlags();
		await flags.hydrate();
		expect(flags.loaded).toBe(true);
	});

	it('setLabsEnabled(true) writes true to preferences', async () => {
		setPreference.mockResolvedValueOnce(undefined);
		const flags = await loadFlags();
		await flags.setLabsEnabled(true);
		expect(setPreference).toHaveBeenCalledWith('app.labs.enabled', true);
		expect(flags.labsEnabled).toBe(true);
	});

	it('setLabsEnabled(false) writes false to preferences', async () => {
		setPreference.mockResolvedValueOnce(undefined);
		const flags = await loadFlags();
		await flags.setLabsEnabled(false);
		expect(setPreference).toHaveBeenCalledWith('app.labs.enabled', false);
		expect(flags.labsEnabled).toBe(false);
	});

	it('hydrate() sets labsEnabled from stored value', async () => {
		getPreference.mockResolvedValueOnce(true);
		const flags = await loadFlags();
		await flags.hydrate();
		expect(flags.labsEnabled).toBe(true);
	});
});
