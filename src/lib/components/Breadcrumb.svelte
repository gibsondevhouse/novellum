<script lang="ts">
	let {
		items,
	}: {
		items: Array<{ label: string; href?: string }>;
	} = $props();
</script>

<nav aria-label="Breadcrumb" class="breadcrumb">
	<ol>
		{#each items as item, i (i)}
			<li>
				{#if item.href && i < items.length - 1}
					<a href={item.href}>{item.label}</a>
				{:else}
					<span aria-current="page">{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-wide, 0.04em);
	}

	ol {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0;
	}

	li {
		display: flex;
		align-items: center;
	}

	li + li::before {
		content: '›';
		margin: 0 var(--space-2);
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	a {
		color: var(--color-text-muted);
		text-decoration: none;
	}

	a:hover {
		color: var(--color-text-primary);
	}

	span {
		color: var(--color-text-secondary);
	}
</style>
