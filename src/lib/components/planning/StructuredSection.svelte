<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, hint, children } = $props<{
		/** Uppercase section label. Rendered with reduced emphasis. */
		label?: string;
		/** Optional helper sentence below the label. */
		hint?: string;
		children: Snippet;
	}>();
</script>

<div class="structured-section">
	{#if label}
		<span class="section-label">{label}</span>
	{/if}
	{#if hint}
		<p class="section-hint">{hint}</p>
	{/if}
	<div class="section-body">
		{@render children()}
	</div>
</div>

<style>
	.structured-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.section-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
	}

	.section-hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
		opacity: 0.8;
	}

	.section-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
