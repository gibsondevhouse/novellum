<script lang="ts">
	import ThemeSelector from '$modules/settings/components/ThemeSelector.svelte';
</script>

<svelte:head>
	<title>Styles — Novellum</title>
</svelte:head>

<div class="styles-page">
	<div class="styles-header">
		<span class="styles-header__icon" aria-hidden="true">🎨</span>
		<h1 class="styles-header__title">Styles & Settings</h1>
		<p class="styles-header__description">
			Configure your workspace appearance.
		</p>
	</div>

	<div class="styles-content">
		<ThemeSelector />
	</div>
</div>

<style>
	.styles-page {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
	}

	.styles-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-4);
	}

	.styles-header__icon {
		font-size: var(--text-4xl);
	}

	.styles-header__title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		margin: 0;
	}

	.styles-header__description {
		font-size: var(--text-base);
		color: var(--color-text-secondary);
		max-width: 500px;
		margin: 0;
	}

	.styles-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}
</style>
