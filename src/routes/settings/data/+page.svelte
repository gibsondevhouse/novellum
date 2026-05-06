<svelte:head>
	<title>Data — Novellum</title>
</svelte:head>

<section class="settings-section" aria-labelledby="data-portability-heading">
	<h2 id="data-portability-heading" class="section-title">Data Portability</h2>
	<p class="section-description">
		Migrate any legacy in-browser data into the canonical SQLite database, or
		review the migration status.
	</p>
	<a class="section-link" href="/settings/migrate">Open Migration Tool →</a>
</section>

<style>
	.settings-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-5);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, transparent);
	}

	.section-title {
		margin: 0;
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.section-description {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}

	.section-link {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		text-decoration: none;
		margin-top: var(--space-2);
	}

	.section-link:hover {
		text-decoration: underline;
	}
</style>
