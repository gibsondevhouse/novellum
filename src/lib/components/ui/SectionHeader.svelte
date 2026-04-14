<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		title: string;
		description?: string;
		actions?: Snippet;
		meta?: Snippet;
		class?: string;
	}

	let { title, description, actions, meta, class: className = '', ...rest }: Props = $props();
</script>

<header class="section-header {className}" {...rest}>
	<div class="header-content">
		<h2 class="title">{title}</h2>
		{#if description}
			<p class="description">{description}</p>
		{/if}
		{#if meta}
			<div class="meta">
				{@render meta()}
			</div>
		{/if}
	</div>
	{#if actions}
		<div class="actions">
			{@render actions()}
		</div>
	{/if}
</header>

<style>
	.section-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-border-subtle);
		margin-bottom: var(--space-4);
	}

	.header-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.title {
		font-family: var(--font-sans);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	.description {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.meta {
		margin-top: var(--space-1);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}
</style>
