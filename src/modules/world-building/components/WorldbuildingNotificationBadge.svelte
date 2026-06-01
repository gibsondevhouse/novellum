<script lang="ts">
	interface Props {
		count: number;
	}
	let { count }: Props = $props();
</script>

{#if count > 0}
	<span
		class="notification-badge"
		role="status"
		aria-label="{count} proposal{count === 1 ? '' : 's'} pending review"
	>{count}</span>
{/if}

<style>
	.notification-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.125rem;
		height: 1.125rem;
		padding: 0 var(--space-1);
		border-radius: var(--radius-full);
		font-size: 0.625rem;
		font-weight: var(--font-weight-semibold);
		line-height: 1;
		letter-spacing: 0;
		background: color-mix(in srgb, var(--color-brass) 20%, transparent);
		color: var(--color-brass);
		border: 1px solid color-mix(in srgb, var(--color-brass) 40%, transparent);
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}
</style>
