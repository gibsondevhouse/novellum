<!--
	EditorToolbar — TipTap-aware consumer of `PillToolbar`.

	Owns no editor state; receives the lifted TipTap `editor` instance
	plus a `tick` counter the parent bumps on selection/update so press
	state derivation stays reactive. Exposes typed callbacks for the
	pieces the route owns (spellcheck, view-in-reader).

	plan-023 stage-002 phase-002.
-->
<script lang="ts">
	import { PillToolbar, type PillToolbarItem } from '$lib/components/ui/index.js';

	/* eslint-disable @typescript-eslint/no-explicit-any */

	// Compact inline SVG strings for toolbar icons (14×14, currentColor stroked).
	const SVG_BULLET = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>`;
	const SVG_ORDERED = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>`;
	const SVG_QUOTE = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`;
	const SVG_IMAGE = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><polyline points="21 15 16 10 5 21"/></svg>`;
	const SVG_TABLE = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`;
	const SVG_SPELL = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
	const SVG_SEARCH = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
	const SVG_EYE = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
	const SVG_NOVA = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.88 5.76a2 2 0 0 0 1.27 1.27L21 12l-5.85 1.97a2 2 0 0 0-1.27 1.27L12 21l-1.88-5.76a2 2 0 0 0-1.27-1.27L3 12l5.85-1.97a2 2 0 0 0 1.27-1.27L12 3z"/></svg>`;

	interface Props {
		/** TipTap editor instance lifted from `ManuscriptEditorPane`. */
		editor: any | null;
		/** Reactivity tick — bumped by the parent on every TipTap update. */
		tick?: number;
		/** Spellcheck toggle (route-owned). */
		spellcheck: boolean;
		onToggleSpellcheck: (next: boolean) => void;
		/** View-in-reader handoff lands in stage-003; this stage just emits. */
		onViewInReader: () => void;
		/** Nova copilot toggle (plan-023 stage-004 phase-002). */
		novaPanelOpen?: boolean;
		onToggleNova?: () => void;
	}

	let {
		editor,
		tick = 0,
		spellcheck,
		onToggleSpellcheck,
		onViewInReader,
		novaPanelOpen = false,
		onToggleNova,
	}: Props = $props();

	function isActive(check: () => boolean): boolean {
		// Touch tick to keep press-state derivation reactive.
		void tick;
		if (!editor) return false;
		try {
			return check();
		} catch {
			return false;
		}
	}

	function exec(command: () => void): void {
		if (!editor) return;
		command();
	}

	function promptImageUrl(): void {
		if (!editor) return;
		const url = typeof window !== 'undefined' ? window.prompt('Image URL') : null;
		if (!url) return;
		editor.chain().focus().setImage({ src: url }).run();
	}

	function insertDefaultTable(): void {
		if (!editor) return;
		editor
			.chain()
			.focus()
			.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
			.run();
	}

	const items = $derived.by((): PillToolbarItem[] => {
		const noEditor = editor === null;

		return [
			// Format group
			{
				kind: 'button',
				id: 'bold',
				label: 'Bold',
				icon: 'B',
				pressed: isActive(() => editor!.isActive('bold')),
				disabled: noEditor,
				onSelect: () => exec(() => editor!.chain().focus().toggleBold().run()),
			},
			{
				kind: 'button',
				id: 'italic',
				label: 'Italic',
				icon: 'I',
				pressed: isActive(() => editor!.isActive('italic')),
				disabled: noEditor,
				onSelect: () => exec(() => editor!.chain().focus().toggleItalic().run()),
			},
			{
				kind: 'button',
				id: 'underline',
				label: 'Underline',
				icon: 'U',
				pressed: isActive(() => editor!.isActive('underline')),
				disabled: noEditor,
				onSelect: () => exec(() => editor!.chain().focus().toggleUnderline().run()),
			},
			{
				kind: 'button',
				id: 'strike',
				label: 'Strikethrough',
				icon: 'S',
				pressed: isActive(() => editor!.isActive('strike')),
				disabled: noEditor,
				onSelect: () => exec(() => editor!.chain().focus().toggleStrike().run()),
			},
			{ kind: 'divider', id: 'd-format' },
			// Block group
			{
				kind: 'button',
				id: 'h1',
				label: 'Heading 1',
				icon: 'H1',
				pressed: isActive(() => editor!.isActive('heading', { level: 1 })),
				disabled: noEditor,
				onSelect: () =>
					exec(() => editor!.chain().focus().toggleHeading({ level: 1 }).run()),
			},
			{
				kind: 'button',
				id: 'h2',
				label: 'Heading 2',
				icon: 'H2',
				pressed: isActive(() => editor!.isActive('heading', { level: 2 })),
				disabled: noEditor,
				onSelect: () =>
					exec(() => editor!.chain().focus().toggleHeading({ level: 2 }).run()),
			},
			{
				kind: 'button',
				id: 'bullet-list',
				label: 'Bullet list',
				icon: SVG_BULLET,
				pressed: isActive(() => editor!.isActive('bulletList')),
				disabled: noEditor,
				onSelect: () => exec(() => editor!.chain().focus().toggleBulletList().run()),
			},
			{
				kind: 'button',
				id: 'ordered-list',
				label: 'Ordered list',
				icon: SVG_ORDERED,
				pressed: isActive(() => editor!.isActive('orderedList')),
				disabled: noEditor,
				onSelect: () =>
					exec(() => editor!.chain().focus().toggleOrderedList().run()),
			},
			{
				kind: 'button',
				id: 'blockquote',
				label: 'Blockquote',
				icon: SVG_QUOTE,
				pressed: isActive(() => editor!.isActive('blockquote')),
				disabled: noEditor,
				onSelect: () => exec(() => editor!.chain().focus().toggleBlockquote().run()),
			},
			{ kind: 'divider', id: 'd-block' },
			// Insert group
			{
				kind: 'button',
				id: 'insert-image',
				label: 'Insert image',
				icon: SVG_IMAGE,
				disabled: noEditor,
				title: 'Insert image from URL',
				onSelect: promptImageUrl,
			},
			{
				kind: 'button',
				id: 'insert-table',
				label: 'Insert table',
				icon: SVG_TABLE,
				disabled: noEditor,
				title: 'Insert 3 × 3 table',
				onSelect: insertDefaultTable,
			},
			{ kind: 'divider', id: 'd-insert' },
			// Tools group
			{
				kind: 'button',
				id: 'spellcheck',
				label: 'Spellcheck',
				icon: SVG_SPELL,
				pressed: spellcheck,
				title: spellcheck ? 'Disable spellcheck' : 'Enable spellcheck',
				onSelect: () => onToggleSpellcheck(!spellcheck),
			},
			{
				kind: 'button',
				id: 'find-replace',
				label: 'Find & Replace',
				icon: SVG_SEARCH,
				disabled: true,
				title: 'Find & Replace — coming soon',
				onSelect: () => {
					/* stub — disabled until a future stage */
				},
			},
			{ kind: 'divider', id: 'd-tools' },
			// View group
			{
				kind: 'button',
				id: 'view-in-reader',
				label: 'View in Reader',
				icon: SVG_EYE,
				title: 'Open this scene in the Reader',
				onSelect: onViewInReader,
			},
			{
				kind: 'button',
				id: 'nova',
				label: 'Nova',
				icon: SVG_NOVA,
				pressed: novaPanelOpen,
				disabled: !onToggleNova,
				title: novaPanelOpen ? 'Close Nova copilot' : 'Open Nova copilot',
				onSelect: () => onToggleNova?.(),
			},
		];
	});
</script>

<div class="editor-toolbar-wrap">
	<PillToolbar items={items} ariaLabel="Editor formatting toolbar" />
</div>

<style>
	.editor-toolbar-wrap {
		display: flex;
		justify-content: center;
		padding: var(--space-2) var(--space-4);
	}
</style>
