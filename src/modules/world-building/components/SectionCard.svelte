<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SurfacePanel } from '$lib/components/ui/index.js';

	interface Props {
		title?: string;
		children?: Snippet;
	}

	let { title = '', children }: Props = $props();
</script>

<SurfacePanel class="section-card">
	{#if title}
		<h3 class="section-title">{title}</h3>
	{/if}
	<div class="section-content">
		{#if children}
			{@render children()}
		{/if}
	</div>
</SurfacePanel>

<style>
	:global(.section-card) {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-overlay) 40%, transparent);
	}

	.section-title {
		margin: 0;
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.section-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
