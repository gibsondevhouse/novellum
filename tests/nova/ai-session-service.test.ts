/**
 * plan-018 stage-005 phase-001 — AiSessionStore tests.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiSessionStore } from '../../src/modules/nova/services/ai-session-service.svelte.js';

vi.mock('$lib/stores/model-selection.svelte.js', () => ({
	getSelectedModel: () => 'google/gemini-3.1-flash-lite-preview',
}));

describe('AiSessionStore', () => {
	let store: AiSessionStore;

	beforeEach(() => {
		store = new AiSessionStore();
		vi.restoreAllMocks();
	});

	it('sets keyConfigured = true when API returns { configured: true }', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ configured: true, providerId: 'openrouter' }),
			}),
		);

		await store.hydrate();

		expect(store.keyConfigured).toBe(true);
		expect(store.checked).toBe(true);
		expect(store.loading).toBe(false);
		expect(store.error).toBeNull();
	});

	it('sets keyConfigured = false when API returns { configured: false }', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ configured: false, providerId: 'openrouter' }),
			}),
		);

		await store.hydrate();

		expect(store.keyConfigured).toBe(false);
		expect(store.checked).toBe(true);
		expect(store.loading).toBe(false);
		expect(store.error).toBeNull();
	});

	it('sets keyConfigured = false and sets error when fetch throws', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockRejectedValue(new Error('Network failure')),
		);

		await store.hydrate();

		expect(store.keyConfigured).toBe(false);
		expect(store.checked).toBe(true);
		expect(store.loading).toBe(false);
		expect(store.error).toBe('Network failure');
	});

	it('sets keyConfigured = false and sets error when response is not OK', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: () => Promise.resolve({}),
			}),
		);

		await store.hydrate();

		expect(store.keyConfigured).toBe(false);
		expect(store.loading).toBe(false);
		expect(store.error).toBe('HTTP 500');
	});

	it('sets loading = true during fetch and false after', async () => {
		let resolveFetch!: (v: unknown) => void;
		const fetchPromise = new Promise((res) => {
			resolveFetch = res;
		});

		vi.stubGlobal('fetch', vi.fn().mockReturnValue(fetchPromise));

		const hydratePromise = store.hydrate();
		expect(store.loading).toBe(true);

		resolveFetch({
			ok: true,
			json: () => Promise.resolve({ configured: true, providerId: 'openrouter' }),
		});
		await hydratePromise;

		expect(store.loading).toBe(false);
	});

	it('populates modelId from getSelectedModel() after hydration', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ configured: true, providerId: 'openrouter' }),
			}),
		);

		await store.hydrate();

		expect(store.modelId).toBe('google/gemini-3.1-flash-lite-preview');
	});

	it('uses provided providerId when API returns it', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({ configured: true, providerId: 'anthropic' }),
			}),
		);

		await store.hydrate('anthropic');

		expect(store.providerId).toBe('anthropic');
	});
});
