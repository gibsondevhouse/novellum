<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor as TipTapEditor } from '@tiptap/core';
	import Placeholder from '@tiptap/extension-placeholder';
	import StarterKit from '@tiptap/starter-kit';
	import Underline from '@tiptap/extension-underline';
	import Image from '@tiptap/extension-image';
	import { Table } from '@tiptap/extension-table';
	import { TableRow } from '@tiptap/extension-table-row';
	import { TableHeader } from '@tiptap/extension-table-header';
	import { TableCell } from '@tiptap/extension-table-cell';
	import { GhostButton } from '$lib/components/ui/index.js';

	/* eslint-disable @typescript-eslint/no-explicit-any */

	interface Props {
		content: string;
		onContentChange: (html: string) => void;
		/**
		 * Fires once after the TipTap editor instance is constructed.
		 * Allows the route to lift the instance for an external toolbar.
		 * Called with `null` on destroy.
		 */
		oneditorReady?: (editor: any | null) => void;
		/**
		 * Fires on every TipTap onUpdate / onSelectionUpdate so external
		 * toolbars can re-derive `isActive` press state.
		 */
		ontick?: () => void;
		/** Spellcheck toggle, applied to the contenteditable host. */
		spellcheck?: boolean;
		/** Called when the user clicks "Ask Nova" with selected text. */
		onAskNova?: (selectedText: string) => void;
	}

	let {
		content,
		onContentChange,
		oneditorReady,
		ontick,
		spellcheck = true,
		onAskNova,
	}: Props = $props();

	let editorHost: HTMLElement;
	let bubbleMenuHost: HTMLElement | null = null;
	let editor: any = null;
	let updateTick = $state(0);
	let isSelecting = $state(false);
	let bubbleMenuVisible = $state(false);
	let bubbleMenuPosition = $state({ top: 0, left: 0 });

	onMount(() => {
		editor = new (TipTapEditor as any)({
			element: editorHost,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2] },
					bulletList: { keepMarks: true },
					orderedList: { keepMarks: true },
				}),
				Underline,
				Image.configure({ inline: false, allowBase64: false }),
				Table.configure({ resizable: false }),
				TableRow,
				TableHeader,
				TableCell,
				Placeholder.configure({
					placeholder: 'Begin drafting...',
					showOnlyCurrent: false,
					emptyEditorClass: 'is-empty',
				}),
			],
			content,
			onUpdate: ({ editor: currentEditor }: { editor: any }) => {
				onContentChange(currentEditor.getHTML());
				updateTick += 1;
				ontick?.();
			},
			onSelectionUpdate: ({ editor: currentEditor }: { editor: any }) => {
				const hasSelection = !currentEditor.state.selection.empty;
				isSelecting = hasSelection;
				if (hasSelection) {
					updateBubbleMenuPosition(currentEditor);
				}
				updateTick += 1;
				ontick?.();
			},
			editorProps: {
				attributes: {
					class: 'manuscript-canvas',
					spellcheck: String(spellcheck),
				},
			},
		});
		oneditorReady?.(editor);
	});

	onDestroy(() => {
		oneditorReady?.(null);
		editor?.destroy();
		editor = null;
	});

	$effect(() => {
		if (!editor) return;
		const currentHtml = editor.getHTML();
		if (content !== currentHtml) {
			editor.commands.setContent(content || '<p></p>', { emitUpdate: false });
		}
	});

	$effect(() => {
		if (!editor) return;
		const next = String(spellcheck);
		editor.setOptions({
			editorProps: {
				attributes: {
					class: 'manuscript-canvas',
					spellcheck: next,
				},
			},
		});
		// Ensure the live DOM node also reflects the new value, since
		// setOptions may only re-apply on the next render cycle.
		const dom = editorHost?.querySelector('.manuscript-canvas');
		if (dom instanceof HTMLElement) {
			dom.setAttribute('spellcheck', next);
		}
	});

	function updateBubbleMenuPosition(currentEditor: any): void {
		if (!bubbleMenuHost || !currentEditor) return;

		const { from, to } = currentEditor.state.selection;
		if (from === to) {
			bubbleMenuVisible = false;
			return;
		}

		const view = currentEditor.view;
		if (!view.coordsAtPos) {
			bubbleMenuVisible = false;
			return;
		}

		try {
			const start = view.coordsAtPos(from);
			const end = view.coordsAtPos(to);
			if (!start || !end) {
				bubbleMenuVisible = false;
				return;
			}

			// coordsAtPos returns viewport coordinates; since the bubble menu uses
			// position: fixed, we use viewport coords directly without editorRect.
			const menuWidth = bubbleMenuHost?.offsetWidth ?? 240;
			const menuHeight = bubbleMenuHost?.offsetHeight ?? 40;
			const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;

			const rawTop = start.top - menuHeight - 10;
			const rawLeft = (start.left + end.left) / 2 - menuWidth / 2;

			bubbleMenuPosition = {
				top: Math.max(8, rawTop),
				left: Math.max(8, Math.min(rawLeft, vw - menuWidth - 8)),
			};
			bubbleMenuVisible = true;
		} catch {
			bubbleMenuVisible = false;
		}
	}

	function getSelectedText(): string {
		if (!editor) return '';
		try {
			const { from, to } = editor.state.selection;
			return editor.state.doc.textBetween(from, to, ' ');
		} catch {
			return '';
		}
	}

	function exec(command: () => void): void {
		if (!editor) return;
		command();
		editor.commands.focus();
	}

	function pressed(check: () => boolean): boolean {
		void updateTick;
		return editor ? check() : false;
	}
