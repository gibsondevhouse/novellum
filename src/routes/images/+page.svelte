<script lang="ts">
	import ImageGrid from '$modules/assets/components/ImageGrid.svelte';
	import { PageHeader } from '$lib/components/ui/index.js';
</script>

<svelte:head>
	<title>Images — Novellum</title>
</svelte:head>

<div class="library-hub">
	<PageHeader
		eyebrow="Media Gallery"
		title="Images"
		description="Asset library for covers, references, character portraits, and scene visuals - manage and tag media across projects."
	>
		{#snippet meta()}
			<div class="library-summary" aria-label="Gallery summary">
				<div class="library-summary__card">
					<span>Use Cases</span>
					<strong>Covers, references, portraits</strong>
				</div>
				<div class="library-summary__card">
					<span>Workflows</span>
					<strong>Inspect, assign, remove</strong>
				</div>
			</div>
		{/snippet}
	</PageHeader>
	
	<ImageGrid />
</div>

<style>
	.library-hub {
		max-width: 1100px;
		margin: 0 auto;
		padding: var(--space-8) 0 var(--space-10);
	}

	.library-hub :global(.page-header) {
		margin-bottom: var(--space-8);
	}

	.library-summary {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
		min-width: 22rem;
	}

	.library-summary__card {
		display: grid;
		gap: 0.2rem;
		padding: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-overlay) 82%, transparent);
	}

	.library-summary__card span {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.library-summary__card strong {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	@media (max-width: 640px) {
		.library-summary {
			grid-template-columns: 1fr;
			min-width: 0;
			width: 100%;
		}
	}
</style>
