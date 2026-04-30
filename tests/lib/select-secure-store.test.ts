import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
	isDesktopRuntime,
	selectSecureStore,
} from '$lib/server/credentials/select-secure-store.js';

describe('selectSecureStore', () => {
	const originalEnv = process.env.NOVELLUM_DESKTOP;

	beforeEach(() => {
		delete process.env.NOVELLUM_DESKTOP;
	});

	afterEach(() => {
		if (originalEnv === undefined) {
			delete process.env.NOVELLUM_DESKTOP;
		} else {
			process.env.NOVELLUM_DESKTOP = originalEnv;
		}
	});

	it('detects desktop runtime via NOVELLUM_DESKTOP=1', () => {
		expect(isDesktopRuntime()).toBe(false);
		process.env.NOVELLUM_DESKTOP = '1';
		expect(isDesktopRuntime()).toBe(true);
	});

	it('returns the keyring store when desktop=true', () => {
		const store = selectSecureStore({ desktop: true, serviceName: 'NovellumTest' });
		// Keyring store has the same SecureStore contract; assert the
		// methods are present without invoking them (which would
		// require the native module).
		expect(typeof store.saveKey).toBe('function');
		expect(typeof store.loadKey).toBe('function');
		expect(typeof store.deleteKey).toBe('function');
		expect(typeof store.hasKey).toBe('function');
	});

	it('returns the filesystem store when desktop=false', () => {
		const store = selectSecureStore({ desktop: false, appDataDir: '/tmp/novellum-test' });
		expect(typeof store.saveKey).toBe('function');
	});

	it('falls back to env detection when desktop is unspecified', () => {
		process.env.NOVELLUM_DESKTOP = '1';
		const desktopStore = selectSecureStore({ serviceName: 'X' });
		expect(typeof desktopStore.saveKey).toBe('function');
		delete process.env.NOVELLUM_DESKTOP;
		const webStore = selectSecureStore({ appDataDir: '/tmp/novellum-test' });
		expect(typeof webStore.saveKey).toBe('function');
	});
});
