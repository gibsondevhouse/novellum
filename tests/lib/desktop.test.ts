import { describe, it, expect, beforeEach } from 'vitest';
import { getDesktop } from '$lib/desktop/index.js';

describe('desktop capabilities (web stub)', () => {
	beforeEach(() => {
		// Ensure no Tauri marker leaks between tests.
		delete (window as { __TAURI_INTERNALS__?: object }).__TAURI_INTERNALS__;
		delete (window as { __TAURI__?: object }).__TAURI__;
	});

	it('returns the no-op stub on web', async () => {
		const desktop = await getDesktop();
		await expect(desktop.openDataFolder()).resolves.toBeUndefined();
		await expect(desktop.revealItemInFolder('/anywhere')).resolves.toBeUndefined();
		await expect(desktop.pickSaveLocation('scene.txt')).resolves.toBeNull();
		await expect(desktop.pickOpenLocation()).resolves.toBeNull();
	});

	it('caches the resolved surface', async () => {
		const a = await getDesktop();
		const b = await getDesktop();
		expect(a).toBe(b);
	});
});
