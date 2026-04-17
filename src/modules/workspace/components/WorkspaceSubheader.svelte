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
	<div class="selector-row">
		<div class="selector-track">
			{#if needsArrows}
				<button
					class="arrow-btn"
					class:arrow-btn--hidden={!canScrollLeft}
					disabled={!canScrollLeft}
					onclick={scrollLeft}
					aria-label="Scroll left"
				>‹</button>
			{/if}

			<span class="selector-items">
				{#each visibleItems as item, i (item.id)}
					<button
						class="selector-btn"
						class:selector-btn--active={selectedId === item.id}
						class:selector-btn--unassigned={item.isUnassigned}
						onclick={() => onSelect?.(item.id)}
					>
						{item.title ? item.title.toUpperCase() : `${fallbackLabel} ${(needsArrows ? windowStart : 0) + i + 1}`}
					</button>
					{#if i < visibleItems.length - 1}
						<span class="divider"> | </span>
					{/if}
				{/each}
				{#if onCreate}
					<button class="selector-btn new-btn" onclick={onCreate}>+ New</button>
				{/if}
			</span>

			{#if needsArrows}
				<button
					class="arrow-btn"
					class:arrow-btn--hidden={!canScrollRight}
					disabled={!canScrollRight}
					onclick={scrollRight}
					aria-label="Scroll right"
				>›</button>
			{/if}
		</div>

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

	.selector-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 var(--space-1);
	}

	.selector-track {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
	}

	.selector-items {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.4;
		user-select: none;
	}

	.selector-btn {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-wider);
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		transition: color 150ms ease, background 150ms ease;
	}

	.selector-btn:hover {
		color: var(--color-text-primary);
		background: rgba(255, 255, 255, 0.05);
	}

	.selector-btn--active {
		color: var(--color-nova-blue);
	}

	.selector-btn--unassigned {
		opacity: 0.45;
		font-style: italic;
	}

	.new-btn {
		color: var(--color-text-tertiary);
		margin-left: var(--space-2);
	}

	.divider {
		color: var(--color-text-muted);
		opacity: 0.3;
		user-select: none;
	}

	/* ── Overflow arrows ── */

	.arrow-btn {
		background: none;
		border: 1px solid var(--color-border-subtle);
		color: var(--color-text-secondary);
		width: 22px;
		height: 22px;
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		line-height: 1;
		cursor: pointer;
		transition: color 150ms ease, background 150ms ease, opacity 150ms ease, border-color 150ms ease;
		flex-shrink: 0;
	}

	.arrow-btn:hover:not(:disabled) {
		color: var(--color-text-primary);
		background: rgba(255, 255, 255, 0.05);
		border-color: var(--color-border-strong);
	}

	.arrow-btn--hidden {
		opacity: 0.2;
		pointer-events: none;
	}

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
