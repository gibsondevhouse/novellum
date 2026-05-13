import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import EditorToolbar from '$modules/editor/components/EditorToolbar.svelte';

/**
 * plan-023 stage-002 phase-005 — EditorToolbar coverage.
 *
 * Renders the toolbar with a stub TipTap editor exposing the chain
 * methods we exercise. We verify the four groups appear, that the
 * spellcheck toggle invokes its callback, and that pressing Bold
 * pipes through to `editor.chain().focus().toggleBold().run()`.
 */

interface ChainStub {
	focus: () => ChainStub;
	toggleBold: ReturnType<typeof vi.fn>;
	toggleItalic: () => ChainStub;
	toggleUnderline: () => ChainStub;
	toggleStrike: () => ChainStub;
	toggleHeading: () => ChainStub;
	toggleBulletList: () => ChainStub;
	toggleOrderedList: () => ChainStub;
	toggleBlockquote: () => ChainStub;
	setImage: () => ChainStub;
	insertTable: () => ChainStub;
	run: ReturnType<typeof vi.fn>;
}

function makeEditorStub() {
	const run = vi.fn();
	const toggleBold = vi.fn(() => chain);
	const chain: ChainStub = {
		focus: () => chain,
		toggleBold,
		toggleItalic: () => chain,
		toggleUnderline: () => chain,
		toggleStrike: () => chain,
		toggleHeading: () => chain,
		toggleBulletList: () => chain,
		toggleOrderedList: () => chain,
		toggleBlockquote: () => chain,
		setImage: () => chain,
		insertTable: () => chain,
		run,
	};
	const editor = {
		isActive: vi.fn(() => false),
		chain: () => chain,
	};
	return { editor, run, toggleBold };
}

describe('EditorToolbar.svelte', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders all four format/block/insert/tools groups + view button', () => {
		const { editor } = makeEditorStub();
		const cmp = mount(EditorToolbar, {
			target,
			props: {
				editor,
				tick: 0,
				spellcheck: true,
				onToggleSpellcheck: () => {},
				onViewInReader: () => {},
			},
		});
		flushSync();

		// Format group
		expect(target.querySelector('[aria-label="Bold"]')).not.toBeNull();
		expect(target.querySelector('[aria-label="Italic"]')).not.toBeNull();
		expect(target.querySelector('[aria-label="Underline"]')).not.toBeNull();
		expect(target.querySelector('[aria-label="Strikethrough"]')).not.toBeNull();
		// Block group
		expect(target.querySelector('[aria-label="Heading 1"]')).not.toBeNull();
		expect(target.querySelector('[aria-label="Heading 2"]')).not.toBeNull();
		expect(target.querySelector('[aria-label="Bullet list"]')).not.toBeNull();
		expect(target.querySelector('[aria-label="Ordered list"]')).not.toBeNull();
		expect(target.querySelector('[aria-label="Blockquote"]')).not.toBeNull();
		// Insert group
		expect(target.querySelector('[aria-label="Insert image"]')).not.toBeNull();
		expect(target.querySelector('[aria-label="Insert table"]')).not.toBeNull();
		// Tools group
		expect(target.querySelector('[aria-label="Spellcheck"]')).not.toBeNull();
		// View
		expect(target.querySelector('[aria-label="View in Reader"]')).not.toBeNull();

		// Dividers between groups (3 groups → at least 3 dividers in items list)
		expect(target.querySelectorAll('[role="separator"]').length).toBeGreaterThanOrEqual(3);

		unmount(cmp);
	});

	it('toggling spellcheck calls onToggleSpellcheck with the inverted value', () => {
		const { editor } = makeEditorStub();
		const onToggleSpellcheck = vi.fn();
		const cmp = mount(EditorToolbar, {
			target,
			props: {
				editor,
				tick: 0,
				spellcheck: true,
				onToggleSpellcheck,
				onViewInReader: () => {},
			},
		});
		flushSync();

		const btn = target.querySelector('[aria-label="Spellcheck"]') as HTMLButtonElement;
		btn.click();
		expect(onToggleSpellcheck).toHaveBeenCalledWith(false);

		unmount(cmp);
	});

	it('Bold button pipes into editor.chain().focus().toggleBold().run()', () => {
		const { editor, run, toggleBold } = makeEditorStub();
		const cmp = mount(EditorToolbar, {
			target,
			props: {
				editor,
				tick: 0,
				spellcheck: true,
				onToggleSpellcheck: () => {},
				onViewInReader: () => {},
			},
		});
		flushSync();

		const bold = target.querySelector('[aria-label="Bold"]') as HTMLButtonElement;
		bold.click();
		expect(toggleBold).toHaveBeenCalledTimes(1);
		expect(run).toHaveBeenCalledTimes(1);

		unmount(cmp);
	});

	it('view-in-reader button invokes onViewInReader', () => {
		const { editor } = makeEditorStub();
		const onViewInReader = vi.fn();
		const cmp = mount(EditorToolbar, {
			target,
			props: {
				editor,
				tick: 0,
				spellcheck: true,
				onToggleSpellcheck: () => {},
				onViewInReader,
			},
		});
		flushSync();

		const btn = target.querySelector('[aria-label="View in Reader"]') as HTMLButtonElement;
		btn.click();
		expect(onViewInReader).toHaveBeenCalledTimes(1);

		unmount(cmp);
	});

	it('all editor-dependent buttons are disabled when editor is null', () => {
		const cmp = mount(EditorToolbar, {
			target,
			props: {
				editor: null,
				tick: 0,
				spellcheck: true,
				onToggleSpellcheck: () => {},
				onViewInReader: () => {},
			},
		});
		flushSync();

		const bold = target.querySelector('[aria-label="Bold"]') as HTMLButtonElement;
		expect(bold.disabled).toBe(true);
		// Spellcheck does not require an editor.
		const spellcheck = target.querySelector('[aria-label="Spellcheck"]') as HTMLButtonElement;
		expect(spellcheck.disabled).toBe(false);

		unmount(cmp);
	});
});
