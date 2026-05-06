import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * plan-021 stage-003 phase-004 — virtualization contract.
 *
 * The reader must mount at most two `BookPage` instances at a time so DOM
 * size stays flat on 100k+ word manuscripts. Source-string regression
 * because the contract is encoded in the `visiblePages` $derived shape and
 * the `BookSpread` `{#each}` over that shape — both stable, easy to assert.
 */
describe('reader virtualization contract', () => {
	const view = readFileSync(
		resolve('src/modules/reader/components/BookReaderView.svelte'),
		'utf8',
	);
	const spread = readFileSync(
		resolve('src/modules/reader/components/BookSpread.svelte'),
		'utf8',
	);

	it('passes only the derived visiblePages slice to BookSpread', () => {
		// BookReaderView renders <BookSpread pages={visiblePages} ... /> and
		// derives visiblePages as a 1- or 2-element array.
		expect(view).toContain('<BookSpread pages={visiblePages}');
		expect(view).toMatch(/visiblePages\s*=\s*\$derived\.by\(/);
	});

	it('single-page mode caps the slice at 1 entry', () => {
		const visibleBlock = view.split('visiblePages = $derived.by')[1] ?? '';
		expect(visibleBlock).toMatch(/if \(isSingle\)/);
		expect(visibleBlock).toMatch(/\[pages\[currentIndex\] \?\? null\]/);
	});

	it('spread mode caps the slice at 2 entries', () => {
		const visibleBlock = view.split('visiblePages = $derived.by')[1] ?? '';
		expect(visibleBlock).toMatch(
			/\[pages\[leftIndex\] \?\? null,\s*pages\[leftIndex \+ 1\] \?\? null\]/,
		);
	});

	it('BookSpread iterates only over its received pages prop, never the full array', () => {
		expect(spread).toMatch(/{#each pages as page/);
		// BookSpread does not import or reference the full reader-pages list.
		expect(spread).not.toContain('buildReaderPages');
	});

	it('mounts BookPage components keyed by page id so swap is O(1)', () => {
		expect(spread).toMatch(/{#each pages as page, index \(page\?\.id \?\? `blank-/);
	});
});
