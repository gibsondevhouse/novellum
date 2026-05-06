import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * plan-021 stage-002 — page margins & typography
 *
 * Source-string regression tests guarding the design-token contract for the
 * long-form reading surface. The tokens are defined once in tokens.css and
 * must be the only knob touched when adjusting page geometry.
 */
describe('reader page geometry tokens', () => {
	const tokensCss = readFileSync(resolve('src/styles/tokens.css'), 'utf8');
	const bookPage = readFileSync(
		resolve('src/modules/reader/components/BookPage.svelte'),
		'utf8',
	);
	const classicReader = readFileSync(
		resolve('src/modules/reader/components/ClassicReaderView.svelte'),
		'utf8',
	);

	it('declares all reader-* design tokens in tokens.css', () => {
		const required = [
			'--reader-page-padding-block-start',
			'--reader-page-padding-block-end',
			'--reader-page-padding-inline',
			'--reader-measure-max',
			'--reader-prose-font',
			'--reader-prose-size',
			'--reader-prose-leading',
			'--reader-prose-tracking',
		];
		for (const token of required) {
			expect(tokensCss, `tokens.css must define ${token}`).toContain(`${token}:`);
		}
	});

	it('caps the reader measure to a paperback-friendly width', () => {
		expect(tokensCss).toMatch(/--reader-measure-max:\s*68ch/);
	});

	it('BookPage applies reader page padding tokens', () => {
		expect(bookPage).toContain('var(--reader-page-padding-block-start)');
		expect(bookPage).toContain('var(--reader-page-padding-inline)');
		expect(bookPage).toContain('var(--reader-page-padding-block-end)');
	});

	it('BookPage caps the scene measure and uses reader prose tokens', () => {
		expect(bookPage).toContain('max-width: var(--reader-measure-max)');
		expect(bookPage).toContain('font-family: var(--reader-prose-font)');
		expect(bookPage).toContain('font-size: var(--reader-prose-size)');
		expect(bookPage).toContain('line-height: var(--reader-prose-leading)');
	});

	it('ClassicReaderView applies reader page padding and measure tokens', () => {
		expect(classicReader).toContain('var(--reader-page-padding-block-start)');
		expect(classicReader).toContain('var(--reader-page-padding-inline)');
		expect(classicReader).toContain('var(--reader-page-padding-block-end)');
		expect(classicReader).toContain('max-width: var(--reader-measure-max)');
	});

	it('ClassicReaderView prose uses the reader typography scale', () => {
		expect(classicReader).toContain('font-family: var(--reader-prose-font)');
		expect(classicReader).toContain('font-size: var(--reader-prose-size)');
		expect(classicReader).toContain('line-height: var(--reader-prose-leading)');
	});

	it('reader prose font does not fall back to the legacy --font-sans body stack', () => {
		// Legacy body text used --font-sans / --text-base; the reading surface
		// must opt into the dedicated display + reader scale instead.
		const bookPageStyle = bookPage.split('<style>')[1] ?? '';
		const classicStyle = classicReader.split('<style>')[1] ?? '';
		expect(bookPageStyle).not.toMatch(
			/\.book-page__scene-body\s*\{[^}]*font-family:\s*var\(--font-sans\)/,
		);
		expect(classicStyle).not.toMatch(
			/\.reader-scene-content\s*\{[^}]*font-family:\s*var\(--font-sans\)/,
		);
	});
});
