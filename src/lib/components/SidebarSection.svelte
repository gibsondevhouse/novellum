<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		children,
	}: {
		label?: string;
		children: Snippet;
	} = $props();
</script>

<div class="sidebar-section">
	{#if label}
		<h3 class="sidebar-section__label">{label}</h3>
	{/if}
	<div class="sidebar-section__content">
		{@render children()}
	</div>
</div>

<style>
	.sidebar-section {
		display: flex;
		flex-direction: column;
		margin-bottom: var(--space-2);
	}

	.sidebar-section__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: var(--space-3) var(--space-3) var(--space-2);
		margin: 0;
		font-weight: var(--font-weight-medium);
	}

	.sidebar-section__content {
		display: flex;
		flex-direction: column;
	}
</style>
