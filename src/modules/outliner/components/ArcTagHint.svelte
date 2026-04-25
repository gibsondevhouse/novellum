<script lang="ts">
	import { GhostButton } from '$lib/components/ui/index.js';
	import type { ArcRef } from '$lib/db/types.js';

	let { arcRefs, onAddRef } = $props<{
		arcRefs?: ArcRef[];
		onAddRef?: () => void;
	}>();

	const hasRefs = $derived(arcRefs !== undefined && arcRefs.length > 0);
</script>

<div class="arc-tag-hint">
	{#if hasRefs && arcRefs}
		<div class="arc-pills" role="list" aria-label="Arc tags">
			{#each arcRefs as ref (ref.arcId)}
				<span class="arc-pill" role="listitem">{ref.arcLabel ?? ref.arcId}</span>
			{/each}
		</div>
	{:else}
		<GhostButton class="hint-btn" onclick={onAddRef} aria-label="Add arc tag" type="button">
			+ Add arc tag
		</GhostButton>
	{/if}
</div>

<style>
	.arc-tag-hint {
		margin-top: var(--space-3);
	}

	.arc-pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.arc-pill {
		display: inline-flex;
		align-items: center;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-nova-blue) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-nova-blue) 30%, transparent);
		border-radius: var(--radius-full, 9999px);
		padding: 1px var(--space-2);
	}

	:global(.hint-btn) {
		border: 1px dashed var(--color-border-subtle);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-family: inherit;
		padding: var(--space-1) var(--space-2);
		transition:
			border-color 0.1s,
			color 0.1s;
	}

	:global(.hint-btn:hover) {
		border-color: var(--color-border-default);
		color: var(--color-text-secondary);
	}

	:global(.hint-btn:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
