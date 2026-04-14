<script lang="ts">
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
			<button class="suggestion-chip" onclick={() => onselect?.(s.prompt)}>
				{s.label}
			</button>
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
		border-top: 1px solid rgba(255, 255, 255, 0.075);
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

	.suggestion-chip {
		padding: 6px 12px 6px 8px;
		border-radius: 6px;
		border: none;
		background-color: rgba(163, 152, 217, 0.05);
		color: var(--color-text-primary);
		font-size: 11px;
		cursor: pointer;
		white-space: nowrap;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.suggestion-chip:hover {
		background-color: rgba(163, 152, 217, 0.12);
		color: var(--color-text-on-dark);
	}

	.suggestion-chip:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}
</style>
