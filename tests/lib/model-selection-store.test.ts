import { describe, it, expect, beforeEach, vi } from 'vitest';

const getPreference = vi.fn();
const setPreference = vi.fn();

vi.mock('$lib/preferences.js', () => ({
	getPreference: (...args: unknown[]) => getPreference(...args),
	setPreference: (...args: unknown[]) => setPreference(...args),
}));

class MemoryStorage implements Storage {
	private map = new Map<string, string>();
	get length() {
		return this.map.size;
	}
	clear() {
		this.map.clear();
	}
	key(i: number) {
		return Array.from(this.map.keys())[i] ?? null;
	}
	getItem(k: string) {
		return this.map.get(k) ?? null;
	}
	setItem(k: string, v: string) {
		this.map.set(k, v);
	}
	removeItem(k: string) {
		this.map.delete(k);
	}
}

beforeEach(() => {
	getPreference.mockReset();
	setPreference.mockReset();
	vi.resetModules();
});

async function loadStore(storage: Storage) {
	vi.stubGlobal('localStorage', storage);
	const mod = await import('../../src/lib/stores/model-selection.svelte.js');
	mod.__resetModelSelectionForTests();
	return mod;
}

describe('model-selection store', () => {
	it('initialises to the default model when no preference is stored', async () => {
		getPreference.mockResolvedValueOnce('google/gemini-3.1-flash-lite-preview');

		const storage = new MemoryStorage();
		const store = await loadStore(storage);
		await store.initModelSelection();

		expect(store.getSelectedModel()).toBe('google/gemini-3.1-flash-lite-preview');
		expect(setPreference).not.toHaveBeenCalled();
	});

	it('migrates a legacy localStorage value into preferences and clears it', async () => {
		const storage = new MemoryStorage();
		storage.setItem('novellum_selected_model', 'google/gemini-3.1-flash-lite-preview');
		setPreference.mockResolvedValueOnce(undefined);
		getPreference.mockResolvedValueOnce('google/gemini-3.1-flash-lite-preview');

		const store = await loadStore(storage);
		await store.initModelSelection();

		expect(setPreference).toHaveBeenCalledWith(
			'app.selectedModel',
			'google/gemini-3.1-flash-lite-preview',
		);
		expect(storage.getItem('novellum_selected_model')).toBeNull();
		expect(storage.getItem(store.__MIGRATION_FLAG)).toBe('true');
	});

	it('does not write the legacy localStorage key on setSelectedModel', async () => {
		getPreference.mockResolvedValueOnce('google/gemini-3.1-flash-lite-preview');
		const storage = new MemoryStorage();
		const store = await loadStore(storage);
		await store.initModelSelection();

		store.setSelectedModel('google/gemini-3.1-flash-lite-preview');

		expect(storage.getItem('novellum_selected_model')).toBeNull();
		expect(setPreference).toHaveBeenCalledWith(
			'app.selectedModel',
			'google/gemini-3.1-flash-lite-preview',
		);
	});

	it('rejects unknown model ids', async () => {
		getPreference.mockResolvedValueOnce('google/gemini-3.1-flash-lite-preview');
		const storage = new MemoryStorage();
		const store = await loadStore(storage);
		await store.initModelSelection();

		store.setSelectedModel('nonexistent/model');
		expect(store.getSelectedModel()).toBe('google/gemini-3.1-flash-lite-preview');
	});
});
