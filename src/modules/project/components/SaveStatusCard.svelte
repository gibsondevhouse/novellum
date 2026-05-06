<script lang="ts">
	import { SurfaceCard } from '$lib/components/ui/index.js';
	import { formatRelative } from '../utils/format-relative.js';

	let {
		lastSavedAt,
	}: {
		lastSavedAt: string | null;
	} = $props();

	const relativeTime = $derived(formatRelative(lastSavedAt));
	const notYetSaved = $derived(lastSavedAt === null);
</script>

<SurfaceCard class="hub-status-card">
	<span class="hub-card__label">Last Saved</span>
	{#if notYetSaved}
		<span class="hub-card__value hub-card__value--muted">Not yet saved</span>
	{:else}
		<span class="hub-card__value">{relativeTime}</span>
	{/if}
</SurfaceCard>

<style>
	:global(.hub-status-card) {
		display: flex !important;
		flex-direction: column !important;
		gap: var(--space-2) !important;
		padding: var(--space-6) !important;
	}

	.hub-card__label {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.hub-card__value {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		line-height: 1.2;
	}

	.hub-card__value--muted {
		color: var(--color-text-muted);
	}
</style>
