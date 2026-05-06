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
	document.documentElement.style.removeProperty('--editor-font-size');
	document.documentElement.style.removeProperty('--editor-line-height');
	vi.resetModules();
});

async function loadStore() {
	return await import('../../src/lib/stores/appearance.svelte.js');
}

describe('appearance store', () => {
	it('exposes the canonical defaults before hydration', async () => {
		const { appearance } = await loadStore();
		expect(appearance.fontSize).toBe('default');
		expect(appearance.lineSpacing).toBe('relaxed');
		expect(appearance.hydrated).toBe(false);
	});

	it('hydrate() reads both preferences in parallel and applies CSS vars', async () => {
		getPreference.mockImplementation(async (key: string) => {
			if (key === 'app.editor.fontSize') return 'large';
			if (key === 'app.editor.lineSpacing') return 'tight';
			return undefined;
		});

		const { appearance } = await loadStore();
		await appearance.hydrate();

		expect(getPreference).toHaveBeenCalledWith('app.editor.fontSize', 'default');
		expect(getPreference).toHaveBeenCalledWith('app.editor.lineSpacing', 'relaxed');
		expect(appearance.fontSize).toBe('large');
		expect(appearance.lineSpacing).toBe('tight');
		expect(appearance.hydrated).toBe(true);
		expect(document.documentElement.style.getPropertyValue('--editor-font-size'))
			.toBe('var(--text-lg)');
		expect(document.documentElement.style.getPropertyValue('--editor-line-height'))
			.toBe('var(--leading-tight)');
	});

	it('hydrate() falls back to defaults when preferences are absent', async () => {
		getPreference.mockImplementation(async (_key: string, fallback: unknown) => fallback);

		const { appearance } = await loadStore();
		await appearance.hydrate();

		expect(appearance.fontSize).toBe('default');
		expect(appearance.lineSpacing).toBe('relaxed');
		expect(document.documentElement.style.getPropertyValue('--editor-font-size'))
			.toBe('var(--text-base)');
		expect(document.documentElement.style.getPropertyValue('--editor-line-height'))
			.toBe('var(--leading-relaxed)');
	});

	it('setFontSize() writes the preference and binds the CSS variable', async () => {
		const { appearance } = await loadStore();
		appearance.setFontSize('small');

		expect(appearance.fontSize).toBe('small');
		expect(setPreference).toHaveBeenCalledWith('app.editor.fontSize', 'small');
		expect(document.documentElement.style.getPropertyValue('--editor-font-size'))
			.toBe('var(--text-sm)');
	});

	it('setLineSpacing() writes the preference and binds the CSS variable', async () => {
		const { appearance } = await loadStore();
		appearance.setLineSpacing('normal');

		expect(appearance.lineSpacing).toBe('normal');
		expect(setPreference).toHaveBeenCalledWith('app.editor.lineSpacing', 'normal');
		expect(document.documentElement.style.getPropertyValue('--editor-line-height'))
			.toBe('var(--leading-normal)');
	});

	it('maps every font size to the corresponding typography token', async () => {
		const { appearance } = await loadStore();
		const cases: Array<['small' | 'default' | 'large', string]> = [
			['small', 'var(--text-sm)'],
			['default', 'var(--text-base)'],
			['large', 'var(--text-lg)'],
		];
		for (const [value, expected] of cases) {
			appearance.setFontSize(value);
			expect(document.documentElement.style.getPropertyValue('--editor-font-size'))
				.toBe(expected);
		}
	});

	it('maps every line spacing to the corresponding leading token', async () => {
		const { appearance } = await loadStore();
		const cases: Array<['tight' | 'normal' | 'relaxed', string]> = [
			['tight', 'var(--leading-tight)'],
			['normal', 'var(--leading-normal)'],
			['relaxed', 'var(--leading-relaxed)'],
		];
		for (const [value, expected] of cases) {
			appearance.setLineSpacing(value);
			expect(document.documentElement.style.getPropertyValue('--editor-line-height'))
				.toBe(expected);
		}
	});
});
