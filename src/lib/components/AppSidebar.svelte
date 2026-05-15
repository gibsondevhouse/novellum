<script lang="ts">
	import { sidebar } from '$lib/stores/sidebar.svelte.js';
	import ActiveProjectSection from './ActiveProjectSection.svelte';
	import SidebarPrimaryNav from './sidebar/SidebarPrimaryNav.svelte';
	import SidebarProjectSearch from './sidebar/SidebarProjectSearch.svelte';
	import SidebarSettingsNav from './sidebar/SidebarSettingsNav.svelte';
	import SidebarFooterLinks from './sidebar/SidebarFooterLinks.svelte';

	const collapsed = $derived(sidebar.collapsed);

	function toggleSidebar(): void {
		sidebar.toggle();
	}
</script>

<aside class="app-sidebar" class:collapsed aria-label="Navigation">
	<button
		class="toggle-btn"
		onclick={toggleSidebar}
		aria-label="Toggle Navigation"
		aria-expanded={!collapsed}
		aria-controls="sidebar-nav-content"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1.2em"
			height="1.2em"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<line x1="3" y1="12" x2="21" y2="12"></line>
			<line x1="3" y1="6" x2="21" y2="6"></line>
			<line x1="3" y1="18" x2="21" y2="18"></line>
		</svg>
	</button>

	{#if !collapsed}
		<SidebarProjectSearch />
	{/if}

	<nav id="sidebar-nav-content" class="sidebar-scroll" aria-label="Primary navigation links">
		<SidebarPrimaryNav />
		<ActiveProjectSection />
		<hr class="sidebar-divider" />
		<SidebarSettingsNav />
	</nav>

	{#if !collapsed}
		<SidebarFooterLinks />
	{/if}
</aside>

<style>
	.app-sidebar {
		width: var(--sidebar-width);
		background: var(--color-surface-ground);
		height: 100vh;
		position: sticky;
		top: 0;
		overflow-y: hidden;
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--color-border-default);
		padding: var(--space-3) 0;
		flex-shrink: 0;
		transition: width var(--duration-enter) var(--ease-standard);
	}

	.app-sidebar.collapsed {
		width: var(--sidebar-collapsed-width);
	}

	.sidebar-scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.toggle-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		padding: var(--space-2) var(--space-3);
		cursor: pointer;
		display: flex;
		align-items: center;
		transition: color var(--duration-enter) var(--ease-standard);
	}

	.app-sidebar.collapsed .toggle-btn {
		justify-content: center;
		padding: var(--space-2) 0;
	}

	.toggle-btn:hover {
		color: var(--color-text-primary);
	}

	.toggle-btn:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: -2px;
	}

	.app-sidebar.collapsed :global(.sidebar-item__label),
	.app-sidebar.collapsed :global(.sidebar-section__label),
	.app-sidebar.collapsed :global(.sidebar-item__lock),
	.app-sidebar.collapsed :global(.sidebar-export-btn__label) {
		display: none;
	}

	.app-sidebar.collapsed :global(.sidebar-item),
	.app-sidebar.collapsed :global(.sidebar-export-btn) {
		justify-content: center;
		padding: var(--space-2) 0;
	}

	.app-sidebar.collapsed :global(.sidebar-search-results) {
		display: none;
	}

	.sidebar-divider {
		border: none;
		border-top: 1px solid var(--color-border-default);
		margin: var(--space-3) var(--space-3);
	}

	@media (max-width: 900px) {
		.app-sidebar {
			width: var(--sidebar-collapsed-width);
		}

		:global(.sidebar-search),
		:global(.sidebar-search-results) {
			display: none;
		}
	}
</style>
