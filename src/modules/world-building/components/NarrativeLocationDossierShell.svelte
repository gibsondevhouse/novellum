<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		eyebrow,
		title,
		copy,
		actions,
		content,
	}: {
		eyebrow: string;
		title: string;
		copy: string;
		actions?: Snippet;
		content?: Snippet;
	} = $props();
</script>

<section class="narrative-location-dossier">
	<div class="dossier-header dossier-header--stacked">
		<div>
			<p class="dossier-eyebrow">{eyebrow}</p>
			<h2 class="dossier-title">{title}</h2>
			<p class="dossier-copy">{copy}</p>
		</div>
		{#if actions}
			<div class="dossier-actions">
				{@render actions()}
			</div>
		{/if}
	</div>

	{@render content?.()}
</section>

<style>
	.narrative-location-dossier {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
		max-width: 920px;
		width: 100%;
		padding: var(--space-6);
		padding-right: var(--space-6);
		overflow-y: auto;
	}

	.dossier-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.dossier-header--stacked {
		align-items: start;
	}

	.dossier-eyebrow,
	.dossier-copy {
		margin: 0;
	}

	.dossier-eyebrow {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.dossier-title {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
	}

	.dossier-copy {
		margin-top: var(--space-2);
		max-width: 70ch;
		color: var(--color-text-secondary);
	}

	.dossier-actions {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	@media (max-width: 768px) {
		.narrative-location-dossier {
			padding-right: 0;
		}
	}
</style>