<!--
	PillToolbar — pill-shaped word-processor toolbar primitive.

	Visually rhymes with PillNav (shared pill chrome via tokens) but has
	distinct semantics: WAI-ARIA `role="toolbar"`, roving tabindex, icon
	buttons with `aria-pressed` toggle state, group dividers, and a
	dropdown-menu item kind. Do NOT try to unify with PillNav — the
	contracts diverge intentionally.

	plan-023 stage-002 phase-001
-->
<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type PillToolbarButtonItem = {
		kind: 'button';
		id: string;
		label: string;
		icon: string | Snippet;
		pressed?: boolean;
		disabled?: boolean;
		title?: string;
		onSelect: () => void;
	};

	export type PillToolbarDividerItem = {
		kind: 'divider';
		id: string;
	};

	export type PillToolbarMenuChildItem = {
		id: string;
		label: string;
		pressed?: boolean;
		disabled?: boolean;
		onSelect: () => void;
	};

	export type PillToolbarMenuItem = {
		kind: 'menu';
		id: string;
		label: string;
		icon: string | Snippet;
		disabled?: boolean;
		title?: string;
		items: PillToolbarMenuChildItem[];
	};

	export type PillToolbarItem =
		| PillToolbarButtonItem
		| PillToolbarDividerItem
		| PillToolbarMenuItem;
</script>

<script lang="ts">
	interface Props {
		items: PillToolbarItem[];
		ariaLabel: string;
		density?: 'compact' | 'comfortable';
	}

	let { items, ariaLabel, density = 'compact' }: Props = $props();

	let toolbarEl: HTMLDivElement | undefined = $state();
	let openMenuId: string | null = $state(null);
	let activeIndex = $state(0);

	const focusableIndices = $derived.by(() => {
		const out: number[] = [];
		items.forEach((item, idx) => {
			if (item.kind === 'divider') return;
			if (item.disabled) return;
			out.push(idx);
		});
		return out;
	});

	$effect(() => {
		if (focusableIndices.length === 0) {
			activeIndex = 0;
			return;
		}
		if (!focusableIndices.includes(activeIndex)) {
			activeIndex = focusableIndices[0];
		}
	});

	function focusButtonAt(index: number): void {
		if (!toolbarEl) return;
		const node = toolbarEl.querySelector<HTMLButtonElement>(
			`[data-pill-toolbar-index="${index}"]`,
		);
		node?.focus();
	}

	function moveFocus(direction: 1 | -1): void {
		if (focusableIndices.length === 0) return;
		const currentPos = focusableIndices.indexOf(activeIndex);
		const nextPos =
			currentPos === -1
				? 0
				: (currentPos + direction + focusableIndices.length) % focusableIndices.length;
		activeIndex = focusableIndices[nextPos];
		focusButtonAt(activeIndex);
	}

	function focusEdge(edge: 'home' | 'end'): void {
		if (focusableIndices.length === 0) return;
		activeIndex =
			edge === 'home'
				? focusableIndices[0]
				: focusableIndices[focusableIndices.length - 1];
		focusButtonAt(activeIndex);
	}

	function handleKeydown(event: KeyboardEvent): void {
		switch (event.key) {
			case 'ArrowRight':
				event.preventDefault();
				moveFocus(1);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				moveFocus(-1);
				break;
			case 'Home':
				event.preventDefault();
				focusEdge('home');
				break;
			case 'End':
				event.preventDefault();
				focusEdge('end');
				break;
			case 'Escape':
				if (openMenuId !== null) {
					event.preventDefault();
					openMenuId = null;
				}
				break;
		}
	}

	function activateButton(item: PillToolbarButtonItem): void {
		if (item.disabled) return;
		item.onSelect();
	}

	function toggleMenu(item: PillToolbarMenuItem): void {
		if (item.disabled) return;
		openMenuId = openMenuId === item.id ? null : item.id;
	}

	function activateMenuChild(menu: PillToolbarMenuItem, child: PillToolbarMenuChildItem): void {
		if (child.disabled) return;
		child.onSelect();
		openMenuId = null;
		// Restore focus to the menu trigger button so keyboard users
		// don't lose their place.
		const triggerIdx = items.indexOf(menu);
		if (triggerIdx >= 0) {
			activeIndex = triggerIdx;
			focusButtonAt(triggerIdx);
		}
	}

	function handleDocumentClick(event: MouseEvent): void {
		if (openMenuId === null) return;
		if (!toolbarEl) return;
		if (event.target instanceof Node && toolbarEl.contains(event.target)) return;
		openMenuId = null;
	}

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.addEventListener('click', handleDocumentClick);
		return () => document.removeEventListener('click', handleDocumentClick);
	});

	function isSnippet(value: unknown): value is Snippet {
		return typeof value === 'function';
	}

	function isSvgIcon(value: string | Snippet): value is string {
		return typeof value === 'string' && value.trimStart().startsWith('<svg');
	}
