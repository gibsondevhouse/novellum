<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		eyebrow,
		title,
		description,
		actions,
		meta,
	}: {
		eyebrow?: string;
		title: string;
		description?: string;
		actions?: Snippet;
		meta?: Snippet;
	} = $props();
</script>

<header class="page-header">
	<div class="page-header__heading">
		{#if eyebrow}
			<p class="page-header__eyebrow">{eyebrow}</p>
		{/if}
		<h1 class="page-header__title">{title}</h1>
		{#if description}
			<p class="page-header__description">{description}</p>
		{/if}
	</div>

	{#if actions || meta}
		<div class="page-header__right">
			{#if actions}
				<div class="page-header__actions">{@render actions()}</div>
			{/if}
			{#if meta}
				<div class="page-header__meta">{@render meta()}</div>
			{/if}
		</div>
	{/if}
</header>

<style>
	.page-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
		padding-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-border-default);
	}

	.page-header__heading {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: 64ch;
	}

	.page-header__eyebrow,
	.page-header__title,
	.page-header__description {
		margin: 0;
	}

	.page-header__eyebrow {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.page-header__title {
		font-family: var(--font-display);
		font-size: clamp(var(--text-3xl), 4vw, var(--text-5xl));
		font-weight: var(--font-weight-normal);
		letter-spacing: var(--tracking-tight);
		line-height: 1.1;
		color: var(--color-text-primary);
	}

	.page-header__description {
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
	}

	.page-header__right {
		display: grid;
		gap: var(--space-3);
		justify-items: end;
	}

	.page-header__actions {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.page-header__meta {
		width: 100%;
	}

	@media (max-width: 900px) {
		.page-header__right {
			width: 100%;
			justify-items: start;
		}
	}
</style>