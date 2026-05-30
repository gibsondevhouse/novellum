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

	let showNote = $state(false);
</script>

<div class="narrative-location-empty">
	<h2>{title}</h2>
	<p>{description}</p>
	{#if note}
		<div class="narrative-location-empty__note-row">
			<button
				type="button"
				class="help-toggle"
				aria-expanded={showNote}
				aria-label="Show additional guidance"
				onclick={() => (showNote = !showNote)}
			>?</button>
			{#if showNote}
				<p class="narrative-location-empty__note">{note}</p>
			{/if}
		</div>
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

	.narrative-location-empty__note-row {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
	}

	.narrative-location-empty__note {
		max-width: 48ch;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
	}

	.narrative-location-empty__actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
		justify-content: center;
	}

	.help-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-5);
		height: var(--space-5);
		border-radius: 50%;
		border: 1px solid var(--color-border-subtle);
		background: transparent;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.help-toggle:hover {
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
	}
</style>
