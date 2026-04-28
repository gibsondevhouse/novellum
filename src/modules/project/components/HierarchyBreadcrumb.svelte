<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Crumb {
		label: string;
		href?: string;
	}

	interface Props {
		crumbs: Crumb[];
		trailing?: Snippet;
	}

	let { crumbs, trailing }: Props = $props();
</script>

<nav class="breadcrumb" aria-label="Breadcrumb">
	<ol class="breadcrumb__list">
		{#each crumbs as crumb, i (i)}
			<li class="breadcrumb__item">
				{#if crumb.href && i < crumbs.length - 1}
					<a href={crumb.href} class="breadcrumb__link">{crumb.label}</a>
				{:else}
					<span class="breadcrumb__current" aria-current="page">{crumb.label}</span>
				{/if}
				{#if i < crumbs.length - 1}
					<span class="breadcrumb__sep" aria-hidden="true">/</span>
				{/if}
			</li>
		{/each}
	</ol>
	{#if trailing}
		<div class="breadcrumb__trailing">{@render trailing()}</div>
	{/if}
</nav>

<style>
	.breadcrumb {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	.breadcrumb__list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: var(--text-sm);
	}

	.breadcrumb__item {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.breadcrumb__link {
		color: var(--color-text-secondary);
		text-decoration: none;
	}

	.breadcrumb__link:hover {
		color: var(--color-text-primary);
		text-decoration: underline;
	}

	.breadcrumb__current {
		color: var(--color-text-primary);
		font-weight: var(--font-weight-medium);
	}

	.breadcrumb__sep {
		color: var(--color-text-muted);
	}
</style>
