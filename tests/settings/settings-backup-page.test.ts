import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';

// Stub $lib/preferences.js so onMount getPreference resolves cleanly
vi.mock('$lib/preferences.js', () => ({
	getPreference: vi.fn(async (_key: string, fallback: unknown) => fallback),
	setPreference: vi.fn(),
	deletePreference: vi.fn(),
}));

// ImportBackupDialog pulls in zip-import-parse and restore-service which
// need browser APIs. Stub the entire component to isolate the backup page.
vi.mock('$modules/export/components/ImportBackupDialog.svelte', async () => {
	const { default: stub } = await import('../settings/fixtures/theme-selector-stub.svelte');
	return { default: stub };
});

import BackupPage from '../../src/routes/settings/backup/+page.svelte';

describe('settings/backup/+page.svelte', () => {
	let target: HTMLElement;
	let component: ReturnType<typeof mount> | null = null;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
	});

	afterEach(() => {
		if (component) {
			unmount(component);
			component = null;
		}
	});

	it('renders the Backup & Restore heading', () => {
		component = mount(BackupPage, { target, props: {} });
		flushSync();
		const h1 = target.querySelector('h1');
		expect(h1?.textContent?.trim()).toBe('Backup & Restore');
	});

	it('renders the "Restore from backup file" button', () => {
		component = mount(BackupPage, { target, props: {} });
		flushSync();
		const buttons = Array.from(target.querySelectorAll('button'));
		const restoreBtn = buttons.find((b) =>
			b.textContent?.trim().includes('Restore from backup file'),
		);
		expect(restoreBtn).toBeTruthy();
	});

	it('renders the "Create backup" button as enabled (idle state)', () => {
		component = mount(BackupPage, { target, props: {} });
		flushSync();
		const buttons = Array.from(target.querySelectorAll('button'));
		const createBtn = buttons.find((b) =>
			b.textContent?.trim().includes('Create backup'),
		);
		expect(createBtn).toBeTruthy();
		// Phase-007 (plan-024 stage-001) wired this button to /api/backup/all.
		// It is now disabled only while a backup is in progress; the idle
		// state is enabled so the user can click it.
		expect(createBtn?.disabled).toBe(false);
	});
});
