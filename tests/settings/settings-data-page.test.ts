import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';

const isMigrationComplete = vi.fn();
const preCheck = vi.fn();
const migrate = vi.fn();

vi.mock('$lib/migration/index.js', () => ({
	isMigrationComplete: (...args: unknown[]) => isMigrationComplete(...args),
	preCheck: (...args: unknown[]) => preCheck(...args),
	migrate: (...args: unknown[]) => migrate(...args),
	MIGRATION_COMPLETE_KEY: 'migration-complete',
}));

const getPreference = vi.fn();

vi.mock('$lib/preferences.js', () => ({
	getPreference: (...args: unknown[]) => getPreference(...args),
}));

import DataPage from '../../src/routes/settings/data/+page.svelte';

describe('settings/data/+page.svelte', () => {
	let target: HTMLElement;
	let component: ReturnType<typeof mount> | null = null;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		isMigrationComplete.mockReset();
		preCheck.mockReset();
		migrate.mockReset();
		getPreference.mockReset();
	});

	afterEach(() => {
		if (component) {
			unmount(component);
			component = null;
		}
	});

	it('renders the Migrate Data heading', async () => {
		isMigrationComplete.mockResolvedValue(false);
		preCheck.mockResolvedValue([]);
		component = mount(DataPage, { target, props: {} });
		flushSync();
		await new Promise((resolve) => setTimeout(resolve, 0));
		flushSync();
		const heading = target.querySelector('h1.page-header__title');
		expect(heading?.textContent).toBe('Migrate Data');
	});

	it('shows loading status on initial mount before async resolves', () => {
		// Never resolves — keeps phase at 'loading'
		isMigrationComplete.mockReturnValue(new Promise(() => {}));
		component = mount(DataPage, { target, props: {} });
		flushSync();
		expect(target.textContent).toContain('Checking databases');
	});

	it('shows already-complete banner when migration is done', async () => {
		isMigrationComplete.mockResolvedValue(true);
		getPreference.mockResolvedValue('2026-01-01T00:00:00.000Z');
		component = mount(DataPage, { target, props: {} });
		flushSync();
		await new Promise((resolve) => setTimeout(resolve, 0));
		flushSync();
		expect(target.textContent).toContain('Migration already complete.');
	});
});
