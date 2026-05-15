import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';

const goto = vi.fn();
const getAllProjects = vi.fn();

vi.mock('$app/navigation', () => ({
	goto: (...args: unknown[]) => goto(...args),
}));

vi.mock('$modules/project/services/project-repository.js', () => ({
	getAllProjects: (...args: unknown[]) => getAllProjects(...args),
}));

import SidebarProjectSearch from '../../src/lib/components/sidebar/SidebarProjectSearch.svelte';

describe('SidebarProjectSearch.svelte', () => {
	beforeEach(() => {
		goto.mockReset();
		getAllProjects.mockReset();
		document.body.innerHTML = '';
	});

	it('filters projects by title and navigates on click', async () => {
		getAllProjects.mockResolvedValue([
			{ id: 'p1', title: 'Alpha Story' },
			{ id: 'p2', title: 'Beta Book' },
		]);

		const target = document.createElement('div');
		document.body.appendChild(target);
		const component = mount(SidebarProjectSearch, { target, props: {} });
		flushSync();
		await tick();
		flushSync();

		const input = target.querySelector('input[type="search"]') as HTMLInputElement;
		input.value = 'beta';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		const resultButton = target.querySelector('.sidebar-search-results__item') as HTMLButtonElement;
		expect(resultButton?.textContent).toContain('Beta Book');
		resultButton.click();
		expect(goto).toHaveBeenCalledWith('/projects/p2');

		unmount(component);
		target.remove();
	});

	it('navigates to first match when Enter is pressed', async () => {
		getAllProjects.mockResolvedValue([
			{ id: 'p1', title: 'Alpha Story' },
			{ id: 'p2', title: 'Alpha Draft' },
		]);

		const target = document.createElement('div');
		document.body.appendChild(target);
		const component = mount(SidebarProjectSearch, { target, props: {} });
		flushSync();
		await tick();
		flushSync();

		const input = target.querySelector('input[type="search"]') as HTMLInputElement;
		input.value = 'alpha';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		flushSync();

		expect(goto).toHaveBeenCalledWith('/projects/p1');

		unmount(component);
		target.remove();
	});

	it('shows a no-matches state when nothing matches the query', async () => {
		getAllProjects.mockResolvedValue([{ id: 'p1', title: 'Alpha Story' }]);

		const target = document.createElement('div');
		document.body.appendChild(target);
		const component = mount(SidebarProjectSearch, { target, props: {} });
		flushSync();
		await tick();
		flushSync();

		const input = target.querySelector('input[type="search"]') as HTMLInputElement;
		input.value = 'zzz';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		expect(target.textContent).toContain('No matches.');

		unmount(component);
		target.remove();
	});
});
