<script lang="ts">
	import ImageGrid from '$modules/assets/components/ImageGrid.svelte';
</script>

<svelte:head>
	<title>Images — Novellum</title>
</svelte:head>

<div class="library-hub">
	<header class="library-header">
		<div class="library-heading">
			<h1 class="library-title">Images</h1>
			<p class="library-subtitle">
				Asset library for covers, references, character portraits, and scene visuals — manage and tag
				media across projects.
			</p>
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

	@media (max-width: 640px) {
		.library-title {
			font-size: var(--text-4xl);
		}
		.library-subtitle {
			font-size: var(--text-sm);
		}
	}
</style>
