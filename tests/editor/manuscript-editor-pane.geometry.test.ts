import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount } from 'svelte';
import ManuscriptEditorPane from '$modules/editor/components/ManuscriptEditorPane.svelte';

/**
 * plan-023 stage-001 — Editor page geometry contract.
 *
 * Locks two structural invariants that future stages must preserve:
 *   1. The in-canvas scene-title input is gone (rename now lives in
 *      the outline sidebar — option B from the stage decision log).
 *   2. The page surface renders as `.editor-page` (not the legacy
 *      `.editor-column`) so the token-driven word-processor geometry
 *      stays bound to a single, named structural class.
 */

function render() {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const component = mount(ManuscriptEditorPane, {
		target,
		props: {
			content: '<p>Lorem.</p>',
			onContentChange: () => {},
		},
	});
	return {
		target,
		cleanup: () => {
			try {
				unmount(component);
			} catch {
				// TipTap teardown can throw under jsdom; swallow — geometry
				// assertions only inspect the static SSR/CSR markup.
			}
			target.remove();
		},
	};
}

describe('ManuscriptEditorPane — page geometry (plan-023 stage-001)', () => {
	let view: ReturnType<typeof render>;

	beforeEach(() => {
		document.body.innerHTML = '';
		view = render();
	});

	afterEach(() => {
		view.cleanup();
	});

	it('does not render an in-canvas Scene title input', () => {
		const titleInput = view.target.querySelector('input[aria-label="Scene title"]');
		expect(titleInput).toBeNull();
		// Belt-and-braces: the legacy class must also be gone.
		expect(view.target.querySelector('.title-input')).toBeNull();
	});

	it('renders the page surface as .editor-page (not the legacy .editor-column)', () => {
		const page = view.target.querySelector('.editor-page');
		expect(page).not.toBeNull();
		expect(view.target.querySelector('.editor-column')).toBeNull();
	});
});
