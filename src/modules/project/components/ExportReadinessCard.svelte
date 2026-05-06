<script lang="ts">
	import { SurfaceCard, SecondaryButton } from '$lib/components/ui/index.js';

	let {
		sceneCount,
		wordCount,
		projectId,
		onExportRequest,
	}: {
		sceneCount: number;
		wordCount: number;
		projectId: string;
		onExportRequest: () => void;
	} = $props();
</script>

<SurfaceCard class="hub-status-card" data-project-id={projectId}>
	<span class="hub-card__label">Export</span>
	<span class="hub-card__value">{wordCount.toLocaleString()} words</span>
	<span class="hub-card__sub">{sceneCount} scene{sceneCount === 1 ? '' : 's'}</span>
	<div class="hub-card__actions">
		<SecondaryButton onclick={onExportRequest}>Export manuscript</SecondaryButton>
	</div>
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
		font-variant-numeric: tabular-nums;
	}

	.hub-card__sub {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.hub-card__actions {
		margin-top: var(--space-3);
	}
</style>
