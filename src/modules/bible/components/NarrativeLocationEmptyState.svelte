<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		note = '',
		actions,
	}: {
		title: string;
		description: string;
		note?: string;
		actions?: Snippet;
	} = $props();
</script>

<div class="narrative-location-empty">
	<h2>{title}</h2>
	<p>{description}</p>
	{#if note}
		<p class="narrative-location-empty__note">{note}</p>
	{/if}
	{#if actions}
		<div class="narrative-location-empty__actions">
			{@render actions()}
		</div>
	{/if}
</div>

<style>
	.narrative-location-empty {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		color: var(--color-text-muted);
		text-align: center;
	}

	.narrative-location-empty h2,
	.narrative-location-empty p {
		margin: 0;
	}

	.narrative-location-empty__note {
		max-width: 48ch;
	}

	.narrative-location-empty__actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
		justify-content: center;
	}
</style>