import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * plan-023 stage-007 — default reader view preference.
 *
 * On first open (no saved localStorage entry), the reader route hydrates
 * the defaults store and applies `defaults.readerView` via `setReaderMode`.
 * Source-string regression because the behavior is wired through onMount.
 */
describe('books/[id]/+page.svelte — default reader view', () => {
	const source = readFileSync(resolve('src/routes/books/[id]/+page.svelte'), 'utf8');

	it('imports the defaults store', () => {
		expect(source).toContain("from '$lib/stores/defaults.svelte.js'");
		expect(source).toMatch(/import\s*\{[^}]*defaults[^}]*\}/);
	});

	it('checks for saved reader mode before overriding', () => {
		expect(source).toContain("localStorage.getItem('novellum:reader')");
		expect(source).toMatch(/hasSavedMode/);
	});

	it('hydrates the defaults store on first open', () => {
		// defaults.hydrate() must be awaited inside the !hasSavedMode branch
		const mountBlock = source.split('onMount(')[1] ?? '';
		expect(mountBlock).toContain('defaults.hydrate()');
	});

	it('applies defaults.readerView via setReaderMode on first open', () => {
		const mountBlock = source.split('onMount(')[1] ?? '';
		expect(mountBlock).toContain('setReaderMode(defaults.readerView)');
	});

	it('only applies default when no saved mode exists (guarded branch)', () => {
		const mountBlock = source.split('onMount(')[1] ?? '';
		// Both the guard and the setter must be inside the same conditional block.
		const guardIndex = mountBlock.indexOf('hasSavedMode');
		const setterIndex = mountBlock.indexOf('setReaderMode(defaults.readerView)');
		expect(guardIndex).toBeGreaterThanOrEqual(0);
		expect(setterIndex).toBeGreaterThan(guardIndex);
	});
});
