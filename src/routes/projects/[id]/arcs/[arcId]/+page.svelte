<script lang="ts">
	import { page } from '$app/state';

	const arcLabel = $derived((page.params.arcId || 'arc').replace(/[-_]+/g, ' '));
</script>

<svelte:head>
	<title>Arc Workspace — Novellum</title>
</svelte:head>

<div class="future-shell">
	<section class="future-hero" aria-labelledby="arc-detail-title">
		<p class="future-eyebrow">Arc Workspace</p>
		<h1 id="arc-detail-title">{arcLabel}</h1>
		<p>
			This arc workspace is being prepared. Continue refining thread records and continuity signals while planner controls are finalized.
		</p>
		<div class="future-actions">
			<a class="future-primary" href="/projects/{page.params.id}/world-building/plot-threads">Back to Threads</a>
			<a class="future-secondary" href="/projects/{page.params.id}/continuity">Open Continuity</a>
		</div>
	</section>
</div>

<style>
	.future-shell {
		padding: var(--space-6) 0 var(--space-10);
	}

	.future-hero {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-6);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		background:
			radial-gradient(circle at 80% 24%, color-mix(in srgb, var(--color-teal) 14%, transparent), transparent 42%),
			linear-gradient(165deg, var(--color-surface-overlay), var(--color-surface-ground));
	}

	.future-eyebrow,
	.future-hero h1,
	.future-hero p {
		margin: 0;
	}

	.future-eyebrow {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
	}

	.future-hero h1 {
		font-size: clamp(1.4rem, 1.6vw + 1rem, 2rem);
		text-transform: capitalize;
	}

	.future-hero p {
		max-width: 60ch;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	.future-actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.future-primary,
	.future-secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.25rem;
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

	.future-primary:focus-visible,
	.future-secondary:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
