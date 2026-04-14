<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Arcs — Novellum</title>
</svelte:head>

<div class="coming-soon">
	<div class="coming-soon__content">
		<span class="coming-soon__eyebrow">Story Arcs</span>
		<h1 class="coming-soon__title">Arc Planner</h1>
		<p class="coming-soon__body">
			The arc development workspace will be available in a future update.
		</p>
		<a class="coming-soon__back" href="/projects/{page.params.id}/workspace">
			← Back to Workspace
		</a>
	</div>
</div>

<style>
	.coming-soon {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: var(--space-8);
	}

	.coming-soon__content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		text-align: center;
		max-width: 420px;
	}

	.coming-soon__eyebrow {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-nova-blue);
		opacity: 0.7;
	}

	.coming-soon__title {
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.coming-soon__body {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
	}

	.coming-soon__back {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		text-decoration: none;
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		transition:
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
		margin-top: var(--space-2);
	}

	.coming-soon__back:hover {
		color: var(--color-text-primary);
		border-color: var(--color-border-strong);
	}

	.coming-soon__back:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
