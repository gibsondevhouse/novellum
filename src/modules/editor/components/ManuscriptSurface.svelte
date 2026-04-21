<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor as TipTapEditor } from '@tiptap/core';
	import Placeholder from '@tiptap/extension-placeholder';
	import StarterKit from '@tiptap/starter-kit';

	interface Props {
		content: string;
		onContentChange: (html: string) => void;
	}

	let { content, onContentChange }: Props = $props();

	let editorHost: HTMLElement;
	let editor: any = null;
	let updateTick = $state(0);

	const isReady = $derived(editor !== null);

	onMount(() => {
		editor = new (TipTapEditor as any)({
			element: editorHost,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2, 3] },
				}),
				Placeholder.configure({
					placeholder: 'Draft the scene as it unfolds on the page...',
				}),
			],
			content,
			onUpdate: ({ editor: currentEditor }: { editor: any }) => {
				onContentChange(currentEditor.getHTML());
				updateTick += 1;
			},
			onSelectionUpdate: () => {
				updateTick += 1;
			},
			editorProps: {
				attributes: {
					class: 'manuscript-canvas',
				},
			},
		});
		updateTick += 1;
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
</script>

<div class="surface-shell">
	<div class="toolbar-wrap">
		<div class="format-toolbar" role="toolbar" aria-label="Manuscript formatting toolbar">
			<button
				type="button"
				class="tool-btn"
				class:active={pressed(() => editor!.isActive('paragraph'))}
				onclick={() => exec(() => editor!.chain().focus().setParagraph().run())}
			>
				Paragraph
			</button>
			<button
				type="button"
				class="tool-btn"
				class:active={pressed(() => editor!.isActive('heading', { level: 1 }))}
				onclick={() => exec(() => editor!.chain().focus().toggleHeading({ level: 1 }).run())}
			>
				H1
			</button>
			<button
				type="button"
				class="tool-btn"
				class:active={pressed(() => editor!.isActive('heading', { level: 2 }))}
				onclick={() => exec(() => editor!.chain().focus().toggleHeading({ level: 2 }).run())}
			>
				H2
			</button>
			<button
				type="button"
				class="tool-btn"
				class:active={pressed(() => editor!.isActive('bold'))}
				onclick={() => exec(() => editor!.chain().focus().toggleBold().run())}
			>
				Bold
			</button>
			<button
				type="button"
				class="tool-btn"
				class:active={pressed(() => editor!.isActive('italic'))}
				onclick={() => exec(() => editor!.chain().focus().toggleItalic().run())}
			>
				Italic
			</button>
			<button
				type="button"
				class="tool-btn"
				class:active={pressed(() => editor!.isActive('underline'))}
				onclick={() => exec(() => editor!.chain().focus().toggleUnderline().run())}
			>
				Underline
			</button>
			<button
				type="button"
				class="tool-btn"
				class:active={pressed(() => editor!.isActive('strike'))}
				onclick={() => exec(() => editor!.chain().focus().toggleStrike().run())}
			>
				Strike
			</button>
			<button
				type="button"
				class="tool-btn"
				class:active={pressed(() => editor!.isActive('bulletList'))}
				onclick={() => exec(() => editor!.chain().focus().toggleBulletList().run())}
			>
				Bullets
			</button>
			<button
				type="button"
				class="tool-btn"
				class:active={pressed(() => editor!.isActive('orderedList'))}
				onclick={() => exec(() => editor!.chain().focus().toggleOrderedList().run())}
			>
				Numbered
			</button>
			<button
				type="button"
				class="tool-btn"
				class:active={pressed(() => editor!.isActive('blockquote'))}
				onclick={() => exec(() => editor!.chain().focus().toggleBlockquote().run())}
			>
				Quote
			</button>
			<span class="toolbar-divider" aria-hidden="true"></span>
			<button
				type="button"
				class="tool-btn"
				disabled={!canRun(() => editor!.can().chain().focus().undo().run())}
				onclick={() => exec(() => editor!.chain().focus().undo().run())}
			>
				Undo
			</button>
			<button
				type="button"
				class="tool-btn"
				disabled={!canRun(() => editor!.can().chain().focus().redo().run())}
				onclick={() => exec(() => editor!.chain().focus().redo().run())}
			>
				Redo
			</button>
		</div>
	</div>

	<div class="canvas-wrap" class:ready={isReady}>
		<div class="canvas-column">
			<div bind:this={editorHost} class="editor-host"></div>
		</div>
	</div>
