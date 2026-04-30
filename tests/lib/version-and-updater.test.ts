import { describe, it, expect, beforeEach } from 'vitest';
import { getAppVersion, APP_VERSION } from '$lib/version.js';
import { checkForUpdates } from '$lib/desktop/updater.js';

describe('app version', () => {
	it('exposes a non-empty semver string from package.json', () => {
		expect(typeof APP_VERSION).toBe('string');
		expect(APP_VERSION.length).toBeGreaterThan(0);
		expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+/);
	});

	it('getAppVersion() returns APP_VERSION', () => {
		expect(getAppVersion()).toBe(APP_VERSION);
	});
});

describe('updater stub', () => {
	beforeEach(() => {
		delete (window as { __TAURI_INTERNALS__?: object }).__TAURI_INTERNALS__;
		delete (window as { __TAURI__?: object }).__TAURI__;
	});

	it("returns kind='none' on web", async () => {
		const status = await checkForUpdates();
		expect(status.kind).toBe('none');
		expect(status.currentVersion).toBe(getAppVersion());
	});

	it("returns kind='unsupported' on desktop until plan-018 wires the real plugin", async () => {
		(window as { __TAURI_INTERNALS__?: object }).__TAURI_INTERNALS__ = {};
		const status = await checkForUpdates();
		expect(status.kind).toBe('unsupported');
		if (status.kind === 'unsupported') {
			expect(status.reason).toMatch(/auto-update/i);
			expect(status.currentVersion).toBe(getAppVersion());
		}
	});
});
