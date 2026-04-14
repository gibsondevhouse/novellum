<script lang="ts">
	let {
		label,
		count,
		ready,
		statusLine,
		href,
	}: {
		label: string;
		count: number;
		ready: boolean;
		statusLine?: string;
		href?: string;
	} = $props();
</script>

{#if href}
	<a class="metric-card metric-card--link" {href}>
		<span class="metric-label">{label}</span>
		<span class="metric-count">{ready ? count : '–'}</span>
		{#if statusLine}<span class="metric-status">{statusLine}</span>{/if}
	</a>
{:else}
	<div class="metric-card">
		<span class="metric-label">{label}</span>
		<span class="metric-count">{ready ? count : '–'}</span>
		{#if statusLine}<span class="metric-status">{statusLine}</span>{/if}
	</div>
{/if}

<style>
	.metric-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-6);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		text-decoration: none;
	}
	.metric-card--link {
		cursor: pointer;
		transition: background-color var(--duration-base) var(--ease-standard);
	}
	.metric-card--link:hover {
		background: var(--color-surface-elevated);
		text-decoration: none;
	}
	.metric-card--link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
	.metric-label {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.5;
	}
	.metric-count {
		font-family: var(--font-display);
		font-size: var(--text-5xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		line-height: 1;
	}
	.metric-status {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		opacity: 0.6;
	}
</style>
