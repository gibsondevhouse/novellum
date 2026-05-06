<script lang="ts">
	type Status = 'success' | 'warning' | 'error' | 'info' | 'neutral';

	interface Props {
		status: Status;
		label: string;
		class?: string;
	}

	let { status, label, class: className = '' }: Props = $props();
</script>

<span class="status-badge status-badge--{status} {className}">{label}</span>

<style>
	.status-badge {
		display: inline-flex;
		align-items: center;
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		line-height: 1.5;
		white-space: nowrap;
	}

	.status-badge--success {
		background: color-mix(in srgb, var(--color-success) 15%, transparent);
		color: var(--color-success);
		border: 1px solid color-mix(in srgb, var(--color-success) 30%, transparent);
	}

	.status-badge--warning {
		background: color-mix(in srgb, var(--color-warning) 15%, transparent);
		color: var(--color-warning);
		border: 1px solid color-mix(in srgb, var(--color-warning) 30%, transparent);
	}

	.status-badge--error {
		background: color-mix(in srgb, var(--color-error) 15%, transparent);
		color: var(--color-error);
		border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
	}

	.status-badge--info {
		background: color-mix(in srgb, var(--color-info) 15%, transparent);
		color: var(--color-info);
		border: 1px solid color-mix(in srgb, var(--color-info) 30%, transparent);
	}

	.status-badge--neutral {
		background: color-mix(in srgb, var(--color-text-muted) 15%, transparent);
		color: var(--color-text-muted);
		border: 1px solid color-mix(in srgb, var(--color-text-muted) 30%, transparent);
	}
</style>