</script>

<div class="editor-root">
	<div class="editor-page">
		<!-- Editor Canvas -->
		<div bind:this={editorHost} class="editor-host"></div>
	</div>

	<!-- Bubble Menu -->
	<div
		class="bubble-menu"
		class:visible={bubbleMenuVisible && isSelecting}
		style:top="{bubbleMenuPosition.top}px"
		style:left="{bubbleMenuPosition.left}px"
		bind:this={bubbleMenuHost}
		role="toolbar"
		aria-label="Text formatting menu"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				isSelecting = false;
				bubbleMenuVisible = false;
			}
		}}
	>
		<GhostButton
			type="button"
			class={`bubble-btn ${pressed(() => editor!.isActive('bold')) ? 'active' : ''}`}
			onclick={() => exec(() => editor!.chain().focus().toggleBold().run())}
			title="Bold"
			aria-label="Toggle bold"
		>
			<span class="bubble-icon">B</span>
		</GhostButton>
		<GhostButton
			type="button"
			class={`bubble-btn ${pressed(() => editor!.isActive('italic')) ? 'active' : ''}`}
			onclick={() => exec(() => editor!.chain().focus().toggleItalic().run())}
			title="Italic"
			aria-label="Toggle italic"
		>
			<span class="bubble-icon bubble-icon--italic">I</span>
		</GhostButton>
		<GhostButton
			type="button"
			class={`bubble-btn ${pressed(() => editor!.isActive('underline')) ? 'active' : ''}`}
			onclick={() => exec(() => editor!.chain().focus().toggleUnderline().run())}
			title="Underline"
			aria-label="Toggle underline"
		>
			<span class="bubble-icon bubble-icon--underline">U</span>
		</GhostButton>
		<GhostButton
			type="button"
			class={`bubble-btn ${pressed(() => editor!.isActive('strike')) ? 'active' : ''}`}
			onclick={() => exec(() => editor!.chain().focus().toggleStrike().run())}
			title="Strikethrough"
			aria-label="Toggle strikethrough"
		>
			<span class="bubble-icon bubble-icon--strike">S</span>
		</GhostButton>
		<span class="bubble-divider"></span>
		<GhostButton
			type="button"
			class={`bubble-btn ${pressed(() => editor!.isActive('heading', { level: 1 })) ? 'active' : ''}`}
			onclick={() => exec(() => editor!.chain().focus().toggleHeading({ level: 1 }).run())}
			title="Heading 1"
			aria-label="Toggle heading 1"
		>
			<span class="bubble-icon">H1</span>
		</GhostButton>
		<GhostButton
			type="button"
			class={`bubble-btn ${pressed(() => editor!.isActive('heading', { level: 2 })) ? 'active' : ''}`}
			onclick={() => exec(() => editor!.chain().focus().toggleHeading({ level: 2 }).run())}
			title="Heading 2"
			aria-label="Toggle heading 2"
		>
			<span class="bubble-icon">H2</span>
		</GhostButton>
		<GhostButton
			type="button"
			class={`bubble-btn ${pressed(() => editor!.isActive('bulletList')) ? 'active' : ''}`}
			onclick={() => exec(() => editor!.chain().focus().toggleBulletList().run())}
			title="Bullet list"
			aria-label="Toggle bullet list"
		>
			<span class="bubble-icon">•</span>
		</GhostButton>
		<GhostButton
			type="button"
			class={`bubble-btn ${pressed(() => editor!.isActive('blockquote')) ? 'active' : ''}`}
			onclick={() => exec(() => editor!.chain().focus().toggleBlockquote().run())}
			title="Blockquote"
			aria-label="Toggle blockquote"
		>
			<span class="bubble-icon">"</span>
		</GhostButton>
		{#if onAskNova}
			<span class="bubble-divider"></span>
			<GhostButton
				type="button"
				class="bubble-btn bubble-btn--nova"
				onclick={() => {
					const text = getSelectedText();
					if (text) onAskNova(text);
				}}
				title="Ask Nova about this selection"
				aria-label="Ask Nova about selected text"
			>
				<svg class="bubble-nova-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.88 5.76a2 2 0 0 0 1.27 1.27L21 12l-5.85 1.97a2 2 0 0 0-1.27 1.27L12 21l-1.88-5.76a2 2 0 0 0-1.27-1.27L3 12l5.85-1.97a2 2 0 0 0 1.27-1.27L12 3z"/></svg>
				<span class="bubble-nova-label">Nova</span>
			</GhostButton>
		{/if}
	</div>
</div>

<style>
	.editor-root {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		align-items: center;
		padding: 0;
		background: transparent;
		position: relative;
	}

	.editor-page {
		max-width: var(--editor-measure-max);
		width: 100%;
		display: flex;
		flex-direction: column;
		padding-block-start: var(--editor-page-padding-block-start);
		padding-block-end: var(--editor-page-padding-block-end);
		padding-inline: var(--editor-page-padding-inline);
		margin-block: var(--space-8);
		box-sizing: border-box;
		background: var(--editor-page-surface);
		box-shadow: var(--editor-page-shadow);
		border-radius: var(--editor-page-radius);
	}

	.editor-host {
		flex: 1;
		outline: none;
		font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
		font-size: var(--editor-font-size);
		line-height: var(--editor-line-height);
		letter-spacing: 0.005em;
		color: var(--color-text-primary);
		caret-color: var(--color-nova-blue);
	}

	:global(.editor-host .manuscript-canvas) {
		outline: none;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		letter-spacing: inherit;
		color: inherit;
	}

	:global(.editor-host .manuscript-canvas.is-empty div.is-editor-empty:first-child::before) {
		color: var(--color-text-muted);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		opacity: 0.35;
	}

	:global(.editor-host .manuscript-canvas p) {
		margin: 0 0 1.2em;
	}

	:global(.editor-host .manuscript-canvas p:last-child) {
		margin-bottom: 0;
	}

	:global(.editor-host .manuscript-canvas h1),
	:global(.editor-host .manuscript-canvas h2) {
		font-family: var(--font-sans);
		font-weight: 700;
		line-height: 1.3;
		letter-spacing: -0.01em;
		margin: 1.8em 0 0.6em;
		color: var(--color-text-primary);
	}

	:global(.editor-host .manuscript-canvas h1) {
		font-size: 1.8rem;
	}

	:global(.editor-host .manuscript-canvas h2) {
		font-size: 1.4rem;
	}

	:global(.editor-host .manuscript-canvas h1:first-child),
	:global(.editor-host .manuscript-canvas h2:first-child) {
		margin-top: 0;
	}

	:global(.editor-host .manuscript-canvas ul),
	:global(.editor-host .manuscript-canvas ol) {
		margin: 1.2em 0;
		padding-left: 1.8em;
	}

	:global(.editor-host .manuscript-canvas li) {
		margin-bottom: 0.6em;
	}

	:global(.editor-host .manuscript-canvas blockquote) {
		margin: 1.6em 0;
		padding-left: 1.2em;
		border-left: 3px solid var(--color-border-subtle);
		color: var(--color-text-secondary);
		font-style: italic;
	}

	:global(.editor-host .manuscript-canvas strong) {
		font-weight: 600;
	}

	:global(.editor-host .manuscript-canvas em) {
		font-style: italic;
	}

	:global(.editor-host .manuscript-canvas s) {
		text-decoration: line-through;
		opacity: 0.7;
	}

	.bubble-menu {
		position: fixed;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		background: var(--color-surface-base);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		opacity: 0;
		pointer-events: none;
		transform: translateX(-50%);
		z-index: 100;
		transition: opacity var(--duration-base) var(--ease-decelerate);
		backdrop-filter: blur(8px);
	}

	.bubble-menu.visible {
		opacity: 1;
		pointer-events: auto;
	}

	:global(.bubble-btn) {
		appearance: none;
		border: none;
		outline: none;
		background: transparent;
		color: var(--color-text-secondary);
		padding: 0.4rem 0.6rem;
		font-size: 0.85rem;
		font-weight: 500;
		line-height: 1;
		border-radius: 4px;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			transform var(--duration-fast) var(--ease-standard);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.bubble-btn:hover) {
		background: color-mix(in srgb, var(--color-surface-overlay) 72%, transparent);
		color: var(--color-text-primary);
	}

	:global(.bubble-btn:active) {
		transform: scale(0.95);
	}

	:global(.bubble-btn.active) {
		background: color-mix(in srgb, var(--color-nova-blue) 15%, transparent);
		color: var(--color-nova-blue);
		font-weight: 600;
	}

	.bubble-icon {
		font-family: var(--font-sans);
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.bubble-icon--italic {
		font-style: italic;
	}

	.bubble-icon--underline {
		text-decoration: underline;
	}

	.bubble-icon--strike {
		text-decoration: line-through;
	}

	:global(.bubble-btn--nova) {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		color: var(--color-nova-blue) !important;
		opacity: 0.8;
	}

	:global(.bubble-btn--nova:hover) {
		opacity: 1;
		background: color-mix(in srgb, var(--color-nova-blue) 12%, transparent) !important;
	}

	.bubble-nova-icon {
		display: block;
		flex-shrink: 0;
	}

	.bubble-nova-label {
		font-family: var(--font-sans);
		font-size: 0.78rem;
		font-weight: 600;
	}

	.bubble-divider {
		width: 1px;
		height: 1.2rem;
		background: var(--color-border-subtle);
		margin: 0 0.25rem;
	}

	@media (max-width: 720px) {
		.editor-page {
			max-width: 100%;
			margin-block: 0;
			background: transparent;
			box-shadow: none;
			border-radius: 0;
			padding-inline: var(--space-4);
			padding-block-start: var(--space-8);
			padding-block-end: var(--space-6);
		}

		.bubble-menu {
			gap: 0;
			padding: 0.4rem;
		}

		:global(.bubble-btn) {
			padding: 0.35rem 0.5rem;
			font-size: 0.8rem;
		}
	}
</style>
