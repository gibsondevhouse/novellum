<script lang="ts">
	export type PillNavItem = {
		id: string;
		label: string;
		isUnassigned?: boolean;
	};

	let {
		items,
		activeId = null,
		onSelect,
		ariaLabel = 'Navigation',
	} = $props<{
		items: PillNavItem[];
		activeId?: string | null;
		onSelect?: (id: string) => void;
		ariaLabel?: string;
	}>();
</script>

<nav class="pill-nav" aria-label={ariaLabel}>
	{#each items as item (item.id)}
		<button
			class="pill-nav__btn"
			class:active={activeId === item.id}
			class:unassigned={item.isUnassigned}
			onclick={() => onSelect?.(item.id)}
			type="button"
		>
			{item.label}
		</button>
	{/each}
</nav>

<style>
	.pill-nav {
		display: flex;
		align-items: center;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-full);
		padding: 2px;
		gap: 2px;
	}

	.pill-nav__btn {
		background: transparent;
		border: none;
		padding: var(--space-1) var(--space-4);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-standard);
		letter-spacing: var(--tracking-wide);
		white-space: nowrap;
		font-family: inherit;
	}

	.pill-nav__btn:hover {
		color: var(--color-text-primary);
	}

	.pill-nav__btn.active {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
		box-shadow: var(--shadow-sm);
	}

	.pill-nav__btn.unassigned {
		opacity: 0.45;
		font-style: italic;
	}
</style>
