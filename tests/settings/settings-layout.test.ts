import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import { page } from '$app/state';
import { goto } from '$app/navigation';

import SettingsLayout from '../../src/routes/settings/+layout.svelte';

describe('settings/+layout.svelte', () => {
	let target: HTMLElement;
	let component: ReturnType<typeof mount> | null = null;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		(goto as unknown as { mockReset: () => void }).mockReset();
		(page as { url: URL }).url = new URL('http://localhost/settings/appearance');
	});

	afterEach(() => {
		if (component) {
			unmount(component);
			component = null;
		}
	});

	function pillButtons(): HTMLButtonElement[] {
		return Array.from(target.querySelectorAll('.pill-nav__btn'));
	}

	it('renders all ten category pills in order', () => {
		component = mount(SettingsLayout, { target, props: {} });
		flushSync();
		const labels = pillButtons().map((b) => b.textContent?.trim());
		expect(labels).toEqual([
			'Appearance',
			'Defaults',
			'Shortcuts',
			'AI',
			'Data',
			'Backup',
			'Export Defaults',
			'Privacy',
			'Updates',
			'About',
		]);
	});

	it.each([
		['/settings/appearance', 'Appearance'],
		['/settings/defaults', 'Defaults'],
		['/settings/shortcuts', 'Shortcuts'],
		['/settings/ai', 'AI'],
		['/settings/data', 'Data'],
		['/settings/backup', 'Backup'],
		['/settings/export-defaults', 'Export Defaults'],
		['/settings/privacy', 'Privacy'],
		['/settings/updates', 'Updates'],
		['/settings/about', 'About'],
	])('marks the active pill for %s', (path, label) => {
		(page as { url: URL }).url = new URL(`http://localhost${path}`);
		component = mount(SettingsLayout, { target, props: {} });
		flushSync();
		const active = pillButtons().filter((b) => b.classList.contains('active'));
		expect(active).toHaveLength(1);
		expect(active[0]?.textContent?.trim()).toBe(label);
	});

	it('marks no pill active for unrecognized routes', () => {
		(page as { url: URL }).url = new URL('http://localhost/settings/unknown');
		component = mount(SettingsLayout, { target, props: {} });
		flushSync();
		const active = pillButtons().filter((b) => b.classList.contains('active'));
		expect(active).toHaveLength(0);
	});

	it('navigates via goto when a pill is selected', () => {
		component = mount(SettingsLayout, { target, props: {} });
		flushSync();
		const dataPill = pillButtons().find((b) => b.textContent?.trim() === 'Data');
		expect(dataPill).toBeTruthy();
		dataPill?.click();
		flushSync();
		expect(goto).toHaveBeenCalledWith('/settings/data');
	});

	it('renders the page header title and description', () => {
		component = mount(SettingsLayout, { target, props: {} });
		flushSync();
		const title = target.querySelector('h1');
		expect(title?.textContent).toContain('Integrations & Settings');
		expect(target.textContent).toContain(
			'Manage your external connections and global preferences.',
		);
	});
});
