import { describe, it, expect, beforeEach, vi } from 'vitest';

const getPreference = vi.fn();
const setPreference = vi.fn();

vi.mock('$lib/preferences.js', () => ({
	getPreference: (...args: unknown[]) => getPreference(...args),
	setPreference: (...args: unknown[]) => setPreference(...args),
	deletePreference: vi.fn(),
}));

beforeEach(() => {
	getPreference.mockReset();
	setPreference.mockReset();
	vi.resetModules();
});

async function loadStore() {
	return await import('../../src/lib/stores/export-defaults.svelte.js');
}

describe('export-defaults store', () => {
	it('exposes the canonical defaults before hydration', async () => {
		const { exportDefaults } = await loadStore();
		expect(exportDefaults.profileId).toBe('standard_manuscript');
		expect(exportDefaults.format).toBe('markdown');
	});

	it('hydrate() reads the preference and populates state', async () => {
		getPreference.mockResolvedValue({
			profileId: 'reader_copy',
			format: 'docx',
		});

		const { exportDefaults } = await loadStore();
		await exportDefaults.hydrate();

		expect(exportDefaults.profileId).toBe('reader_copy');
		expect(exportDefaults.format).toBe('docx');
	});

	it('hydrate() falls back to defaults when preference returns defaults', async () => {
		getPreference.mockImplementation(async (_key: string, fallback: unknown) => fallback);

		const { exportDefaults } = await loadStore();
		await exportDefaults.hydrate();

		expect(exportDefaults.profileId).toBe('standard_manuscript');
		expect(exportDefaults.format).toBe('markdown');
	});

	it('setProfile() updates profileId and calls setPreference', async () => {
		getPreference.mockImplementation(async (_key: string, fallback: unknown) => fallback);
		setPreference.mockResolvedValue(undefined);

		const { exportDefaults } = await loadStore();
		await exportDefaults.setProfile('ebook_draft');

		expect(exportDefaults.profileId).toBe('ebook_draft');
		expect(setPreference).toHaveBeenCalledWith(
			'export.defaults',
			expect.objectContaining({ profileId: 'ebook_draft' }),
		);
	});

	it('setFormat() updates format and calls setPreference', async () => {
		getPreference.mockImplementation(async (_key: string, fallback: unknown) => fallback);
		setPreference.mockResolvedValue(undefined);

		const { exportDefaults } = await loadStore();
		await exportDefaults.setFormat('epub');

		expect(exportDefaults.format).toBe('epub');
		expect(setPreference).toHaveBeenCalledWith(
			'export.defaults',
			expect.objectContaining({ format: 'epub' }),
		);
	});
});
