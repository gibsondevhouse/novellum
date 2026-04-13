<script lang="ts">
	import type { Snippet } from 'svelte';

	let { cta, status } = $props<{
		/** Primary action slot — e.g. "Open in Editor" link. Optional: omit for non-actionable items. */
		cta?: Snippet;
		/** Quiet status message — e.g. save state, persistence note. */
		status?: Snippet;
	}>();
</script>

<footer class="ps-footer">
	<div class="footer-cta">
		{#if cta}{@render cta()}{/if}
	</div>
	<div class="footer-status">
		{#if status}{@render status()}{/if}
	</div>
</footer>

<style>
	.ps-footer {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4) var(--space-3) calc(var(--space-4) + 5px);
		border-top: 1px solid var(--color-border-subtle);
		/* Slightly darker footer creates visual status-bar separation */
		background: color-mix(in srgb, var(--color-surface-ground) 30%, var(--color-surface-elevated));
	}

	.footer-cta {
		flex-shrink: 0;
	}

	.footer-status {
		flex-shrink: 0;
		text-align: right;
	}
</style>
