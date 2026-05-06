import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Stage-001 (plan-021) — reader empty state.
 *
 * The /books/[id] route must render an EmptyStatePanel when the bound
 * book has no scenes containing readable (non-whitespace, post-HTML-strip)
 * content. This guards against the "single full-bleed column with no
 * content" surface reported in problems-found-001.md problem 002.
 */

const PAGE_PATH = resolve(
	__dirname,
	'..',
	'..',
	'src',
	'routes',
	'books',
	'[id]',
	'+page.svelte',
);

describe('books/[id] reader — empty state', () => {
	const source = readFileSync(PAGE_PATH, 'utf8');

	it('imports EmptyStatePanel', () => {
		expect(source).toContain("from '$lib/components/ui/EmptyStatePanel.svelte'");
	});

	it('computes hasReadableContent from chapter scenes', () => {
		expect(source).toContain('hasReadableContent');
		expect(source).toMatch(/replace\(\/<\[\^>\]\*>\/g, ''\)/);
	});

	it('renders EmptyStatePanel when content is empty', () => {
		expect(source).toMatch(/\{#if !hasReadableContent\}[\s\S]*<EmptyStatePanel/);
	});

	it('offers a CTA to the project hub and a CTA back to the library', () => {
		expect(source).toContain('/projects/${data.project.id}');
		expect(source).toContain("goto('/books')");
	});
});
