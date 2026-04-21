<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Arcs — Novellum</title>
</svelte:head>

<div class="future-shell">
	<section class="future-hero" aria-labelledby="arc-future-title">
		<p class="future-eyebrow">Story Arcs</p>
		<h1 id="arc-future-title">Arc Planner is entering production</h1>
		<p>
			The upcoming arc workspace will unify major arcs, supporting movements, and outcome checkpoints into one planning board.
		</p>
		<div class="future-actions">
			<a class="future-primary" href="/projects/{page.params.id}/world-building/plot-threads">Open Plot Threads</a>
			<a class="future-secondary" href="/projects/{page.params.id}/continuity">Open Continuity</a>
		</div>
	</section>

	<section class="future-grid" aria-label="Arc planner roadmap">
		<article class="future-card">
			<h2>Arc Milestones</h2>
			<p>Plan phase transitions, reversals, and impact checkpoints with timeline ties.</p>
		</article>
		<article class="future-card">
			<h2>Conflict Threads</h2>
			<p>Relate protagonist intent, opposition pressure, and unresolved cost over time.</p>
		</article>
		<article class="future-card">
			<h2>Outcome Tracking</h2>
			<p>Mark completion state and continuity impact before locking new canon.</p>
		</article>
	</section>
</div>

<style>
	.future-shell {
		display: grid;
		gap: var(--space-6);
		padding: var(--space-6) 0 var(--space-10);
	}

	.future-hero {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-6);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		background:
			radial-gradient(circle at 15% 18%, color-mix(in srgb, var(--color-nova-blue) 16%, transparent), transparent 42%),
			linear-gradient(165deg, var(--color-surface-overlay), var(--color-surface-ground));
	}

	.future-eyebrow,
	.future-hero h1,
	.future-hero p,
	.future-card h2,
	.future-card p {
		margin: 0;
	}

	.future-eyebrow {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
	}

	.future-hero h1 {
		font-size: clamp(1.6rem, 2vw + 1rem, 2.25rem);
	}

	.future-hero p {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		max-width: 62ch;
	}

	.future-actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.future-primary,
	.future-secondary {
		font-size: var(--text-sm);
		text-decoration: none;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		transition: background-color var(--duration-fast) var(--ease-standard);
	}

	.future-primary {
		color: var(--color-text-primary);
		border: 1px solid color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-nova-blue) 18%, transparent);
	}

	.future-secondary {
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, transparent);
	}

	.future-primary:hover,
	.future-secondary:hover {
		background: color-mix(in srgb, var(--color-nova-blue) 26%, transparent);
		color: var(--color-text-primary);
	}

	.future-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-4);
	}

	.future-card {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-5);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-overlay) 78%, transparent);
	}

	.future-card p {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	@media (max-width: 900px) {
		.future-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
