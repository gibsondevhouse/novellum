<script lang="ts">
	interface Props {
		name: string;
		description: string;
	}
	const { name, description }: Props = $props();
</script>

<div class="coming-soon-card" role="region" aria-label="{name} — coming soon">
	<div class="coming-soon-header">
		<h3 class="coming-soon-name">{name}</h3>
		<span class="badge-soon">Coming soon</span>
	</div>
	<p class="coming-soon-desc">{description}</p>
</div>

<style>
	.coming-soon-card {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: var(--space-6);
		max-width: 600px;
		background: var(--color-surface-ground);
	}
	.coming-soon-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-2);
	}
	.coming-soon-name {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		margin: 0;
	}
	.badge-soon {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		background: var(--color-surface-overlay);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}
	.coming-soon-desc {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
