<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';

	let {
		href,
		label,
		icon,
		active,
		locked = false,
	}: {
		href?: string;
		label: string;
		icon?: Snippet;
		active?: boolean;
		locked?: boolean;
	} = $props();

	let isActive = $derived(
		active ??
			(href === '/'
				? page.url.pathname === '/'
				: href
					? page.url.pathname.startsWith(href)
					: false),
	);
</script>

{#if locked}
	<button class="sidebar-item sidebar-item--locked" disabled aria-label="{label} (locked)">
		{#if icon}
			<span class="sidebar-item__icon">{@render icon()}</span>
		{/if}
		<span class="sidebar-item__label">{label}</span>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="sidebar-item__lock"
		>
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
			<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
		</svg>
	</button>
{:else if href}
	<a
		{href}
		class="sidebar-item"
		class:active={isActive}
		aria-current={isActive ? 'page' : undefined}
	>
		{#if icon}
			<span class="sidebar-item__icon">{@render icon()}</span>
		{/if}
		<span class="sidebar-item__label">{label}</span>
	</a>
{:else}
	<span class="sidebar-item" class:active={isActive}>
		{#if icon}
			<span class="sidebar-item__icon">{@render icon()}</span>
		{/if}
		<span class="sidebar-item__label">{label}</span>
	</span>
{/if}

<style>
	.sidebar-item {
		display: flex;
		align-items: center;
		padding: var(--space-2) var(--space-3);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		text-decoration: none;
		border-left: 2px solid transparent;
		gap: var(--space-3);
		transition: var(--transition-color);
	}

	.sidebar-item:hover:not(.sidebar-item--locked) {
		background: var(--color-surface-glass);
	}

	.sidebar-item.active {
		border-left-color: var(--color-teal);
		background: var(--color-surface-glass);
	}

	.sidebar-item--locked {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.sidebar-item__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.sidebar-item__label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sidebar-item__lock {
		width: 1em;
		height: 1em;
		opacity: 0.5;
	}
</style>
