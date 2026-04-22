<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor as TipTapEditor } from '@tiptap/core';
	import Placeholder from '@tiptap/extension-placeholder';
	import StarterKit from '@tiptap/starter-kit';

	interface Props {
		content: string;
		title: string;
		onContentChange: (html: string) => void;
		onTitleChange?: (title: string) => void;
	}

	let { content, title = '', onContentChange, onTitleChange }: Props = $props();

	let editorHost: HTMLElement;
	let bubbleMenuHost: HTMLElement | null = null;
	let editor: any = null;
	let updateTick = $state(0);
	let isSelecting = $state(false);
	let bubbleMenuVisible = $state(false);
	let bubbleMenuPosition = $state({ top: 0, left: 0 });
	let localTitle = $state('');

	const isReady = $derived(editor !== null);

	onMount(() => {
		editor = new (TipTapEditor as any)({
			element: editorHost,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2] },
					bulletList: { keepMarks: true },
					orderedList: { keepMarks: true },
				}),
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
			},
			onSelectionUpdate: ({ editor: currentEditor }: { editor: any }) => {
				const hasSelection = !currentEditor.state.selection.empty;
				isSelecting = hasSelection;
				if (hasSelection) {
					updateBubbleMenuPosition(currentEditor);
				}
				updateTick += 1;
			},
			editorProps: {
				attributes: {
					class: 'manuscript-canvas',
					spellcheck: 'true',
				},
			},
		});
	});

	onDestroy(() => {
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
		localTitle = title;
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

			const editorRect = editorHost?.getBoundingClientRect();
			if (!editorRect) {
				bubbleMenuVisible = false;
				return;
			}

			const menuRect = bubbleMenuHost?.getBoundingClientRect();
			if (!menuRect) {
				bubbleMenuVisible = false;
				return;
			}

			const top = start.top - editorRect.top - 50;
			const left = (start.left + end.left) / 2 - editorRect.left - menuRect.width / 2;

			bubbleMenuPosition = { top, left };
			bubbleMenuVisible = true;
		} catch (e) {
			bubbleMenuVisible = false;
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

	function canRun(check: () => boolean): boolean {
		void updateTick;
		return editor ? check() : false;
	}

	function handleTitleChange(newTitle: string): void {
		localTitle = newTitle;
		onTitleChange?.(newTitle);
	}
</script>

<div class="editor-root">
	<div class="editor-column">
		<!-- Title Input -->
		<input
			type="text"
			class="title-input"
			placeholder="Title"
			value={localTitle}
			onchange={(e) => handleTitleChange((e.target as HTMLInputElement).value)}
			onkeyup={(e) => {
				const target = e.target as HTMLInputElement;
				if (e.key !== 'Enter') {
					handleTitleChange(target.value);
				}
			}}
			aria-label="Scene title"
		/>

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
		<button
			type="button"
			class="bubble-btn"
			class:active={pressed(() => editor!.isActive('bold'))}
			onclick={() => exec(() => editor!.chain().focus().toggleBold().run())}
			title="Bold"
			aria-label="Toggle bold"
		>
			<span class="bubble-icon">B</span>
		</button>
		<button
			type="button"
			class="bubble-btn"
			class:active={pressed(() => editor!.isActive('italic'))}
			onclick={() => exec(() => editor!.chain().focus().toggleItalic().run())}
			title="Italic"
			aria-label="Toggle italic"
		>
			<span class="bubble-icon">I</span>
		</button>
		<button
			type="button"
			class="bubble-btn"
			class:active={pressed(() => editor!.isActive('strike'))}
			onclick={() => exec(() => editor!.chain().focus().toggleStrike().run())}
			title="Strikethrough"
			aria-label="Toggle strikethrough"
		>
			<span class="bubble-icon">S</span>
		</button>
		<span class="bubble-divider"></span>
		<button
			type="button"
			class="bubble-btn"
			class:active={pressed(() => editor!.isActive('heading', { level: 1 }))}
			onclick={() => exec(() => editor!.chain().focus().toggleHeading({ level: 1 }).run())}
			title="Heading 1"
			aria-label="Toggle heading 1"
		>
			<span class="bubble-icon">H1</span>
		</button>
		<button
			type="button"
			class="bubble-btn"
			class:active={pressed(() => editor!.isActive('heading', { level: 2 }))}
			onclick={() => exec(() => editor!.chain().focus().toggleHeading({ level: 2 }).run())}
			title="Heading 2"
			aria-label="Toggle heading 2"
		>
			<span class="bubble-icon">H2</span>
		</button>
		<button
			type="button"
			class="bubble-btn"
			class:active={pressed(() => editor!.isActive('bulletList'))}
			onclick={() => exec(() => editor!.chain().focus().toggleBulletList().run())}
			title="Bullet list"
			aria-label="Toggle bullet list"
		>
			<span class="bubble-icon">•</span>
		</button>
		<button
			type="button"
			class="bubble-btn"
			class:active={pressed(() => editor!.isActive('blockquote'))}
			onclick={() => exec(() => editor!.chain().focus().toggleBlockquote().run())}
			title="Blockquote"
			aria-label="Toggle blockquote"
		>
			<span class="bubble-icon">"</span>
		</button>
	</div>
</div>

<style>
	.editor-root {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		padding: 0;
		background: transparent;
		position: relative;
	}

	.editor-column {
		max-width: 720px;
		margin: 0 auto;
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: clamp(4rem, 8vw, 6rem) clamp(1rem, 4vw, 3rem) clamp(3rem, 6vw, 4rem);
		box-sizing: border-box;
		background: transparent;
		border: none;
		box-shadow: none;
	}

	.title-input {
		appearance: none;
		border: none;
		outline: none;
		background: transparent;
		font-family: var(--font-sans);
		font-size: clamp(2rem, 5vw, 2.5rem);
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.01em;
		color: var(--color-text-primary);
		margin: 0 0 clamp(2rem, 4vw, 3rem);
		padding: 0;
		width: 100%;
		text-align: left;

		&::placeholder {
			color: var(--color-text-muted);
			opacity: 0.4;
		}

		&:focus {
			outline: none;
		}
	}

	.editor-host {
		flex: 1;
		outline: none;
		font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
		font-size: clamp(1rem, 1vw + 0.9rem, 1.1rem);
		line-height: 1.9;
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

	.bubble-btn {
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

		&:hover {
			background: color-mix(in srgb, var(--color-surface-overlay) 72%, transparent);
			color: var(--color-text-primary);
		}

		&:active {
			transform: scale(0.95);
		}

		&.active {
			background: color-mix(in srgb, var(--color-nova-blue) 15%, transparent);
			color: var(--color-nova-blue);
			font-weight: 600;
		}
	}

	.bubble-icon {
		font-family: var(--font-sans);
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.bubble-divider {
		width: 1px;
		height: 1.2rem;
		background: var(--color-border-subtle);
		margin: 0 0.25rem;
	}

	@media (max-width: 768px) {
		.editor-column {
			padding: clamp(3rem, 6vw, 4rem) clamp(0.75rem, 3vw, 1.5rem) clamp(2rem, 4vw, 3rem);
		}

		.title-input {
			font-size: clamp(1.5rem, 5vw, 2rem);
		}

		.bubble-menu {
			gap: 0;
			padding: 0.4rem;
		}

		.bubble-btn {
			padding: 0.35rem 0.5rem;
			font-size: 0.8rem;
		}
	}
</style>
