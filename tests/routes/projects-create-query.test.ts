import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PAGE_PATH = resolve(__dirname, '..', '..', 'src', 'routes', 'projects', '+page.svelte');

describe('/projects create query flow', () => {
	const source = readFileSync(PAGE_PATH, 'utf8');

	it('reads ?create=1 from page URL state', () => {
		expect(source).toContain("page.url.searchParams.has('create')");
	});

	it('renders the create modal from the projects route', () => {
		expect(source).toContain('<ProjectCreateCard oncancel={closeCreateProject} />');
	});

	it('clears the query when dismissing the modal', () => {
		expect(source).toContain("goto('/projects', { replaceState: true, noScroll: true })");
	});
});
