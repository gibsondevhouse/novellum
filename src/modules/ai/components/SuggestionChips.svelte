<script lang="ts">
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	interface Suggestion {
		label: string;
		prompt: string;
	}

	let {
		label = 'Try Nova',
		suggestions,
		onselect,
	}: {
		label?: string;
		suggestions: Suggestion[];
		onselect?: (prompt: string) => void;
	} = $props();
</script>

<div class="suggestion-row">
	<span class="suggestion-row__label">
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
		</svg>
		{label}
	</span>
	<div class="suggestion-row__chips">
		{#each suggestions as s (s.label)}
			<GhostButton class="suggestion-chip" type="button" onclick={() => onselect?.(s.prompt)}>
				{s.label}
			</GhostButton>
		{/each}
	</div>
</div>

<style>
	.suggestion-row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		justify-content: space-between;
		padding: var(--space-4) var(--space-1);
		border-top: 1px solid var(--color-border-subtle);
		margin-top: var(--space-3);
	}

	.suggestion-row__label {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: 12px;
		color: var(--color-text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.suggestion-row__chips {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	:global(.suggestion-chip) {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-subtle);
		background-color: var(--color-ai-tint);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		cursor: pointer;
		white-space: nowrap;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	:global(.suggestion-chip:hover) {
		background-color: color-mix(in srgb, var(--color-teal) 10%, transparent);
		border-color: var(--color-teal);
		color: var(--color-text-primary);
	}

	:global(.suggestion-chip:focus-visible) {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}
</style>
