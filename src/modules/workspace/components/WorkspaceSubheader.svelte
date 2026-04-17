<script lang="ts">
	const VISIBLE_LIMIT = 6;

	type SubheaderItem = { id: string; title: string; isUnassigned?: boolean };

	let {
		items,
		selectedId = null,
		fallbackLabel = 'ITEM',
		parentContextLabel = null,
		onSelect,
		onCreate,
		onHelp,
	} = $props<{
		items: { id: string; title: string; isUnassigned?: boolean }[];
		selectedId?: string | null;
		fallbackLabel?: string;
		parentContextLabel?: string | null;
		onSelect?: (id: string) => void;
		onCreate?: () => void;
		onHelp?: () => void;
	}>();

	const needsArrows = $derived(items.length > VISIBLE_LIMIT);
	let windowStart = $state(0);

	const windowEnd = $derived(Math.min(windowStart + VISIBLE_LIMIT, items.length));
	const visibleItems = $derived(needsArrows ? items.slice(windowStart, windowEnd) : items);
	const canScrollLeft = $derived(windowStart > 0);
	const canScrollRight = $derived(windowEnd < items.length);

	// Keep selected item in view
	$effect(() => {
		if (!needsArrows || !selectedId) return;
		const allItems = items as SubheaderItem[];
		const idx = allItems.findIndex((item) => item.id === selectedId);
		if (idx < 0) return;
		if (idx < windowStart) windowStart = idx;
		else if (idx >= windowStart + VISIBLE_LIMIT) windowStart = idx - VISIBLE_LIMIT + 1;
	});

	function scrollLeft() {
		windowStart = Math.max(0, windowStart - 1);
	}

	function scrollRight() {
		windowStart = Math.min(items.length - VISIBLE_LIMIT, windowStart + 1);
	}
</script>

<div class="subheader">
	{#if parentContextLabel}
		<div class="parent-context">{parentContextLabel}</div>
	{/if}
	<div class="subheader-row">
		<nav class="switcher" aria-label="Item selector">
			{#if needsArrows}
				<button
					class="arrow-btn"
					class:arrow-btn--disabled={!canScrollLeft}
					disabled={!canScrollLeft}
					onclick={scrollLeft}
					aria-label="Scroll left"
				>‹</button>
			{/if}

			{#each visibleItems as item, i (item.id)}
				<button
					class="switcher-btn"
					class:active={selectedId === item.id}
					class:unassigned={item.isUnassigned}
					onclick={() => onSelect?.(item.id)}
					type="button"
				>
					{item.title ? item.title.toUpperCase() : `${fallbackLabel} ${(needsArrows ? windowStart : 0) + i + 1}`}
				</button>
			{/each}
			{#if onCreate}
				<button class="switcher-btn switcher-btn--new" onclick={onCreate} type="button">+ New</button>
			{/if}

			{#if needsArrows}
				<button
					class="arrow-btn"
					class:arrow-btn--disabled={!canScrollRight}
					disabled={!canScrollRight}
					onclick={scrollRight}
					aria-label="Scroll right"
				>›</button>
			{/if}
		</nav>

		{#if onHelp}
			<button class="help-toggle" onclick={onHelp} aria-label="Show conceptual help">
				?
			</button>
		{/if}
	</div>
</div>

<style>
	.subheader {
		flex-shrink: 0;
		padding: var(--space-3) var(--space-6);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.parent-context {
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
		letter-spacing: var(--tracking-wider);
		padding-bottom: var(--space-1);
		opacity: 0.6;
	}

	.subheader-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	/* ── Pill switcher (matches AppHeader .workspace-switcher) ── */

	.switcher {
		display: flex;
		align-items: center;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-full);
		padding: 2px;
		gap: 2px;
	}

	.switcher-btn {
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

	.switcher-btn:hover {
		color: var(--color-text-primary);
	}

	.switcher-btn.active {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
		box-shadow: var(--shadow-sm);
	}

	.switcher-btn.unassigned {
		opacity: 0.45;
		font-style: italic;
	}

	.switcher-btn--new {
		color: var(--color-text-tertiary);
	}

	/* ── Overflow arrows ── */

	.arrow-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		width: 22px;
		height: 22px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		line-height: 1;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-standard);
		flex-shrink: 0;
	}

	.arrow-btn:hover:not(:disabled) {
		color: var(--color-text-primary);
		background: var(--color-surface-hover);
	}

	.arrow-btn--disabled {
		opacity: 0.2;
		pointer-events: none;
	}

	/* ── Help toggle ── */

	.help-toggle {
		background: var(--color-surface-glass);
		border: 1px solid var(--color-border-subtle);
		color: var(--color-text-secondary);
		width: 24px;
		height: 24px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		cursor: pointer;
		transition: var(--transition-color);
		flex-shrink: 0;
	}

	.help-toggle:hover {
		background: var(--color-surface-raised);
		color: var(--color-text-primary);
		border-color: var(--color-border-strong);
	}
</style>
