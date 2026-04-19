<script lang="ts">
	import PillNav from '$lib/components/ui/PillNav.svelte';
	import type { PillNavItem } from '$lib/components/ui/PillNav.svelte';

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

	const pillItems = $derived<PillNavItem[]>([
		...visibleItems.map((item: SubheaderItem, i: number) => ({
			id: item.id,
			label: `${fallbackLabel} ${(needsArrows ? windowStart : 0) + i + 1}`,
			isUnassigned: item.isUnassigned,
		})),
		...(onCreate ? [{ id: '__new__', label: '+ New' }] : []),
	]);

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

	function handlePillSelect(id: string) {
		if (id === '__new__') {
			onCreate?.();
		} else {
			onSelect?.(id);
		}
	}
</script>

<div class="subheader">
	{#if parentContextLabel}
		<div class="parent-context">{parentContextLabel}</div>
	{/if}
	<div class="subheader-row">
		{#if needsArrows}
			<button
				class="arrow-btn"
				class:arrow-btn--disabled={!canScrollLeft}
				disabled={!canScrollLeft}
				onclick={scrollLeft}
				aria-label="Scroll left"
			>‹</button>
		{/if}

		<PillNav
			items={pillItems}
			activeId={selectedId}
			onSelect={handlePillSelect}
			ariaLabel="Item selector"
		/>

		{#if needsArrows}
			<button
				class="arrow-btn"
				class:arrow-btn--disabled={!canScrollRight}
				disabled={!canScrollRight}
				onclick={scrollRight}
				aria-label="Scroll right"
			>›</button>
		{/if}

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
		padding: var(--space-1) var(--space-6);
	}

	.parent-context {
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
		letter-spacing: var(--tracking-wider);
		padding-bottom: var(--space-1);
		opacity: 0.6;
		text-align: center;
	}

	.subheader-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		position: relative;
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
		position: absolute;
		right: 0;
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
