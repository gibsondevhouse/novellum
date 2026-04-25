<script lang="ts">
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	let { synopsis, onEdit }: { synopsis: string; onEdit: () => void } = $props();
</script>

{#if synopsis}
	<p class="hero-synopsis">{synopsis}</p>
{:else}
	<GhostButton class="hero-synopsis-empty" type="button" onclick={onEdit}>Add a synopsis</GhostButton>
{/if}

<style>
	.hero-synopsis {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
		margin: 0;
	}
	:global(.hero-synopsis-empty) {
		display: block;
		background: none;
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-md);
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-sm);
		font-style: italic;
		color: var(--color-text-muted);
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition:
			color var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard),
			background-color var(--duration-base) var(--ease-standard);
	}
	:global(.hero-synopsis-empty:hover) {
		color: var(--color-text-secondary);
		border-color: var(--color-border-strong);
		background: var(--color-surface-overlay);
	}
	:global(.hero-synopsis-empty:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