</div>

<style>
	.surface-shell {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
	}

	.toolbar-wrap {
		padding: var(--space-2) var(--space-4);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
		background: color-mix(in srgb, var(--color-surface-ground) 92%, transparent);
	}

	.format-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		align-items: center;
	}

	.tool-btn {
		border: 1px solid transparent;
		background: transparent;
		color: var(--color-text-secondary);
		padding: 0.3rem 0.52rem;
		font-size: var(--text-xs);
		line-height: 1.2;
		border-radius: var(--radius-sm);
		cursor: pointer;
	}

	.tool-btn:hover:not(:disabled),
	.tool-btn:focus-visible {
		outline: none;
		background: color-mix(in srgb, var(--color-surface-overlay) 72%, transparent);
		color: var(--color-text-primary);
	}

	.tool-btn.active {
		border-color: color-mix(in srgb, var(--color-border-default) 80%, transparent);
		background: color-mix(in srgb, var(--color-surface-overlay) 90%, transparent);
		color: var(--color-text-primary);
	}

	.tool-btn:disabled {
		opacity: 0.38;
		cursor: not-allowed;
	}

	.toolbar-divider {
		width: 1px;
		height: 1rem;
		background: color-mix(in srgb, var(--color-border-subtle) 90%, transparent);
		margin: 0 var(--space-1);
	}

	.canvas-wrap {
		flex: 1;
		min-height: 0;
		overflow: auto;
		padding: clamp(1rem, 2vw, 2rem);
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--color-surface-ground) 70%, transparent), transparent 28%),
			radial-gradient(circle at 50% -20%, color-mix(in srgb, var(--color-surface-overlay) 55%, transparent), transparent 68%);
	}

	.canvas-column {
		max-width: min(900px, 100%);
		margin: 0 auto;
		background: color-mix(in srgb, var(--color-surface-ground) 96%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
		border-radius: calc(var(--radius-lg) + 0.2rem);
		box-shadow: var(--shadow-xs);
	}

	.editor-host {
		padding: clamp(1.2rem, 2vw, 2.5rem);
		min-height: max(62vh, 460px);
	}

	:global(.editor-host .manuscript-canvas) {
		outline: none;
		font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
		font-size: clamp(1rem, 0.95rem + 0.2vw, 1.08rem);
		line-height: 1.8;
		letter-spacing: 0.01em;
		color: var(--color-text-primary);
		caret-color: var(--color-nova-blue);
	}

	:global(.editor-host .manuscript-canvas > * + *) {
		margin-top: 0.95em;
	}

	:global(.editor-host .manuscript-canvas h1),
	:global(.editor-host .manuscript-canvas h2),
	:global(.editor-host .manuscript-canvas h3) {
		font-family: var(--font-sans);
		line-height: 1.25;
		margin-top: 1.35em;
		margin-bottom: 0.45em;
		color: color-mix(in srgb, var(--color-text-primary) 94%, black);
	}

	:global(.editor-host .manuscript-canvas h1) {
		font-size: 1.5rem;
	}

	:global(.editor-host .manuscript-canvas h2) {
		font-size: 1.3rem;
	}

	:global(.editor-host .manuscript-canvas h3) {
		font-size: 1.15rem;
	}

	:global(.editor-host .manuscript-canvas ul),
	:global(.editor-host .manuscript-canvas ol) {
		padding-left: 1.4rem;
	}

	:global(.editor-host .manuscript-canvas blockquote) {
		margin: 1.2rem 0;
		padding-left: 1rem;
		border-left: 2px solid color-mix(in srgb, var(--color-border-default) 85%, transparent);
		color: var(--color-text-secondary);
	}

	:global(.editor-host .manuscript-canvas hr) {
		border: none;
		height: 1px;
		margin: 1.4rem 0;
		background: color-mix(in srgb, var(--color-border-default) 90%, transparent);
	}

	:global(.editor-host .manuscript-canvas p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: var(--color-text-muted);
		pointer-events: none;
		height: 0;
		font-style: italic;
	}

	@media (max-width: 900px) {
		.toolbar-wrap {
			padding-inline: var(--space-3);
		}

		.tool-btn {
			font-size: 11px;
		}

		.canvas-wrap {
			padding: var(--space-3);
		}

		.editor-host {
			padding: var(--space-4);
		}
	}
</style>
