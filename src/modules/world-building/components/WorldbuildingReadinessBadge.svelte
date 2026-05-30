<script lang="ts">
	interface Props {
		label: string;
		variant: 'first' | 'dependent' | 'ready';
	}

	let { label, variant }: Props = $props();
</script>

<span class="readiness-badge readiness-badge--{variant}" aria-label="Readiness: {label}">
	{label}
</span>

<style>
	.readiness-badge {
		display: inline-flex;
		align-items: center;
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		font-size: 0.625rem;
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		white-space: nowrap;
	}

	.readiness-badge--first {
		background: color-mix(in srgb, var(--color-brass) 18%, transparent);
		color: var(--color-brass);
		border: 1px solid color-mix(in srgb, var(--color-brass) 35%, transparent);
	}

	.readiness-badge--dependent {
		background: color-mix(in srgb, var(--color-text-muted) 10%, transparent);
		color: var(--color-text-muted);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 60%, transparent);
	}

	.readiness-badge--ready {
		background: color-mix(in srgb, var(--color-success) 15%, transparent);
		color: var(--color-success);
		border: 1px solid color-mix(in srgb, var(--color-success) 35%, transparent);
	}
</style>
