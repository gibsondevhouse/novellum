<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	interface Props {
		initialContent: string;
		onContentChange: (html: string) => void;
	}

	let { initialContent, onContentChange }: Props = $props();

	let editorElement: HTMLElement;
	let editor: Editor;

	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: [StarterKit],
			content: initialContent,
			onTransaction: () => {
				onContentChange(editor.getHTML());
			},
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});
</script>

<div class="editor-container">
	<div bind:this={editorElement} class="prose-editor"></div>
</div>

<style>
	.editor-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
		background-color: var(--color-surface-raised);
	}

	.prose-editor {
		flex: 1;
		max-width: var(--prose-width-max);
		width: 100%;
		margin: 0 auto;
		padding: var(--space-10) var(--prose-inset);
	}

	:global(.prose-editor .ProseMirror) {
		outline: none;
		min-height: 60vh;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		color: var(--color-text-primary);
		caret-color: var(--color-nova-blue);
	}

	:global(.prose-editor .ProseMirror p) {
		margin-bottom: var(--prose-gap-line);
	}

	:global(.prose-editor .ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: var(--color-text-muted);
		pointer-events: none;
		height: 0;
	}
</style>
