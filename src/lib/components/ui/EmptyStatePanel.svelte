<script lang="ts">
	import type { Snippet } from 'svelte';
	import SurfacePanel from './SurfacePanel.svelte';

	interface Props {
		title: string;
		description?: string;
		actions?: Snippet;
		class?: string;
	}

	let { title, description, actions, class: className = '' }: Props = $props();
</script>

<SurfacePanel class="empty-state-panel {className}">
	<div class="empty-content">
		<h3 class="title">{title}</h3>
		{#if description}
			<p class="description">{description}</p>
		{/if}
		{#if actions}
			<div class="actions">
				{@render actions()}
			</div>
		{/if}
	</div>
</SurfacePanel>

<style>
	:global(.empty-state-panel) {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 40vh;
		text-align: center;
		padding: var(--space-8) var(--space-4);
		border-style: dashed;
		background-color: transparent;
	}

	.empty-content {
		max-width: 440px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-normal);
		letter-spacing: var(--tracking-tight);
		color: var(--color-text-primary);
		margin: 0;
	}

	.description {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		margin: 0;
	}

	.actions {
		margin-top: var(--space-3);
	}
</style>
