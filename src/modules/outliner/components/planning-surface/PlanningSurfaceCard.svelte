<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children } = $props<{ label: string; children: Snippet }>();
</script>

<section class="surface-card" aria-label={label}>
	<div class="card-label">{label}</div>
	<div class="card-content">
		{@render children()}
	</div>
</section>

<style>
	.surface-card {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.card-label {
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.card-content {
		padding: var(--space-3) var(--space-3);
	}
</style>
