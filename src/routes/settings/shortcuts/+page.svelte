<svelte:head>
	<title>Shortcuts — Novellum</title>
</svelte:head>

<section class="placeholder" aria-labelledby="shortcuts-heading">
	<h2 id="shortcuts-heading">Shortcuts</h2>
	<p>Coming in stage-004.</p>
</section>

<style>
	.placeholder {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-5);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, transparent);
	}

	.placeholder h2 {
		margin: 0;
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.placeholder p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}
</style>
