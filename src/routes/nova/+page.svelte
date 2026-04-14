<svelte:head>
	<title>Nova — Novellum</title>
</svelte:head>

<div class="surface-stub">
	<div class="surface-stub__icon" aria-hidden="true">★</div>
	<h1 class="surface-stub__title">Nova</h1>
	<p class="surface-stub__description">
		AI assistant for writing, research, and project intelligence — context-aware prompting across
		all your projects.
	</p>
	<span class="surface-stub__badge">Coming soon</span>
</div>

<style>
	.surface-stub {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		text-align: center;
		gap: var(--space-4);
		padding: var(--space-12);
		color: var(--color-text-primary);
	}
	.surface-stub__icon {
		font-size: var(--text-4xl);
		opacity: 0.3;
	}
	.surface-stub__title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		margin: 0;
	}
	.surface-stub__description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		max-width: 400px;
		line-height: var(--leading-relaxed);
		margin: 0;
	}
	.surface-stub__badge {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-3);
		background: var(--color-surface-overlay);
		border-radius: var(--radius-full);
		color: var(--color-text-muted);
	}
</style>
