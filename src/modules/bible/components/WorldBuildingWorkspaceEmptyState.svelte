<script lang="ts">
	import { PrimaryButton } from '$lib/components/ui/index.js';

	let {
		title = 'No records yet.',
		description,
		actionLabel,
		onAction,
	}: {
		title?: string;
		description: string;
		actionLabel?: string;
		onAction?: (() => void | Promise<void>) | null;
	} = $props();
</script>

<div class="worldbuilding-empty-state">
	<h2>{title}</h2>
	<p>{description}</p>
	{#if actionLabel && onAction}
		<PrimaryButton size="sm" onclick={() => void onAction()}>{actionLabel}</PrimaryButton>
	{/if}
</div>

<style>
	.worldbuilding-empty-state {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		color: var(--color-text-muted);
		text-align: center;
	}

	.worldbuilding-empty-state h2,
	.worldbuilding-empty-state p {
		margin: 0;
	}

	.worldbuilding-empty-state h2 {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
	}
</style>
