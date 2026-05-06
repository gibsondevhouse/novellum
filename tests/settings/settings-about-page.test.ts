import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync, tick } from 'svelte';

const mockAbout = {
	appName: 'Novellum',
	version: '1.0.0',
	license: 'Proprietary — All rights reserved',
	description: 'The writing companion built for fiction authors.',
};

// Mock global fetch for the /api/settings/about call
beforeEach(() => {
	vi.stubGlobal(
		'fetch',
		vi.fn(async (url: string) => {
			if (url === '/api/settings/about') {
				return {
					ok: true,
					json: async () => mockAbout,
				};
			}
			return { ok: false, json: async () => ({}) };
		}),
	);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

import AboutPage from '../../src/routes/settings/about/+page.svelte';

describe('settings/about/+page.svelte', () => {
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

	it('renders the About heading', () => {
		component = mount(AboutPage, { target, props: {} });
		flushSync();
		const h1 = target.querySelector('h1');
		expect(h1?.textContent?.trim()).toBe('About');
	});

	it('renders app name and version after fetch resolves', async () => {
		component = mount(AboutPage, { target, props: {} });
		flushSync();
		// Wait for onMount async fetch to complete
		await tick();
		await tick();
		flushSync();
		expect(target.textContent).toContain('Novellum');
		expect(target.textContent).toContain('1.0.0');
	});

	it('renders description and license', async () => {
		component = mount(AboutPage, { target, props: {} });
		flushSync();
		await tick();
		await tick();
		flushSync();
		expect(target.textContent).toContain('fiction authors');
		expect(target.textContent).toContain('Proprietary');
	});
});
