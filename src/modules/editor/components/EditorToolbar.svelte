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
				icon: '•',
				pressed: isActive(() => editor!.isActive('bulletList')),
				disabled: noEditor,
				onSelect: () => exec(() => editor!.chain().focus().toggleBulletList().run()),
			},
			{
				kind: 'button',
				id: 'ordered-list',
				label: 'Ordered list',
				icon: '1.',
				pressed: isActive(() => editor!.isActive('orderedList')),
				disabled: noEditor,
				onSelect: () =>
					exec(() => editor!.chain().focus().toggleOrderedList().run()),
			},
			{
				kind: 'button',
				id: 'blockquote',
				label: 'Blockquote',
				icon: '“',
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
				icon: '🖼',
				disabled: noEditor,
				title: 'Insert image from URL',
				onSelect: promptImageUrl,
			},
			{
				kind: 'button',
				id: 'insert-table',
				label: 'Insert table',
				icon: '⊞',
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
				icon: '✓',
				pressed: spellcheck,
				title: spellcheck ? 'Disable spellcheck' : 'Enable spellcheck',
				onSelect: () => onToggleSpellcheck(!spellcheck),
			},
			{
				kind: 'button',
				id: 'find-replace',
				label: 'Find & Replace',
				icon: '⌕',
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
				icon: '👁',
				title: 'Open this scene in the Reader',
				onSelect: onViewInReader,
			},
			{
				kind: 'button',
				id: 'nova',
				label: 'Nova',
				icon: '✨',
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
