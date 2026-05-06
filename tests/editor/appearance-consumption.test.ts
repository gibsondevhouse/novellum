import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * plan-023 stage-007 — appearance preference consumption.
 *
 * The editor route hydrates the appearance store on mount so that
 * --editor-font-size / --editor-line-height CSS vars are applied before
 * the first paint. The ManuscriptEditorPane binds those tokens directly.
 * Source-string regression for the onMount wiring; CSS token binding
 * is validated by inspecting the component's style block.
 */
describe('editor route — appearance hydration', () => {
	const routeSource = readFileSync(
		resolve('src/routes/projects/[id]/editor/+page.svelte'),
		'utf8',
	);

	it('imports the appearance store', () => {
		expect(routeSource).toContain("from '$lib/stores/appearance.svelte.js'");
		expect(routeSource).toMatch(/import\s*\{[^}]*appearance[^}]*\}/);
	});

	it('calls appearance.hydrate() inside onMount', () => {
		const mountBlock = routeSource.split('onMount(')[1] ?? '';
		expect(mountBlock).toContain('appearance.hydrate()');
	});
});

describe('ManuscriptEditorPane — CSS token binding', () => {
	const paneSource = readFileSync(
		resolve('src/modules/editor/components/ManuscriptEditorPane.svelte'),
		'utf8',
	);

	it('binds --editor-font-size token on .editor-host', () => {
		// Must use the token, not a hardcoded clamp() or px value.
		expect(paneSource).toContain('font-size: var(--editor-font-size)');
	});

	it('binds --editor-line-height token on .editor-host', () => {
		expect(paneSource).toContain('line-height: var(--editor-line-height)');
	});

	it('does not use hardcoded font-size clamp() in .editor-host', () => {
		// Regression guard: the old hardcoded value must be gone.
		expect(paneSource).not.toContain('font-size: clamp(');
	});

	it('does not use hardcoded line-height numeric value in .editor-host', () => {
		// 1.9 was the old value; it must not appear in the editor-host block.
		const editorHostBlock = paneSource.split('.editor-host {')[1]?.split('}')[0] ?? '';
		expect(editorHostBlock).not.toMatch(/line-height:\s*1\.9/);
	});
});
