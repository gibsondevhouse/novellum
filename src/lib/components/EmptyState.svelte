<script lang="ts">
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let {
		title,
		description,
		actionLabel,
		onAction,
	}: {
		title: string;
		description?: string;
		actionLabel?: string;
		onAction?: () => void;
	} = $props();
</script>

<div class="empty-state">
	<h3 class="empty-state__title">{title}</h3>
	{#if description}
		<p class="empty-state__description">{description}</p>
	{/if}
	{#if actionLabel && onAction}
		<div class="empty-state__action">
			<GhostButton onclick={onAction}>{actionLabel}</GhostButton>
		</div>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: var(--space-8) var(--space-4);
		gap: var(--space-3);
	}

	.empty-state__title {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.empty-state__description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
		max-width: 32rem;
		line-height: var(--line-height-relaxed);
	}

	.empty-state__action {
		margin-top: var(--space-2);
	}
</style>
