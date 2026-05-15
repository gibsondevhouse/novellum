<script lang="ts">
	import { renderSettingsDocument } from '$lib/settings/document-markdown.js';

	let {
		content,
		label,
	}: {
		content: string;
		label: string;
	} = $props();

	const rendered = $derived(renderSettingsDocument(content));
</script>

<article class="settings-markdown" aria-label={label}>
	<!-- HTML is produced by our constrained markdown renderer and sanitized in $lib/settings/document-markdown.ts -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="settings-markdown__content">{@html rendered}</div>
</article>

<style>
	.settings-markdown {
		font: var(--font-body-sm);
		color: var(--color-text-primary);
	}

	.settings-markdown__content {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.settings-markdown__content :global(h1),
	.settings-markdown__content :global(h2),
	.settings-markdown__content :global(h3),
	.settings-markdown__content :global(h4) {
		margin: var(--space-2) 0 0;
		font: var(--font-label-lg);
		color: var(--color-text-primary);
	}

	.settings-markdown__content :global(p) {
		margin: 0;
		color: var(--color-text-primary);
	}

	.settings-markdown__content :global(ul),
	.settings-markdown__content :global(ol) {
		margin: 0;
		padding-left: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.settings-markdown__content :global(li) {
		color: var(--color-text-primary);
	}

	.settings-markdown__content :global(a) {
		color: var(--color-link);
		text-underline-offset: 2px;
	}

	.settings-markdown__content :global(a:focus-visible) {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
		border-radius: var(--radius-xs);
	}

	.settings-markdown__content :global(pre) {
		margin: 0;
		padding: var(--space-3);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		overflow-x: auto;
	}

	.settings-markdown__content :global(code) {
		font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
		font-size: 0.9em;
	}
</style>
