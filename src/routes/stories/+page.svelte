<svelte:head>
	<title>Stories — Novellum</title>
</svelte:head>

<div class="coming-soon-hub">
	<header class="cs-header">
		<h1 class="cs-title">Stories</h1>
		<p class="cs-subtitle">
			Short-form narratives, serialised fiction, and single-scene pieces — optimised for brevity and
			craft.
		</p>
	</header>

	<div class="cs-badge-row" aria-hidden="true">
		<span class="cs-badge">Short Stories</span>
		<span class="cs-badge">Flash Fiction</span>
		<span class="cs-badge">Serials</span>
		<span class="cs-badge">Scene Collections</span>
		<span class="cs-badge">Drafts</span>
	</div>
</div>

<style>
	.coming-soon-hub {
		max-width: 960px;
		margin: 0 auto;
		padding: var(--space-10) var(--panel-padding) var(--space-8);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - var(--space-16));
		text-align: center;
	}

	.cs-header {
		max-width: 520px;
		margin-bottom: var(--space-8);
	}

	.cs-title {
		font-family: var(--font-display);
		font-size: var(--text-5xl);
		font-weight: var(--font-weight-normal);
		letter-spacing: var(--tracking-tight);
		color: var(--color-text-primary);
		line-height: 1.1;
		margin: 0 0 var(--space-4);
	}

	.cs-subtitle {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
	}

	.cs-badge-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		justify-content: center;
	}

	.cs-badge {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-full);
		padding: var(--space-1) var(--space-3);
	}
</style>
