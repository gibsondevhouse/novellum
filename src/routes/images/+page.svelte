<script lang="ts">
	import ImageGrid from '$modules/assets/components/ImageGrid.svelte';
</script>

<svelte:head>
	<title>Images — Novellum</title>
</svelte:head>

<div class="library-hub">
	<header class="library-header">
		<div class="library-heading">
			<p class="library-eyebrow">Media Gallery</p>
			<h1 class="library-title">Images</h1>
			<p class="library-subtitle">
				Asset library for covers, references, character portraits, and scene visuals — manage and tag
				media across projects.
			</p>
		</div>
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
	</header>
	
	<ImageGrid />
</div>

<style>
	.library-hub {
		max-width: 1100px;
		margin: 0 auto;
		padding: var(--space-8) var(--panel-padding) var(--space-10);
	}

	.library-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.library-heading {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: 560px;
	}

	.library-eyebrow,
	.library-title,
	.library-subtitle {
		margin: 0;
	}

	.library-eyebrow {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.library-title {
		font-family: var(--font-display);
		font-size: var(--text-5xl);
		font-weight: var(--font-weight-normal);
		letter-spacing: var(--tracking-tight);
		color: var(--color-text-primary);
		line-height: 1.1;
		margin: 0;
	}

	.library-subtitle {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
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

		.library-title {
			font-size: var(--text-4xl);
		}
		.library-subtitle {
			font-size: var(--text-sm);
		}
	}
</style>
