import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * plan-021 stage-003 phase-003 — deep-link target page id.
 *
 * The reader receives an optional `targetPageId` prop and must consume it on
 * mount, falling back to the saved scroll position only when the target does
 * not match. Source-string regression because the behavior is wired through
 * onMount, which is awkward to mount inside vitest's jsdom in isolation.
 */
describe('BookReaderView deep-link target', () => {
	const source = readFileSync(
		resolve('src/modules/reader/components/BookReaderView.svelte'),
		'utf8',
	);

	it('declares an optional targetPageId prop', () => {
		expect(source).toMatch(/targetPageId\?:\s*string\s*\|\s*null/);
		expect(source).toContain('targetPageId = null');
	});

	it('resolves the target on mount before restoring saved position', () => {
		expect(source).toContain("pages.findIndex((page) => page.id === targetPageId)");
		// The deep-link path must be checked before the saved-position fallback.
		const mountBlock = source.split('onMount(')[1] ?? '';
		const targetUsage = mountBlock.indexOf('targetPageId');
		const savedUsage = mountBlock.indexOf('getBookPageIndex');
		expect(targetUsage).toBeGreaterThanOrEqual(0);
		expect(targetUsage).toBeLessThan(savedUsage);
	});

	it('falls back to saved position when targetPageId does not match', () => {
		expect(source).toMatch(/if \(targetIndex >= 0\)/);
		// The else branch must consult getBookPageIndex.
		const mountBlock = source.split('onMount(')[1] ?? '';
		expect(mountBlock).toMatch(/else\s*\{[^}]*getBookPageIndex\(project\.id\)/);
	});
});