</script>

<div
	bind:this={toolbarEl}
	class="pill-toolbar"
	class:pill-toolbar--comfortable={density === 'comfortable'}
	role="toolbar"
	aria-label={ariaLabel}
	tabindex="-1"
	onkeydown={handleKeydown}
>
	{#each items as item, idx (item.id)}
		{#if item.kind === 'divider'}
			<span class="pill-toolbar__divider" role="separator" aria-orientation="vertical"></span>
		{:else if item.kind === 'button'}
			<button
				type="button"
				class="pill-toolbar__btn"
				class:pill-toolbar__btn--pressed={item.pressed}
				data-pill-toolbar-index={idx}
				aria-label={item.label}
				aria-pressed={item.pressed === undefined ? undefined : item.pressed}
				title={item.title ?? item.label}
				disabled={item.disabled}
				tabindex={activeIndex === idx ? 0 : -1}
				onclick={() => {
					activeIndex = idx;
					activateButton(item);
				}}
				onfocus={() => {
					activeIndex = idx;
				}}
			>
				{#if isSnippet(item.icon)}
					{@render item.icon()}
				{:else if isSvgIcon(item.icon)}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html item.icon}
				{:else}
					<span class="pill-toolbar__icon">{item.icon}</span>
				{/if}
			</button>
		{:else}
			<div class="pill-toolbar__menu-wrap">
				<button
					type="button"
					class="pill-toolbar__btn"
					class:pill-toolbar__btn--pressed={openMenuId === item.id}
					data-pill-toolbar-index={idx}
					aria-label={item.label}
					aria-haspopup="menu"
					aria-expanded={openMenuId === item.id}
					title={item.title ?? item.label}
					disabled={item.disabled}
					tabindex={activeIndex === idx ? 0 : -1}
					onclick={() => {
						activeIndex = idx;
						toggleMenu(item);
					}}
					onfocus={() => {
						activeIndex = idx;
					}}
				>
					{#if isSnippet(item.icon)}
						{@render item.icon()}
					{:else if isSvgIcon(item.icon)}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html item.icon}
					{:else}
						<span class="pill-toolbar__icon">{item.icon}</span>
					{/if}
				</button>
				{#if openMenuId === item.id}
					<div class="pill-toolbar__menu" role="menu" aria-label={item.label}>
						{#each item.items as child (child.id)}
							<button
								type="button"
								class="pill-toolbar__menu-item"
								class:pill-toolbar__menu-item--pressed={child.pressed}
								role="menuitemcheckbox"
								aria-checked={child.pressed === undefined ? undefined : child.pressed}
								disabled={child.disabled}
								onclick={() => activateMenuChild(item, child)}
							>
								{child.label}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{/each}
</div>

<style>
	.pill-toolbar {
		display: inline-flex;
		align-items: center;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-full);
		padding: 2px;
		gap: 2px;
		flex-wrap: wrap;
	}

	.pill-toolbar--comfortable {
		padding: var(--space-1);
		gap: var(--space-1);
	}

	.pill-toolbar__btn {
		background: transparent;
		border: none;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-standard);
		letter-spacing: var(--tracking-wide);
		white-space: nowrap;
		font-family: inherit;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--space-6);
		min-height: var(--space-6);
	}

	.pill-toolbar__btn:hover:not(:disabled) {
		color: var(--color-text-primary);
	}

	.pill-toolbar__btn:focus-visible {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: 1px;
	}

	.pill-toolbar__btn--pressed {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
		box-shadow: var(--shadow-sm);
	}

	.pill-toolbar__btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.pill-toolbar__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.pill-toolbar__divider {
		display: inline-block;
		width: 1px;
		align-self: stretch;
		margin: var(--space-1) var(--space-1);
		background: var(--color-border-default);
	}

	.pill-toolbar__menu-wrap {
		position: relative;
		display: inline-flex;
	}

	.pill-toolbar__menu {
		position: absolute;
		top: calc(100% + var(--space-1));
		left: 0;
		display: flex;
		flex-direction: column;
		min-width: var(--space-12);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		padding: var(--space-1);
		gap: 2px;
		z-index: 10;
	}

	.pill-toolbar__menu-item {
		background: transparent;
		border: none;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		white-space: nowrap;
	}

	.pill-toolbar__menu-item:hover:not(:disabled) {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.pill-toolbar__menu-item--pressed {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.pill-toolbar__menu-item:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
