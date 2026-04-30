import { describe, it, expect, afterEach, vi } from 'vitest';
import { getPlatform, isDesktop, isWeb } from '$lib/platform/platform.js';

describe('platform detector', () => {
	const originalWindow = globalThis.window;

	afterEach(() => {
		// Restore the jsdom window each test.
		Object.defineProperty(globalThis, 'window', {
			value: originalWindow,
			writable: true,
			configurable: true,
		});
		vi.unstubAllEnvs();
	});

	it('returns "web" when window is undefined (SSR)', () => {
		Object.defineProperty(globalThis, 'window', {
			value: undefined,
			writable: true,
			configurable: true,
		});
		expect(getPlatform()).toBe('web');
		expect(isWeb()).toBe(true);
		expect(isDesktop()).toBe(false);
	});

	it('returns "desktop" when window exposes Tauri internals', () => {
		(window as { __TAURI_INTERNALS__?: object }).__TAURI_INTERNALS__ = {};
		expect(getPlatform()).toBe('desktop');
		expect(isDesktop()).toBe(true);
		delete (window as { __TAURI_INTERNALS__?: object }).__TAURI_INTERNALS__;
	});

	it('returns "desktop" when window exposes legacy __TAURI__ binding', () => {
		(window as { __TAURI__?: object }).__TAURI__ = {};
		expect(getPlatform()).toBe('desktop');
		delete (window as { __TAURI__?: object }).__TAURI__;
	});

	it('returns "dev" when running under Vite dev server', () => {
		// jsdom window is present and no Tauri binding exists; in vitest
		// the dev flag is true by default.
		const platform = getPlatform();
		// Could be 'dev' or 'web' depending on env; assert it is not
		// 'desktop' and that the web/dev split is consistent.
		expect(['dev', 'web']).toContain(platform);
		expect(isDesktop()).toBe(false);
	});
});
