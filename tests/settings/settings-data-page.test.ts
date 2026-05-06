import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';

import DataPage from '../../src/routes/settings/data/+page.svelte';

describe('settings/data/+page.svelte', () => {
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

	it('renders the Data Portability heading', () => {
		component = mount(DataPage, { target, props: {} });
		flushSync();
		const heading = target.querySelector('#data-portability-heading');
		expect(heading?.textContent).toContain('Data Portability');
	});

	it('links to the migration tool at /settings/migrate', () => {
		component = mount(DataPage, { target, props: {} });
		flushSync();
		const link = target.querySelector('a.section-link');
		expect(link?.getAttribute('href')).toBe('/settings/migrate');
		expect(link?.textContent).toContain('Open Migration Tool');
	});

	it('describes the data portability action', () => {
		component = mount(DataPage, { target, props: {} });
		flushSync();
		expect(target.textContent).toContain(
			'Migrate any legacy in-browser data into the canonical SQLite database',
		);
	});
});
