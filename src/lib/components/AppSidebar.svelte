<script lang="ts">
	import { page } from '$app/state';
	import SidebarSection from './SidebarSection.svelte';
	import SidebarItem from './SidebarItem.svelte';
	import ActiveProjectSection from './ActiveProjectSection.svelte';

	let collapsed = $state(false);
	let searchQuery = $state('');

	function toggleSidebar() {
		collapsed = !collapsed;
	}

	let isReaderRoute = $derived(
		page.url.pathname.startsWith('/books/') && page.url.pathname !== '/books',
	);
	let isHomeActive = $derived(page.url.pathname === '/' || isReaderRoute);
	let isNovaActive = $derived(page.url.pathname === '/nova');
	let isImagesActive = $derived(page.url.pathname.startsWith('/images'));
	let isProjectsActive = $derived(page.url.pathname === '/projects');
	let isStylesActive = $derived(page.url.pathname === '/styles');
	let isSettingsActive = $derived(page.url.pathname.startsWith('/settings'));
</script>

<aside class="app-sidebar" class:collapsed aria-label="Navigation">
	<button class="toggle-btn" onclick={toggleSidebar} aria-label="Toggle Navigation">
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
		<div class="sidebar-search">
			<svg
				class="sidebar-search__icon"
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="11" cy="11" r="8"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
			<input
				class="sidebar-search__input"
				type="search"
				placeholder="Search projects..."
				bind:value={searchQuery}
				aria-label="Search projects"
			/>
		</div>
	{/if}

	<SidebarSection>
		<SidebarItem href="/" label="Home" active={isHomeActive}>
			{#snippet icon()}
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
				>
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
					<polyline points="9 22 9 12 15 12 15 22"></polyline>
				</svg>
			{/snippet}
		</SidebarItem>
		<SidebarItem href="/nova" label="Nova" active={isNovaActive}>
			{#snippet icon()}
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
				>
					<polygon
						points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
					></polygon>
				</svg>
			{/snippet}
		</SidebarItem>
		<SidebarItem href="/images" label="Images" active={isImagesActive}>
			{#snippet icon()}
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
				>
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
					<circle cx="8.5" cy="8.5" r="1.5"></circle>
					<polyline points="21 15 16 10 5 21"></polyline>
				</svg>
			{/snippet}
		</SidebarItem>
		<SidebarItem href="/styles" label="Styles" active={isStylesActive}>
			{#snippet icon()}
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
				>
					<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
				</svg>
			{/snippet}
		</SidebarItem>
		<SidebarItem href="/projects" label="Projects" active={isProjectsActive}>
			{#snippet icon()}
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
				>
					<rect x="3" y="3" width="7" height="7"></rect>
					<rect x="14" y="3" width="7" height="7"></rect>
					<rect x="14" y="14" width="7" height="7"></rect>
					<rect x="3" y="14" width="7" height="7"></rect>
				</svg>
			{/snippet}
		</SidebarItem>
	</SidebarSection>

	<SidebarSection label="RECENT" collapsible>
		<SidebarItem label="Recent sessions" locked={true}>
			{#snippet icon()}
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
				>
					<circle cx="12" cy="12" r="10"></circle>
					<polyline points="12 6 12 12 16 14"></polyline>
				</svg>
			{/snippet}
		</SidebarItem>
	</SidebarSection>

	<ActiveProjectSection />

	<hr class="sidebar-divider" />

	<SidebarSection>
		<SidebarItem href="/settings" label="Settings" active={isSettingsActive}>
			{#snippet icon()}
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
				>
					<circle cx="12" cy="12" r="3"></circle>
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
				</svg>
			{/snippet}
		</SidebarItem>
	</SidebarSection>

	{#if !collapsed}
		<div class="sidebar-bottom">
			<a href="/nova" class="sidebar-bottom__link" aria-label="Nova AI Help">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
				</svg>
				<span>Nova</span>
			</a>
			<span class="sidebar-bottom__separator">·</span>
			<a href="/settings" class="sidebar-bottom__link" aria-label="Help & Docs">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
					<line x1="12" y1="17" x2="12.01" y2="17"></line>
				</svg>
				<span>Help</span>
			</a>
		</div>
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
		width: 64px;
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

	.app-sidebar.collapsed :global(.sidebar-item__label),
	.app-sidebar.collapsed :global(.sidebar-section__label),
	.app-sidebar.collapsed :global(.sidebar-item__lock) {
		display: none;
	}
	
	.app-sidebar.collapsed :global(.sidebar-item) {
		justify-content: center;
		padding: var(--space-2) 0;
	}

	.sidebar-divider {
		border: none;
		border-top: 1px solid var(--color-border-default);
		margin: var(--space-3) var(--space-3);
	}

	.sidebar-search {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		margin: var(--space-1) var(--space-2);
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
	}

	.sidebar-search__icon {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.sidebar-search__input {
		background: none;
		border: none;
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		width: 100%;
		outline: none;
	}

	.sidebar-search__input::placeholder {
		color: var(--color-text-muted);
	}

	.sidebar-bottom {
		margin-top: auto;
		padding: var(--space-3);
		border-top: 1px solid var(--color-border-default);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.sidebar-bottom__link {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-standard);
	}

	.sidebar-bottom__link:hover {
		color: var(--color-text-primary);
	}

	.sidebar-bottom__separator {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}
</style>
