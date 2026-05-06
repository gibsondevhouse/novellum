<script lang="ts">
	import { SurfaceCard, GhostButton } from '$lib/components/ui/index.js';

	let {
		apiKeyConfigured,
	}: {
		apiKeyConfigured: boolean;
	} = $props();
</script>

<SurfaceCard class="hub-status-card">
	<span class="hub-card__label">AI Status</span>
	{#if apiKeyConfigured}
		<span class="hub-card__value hub-card__value--ready">AI ready</span>
	{:else}
		<span class="hub-card__value hub-card__value--warn">No AI key configured</span>
		<div class="hub-card__actions">
			<GhostButton href="/settings/ai">Configure AI key</GhostButton>
		</div>
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

	.hub-card__value--ready {
		color: var(--color-success, var(--color-text-primary));
	}

	.hub-card__value--warn {
		color: var(--color-warning, var(--color-text-secondary));
	}

	.hub-card__actions {
		margin-top: var(--space-3);
	}
</style>
