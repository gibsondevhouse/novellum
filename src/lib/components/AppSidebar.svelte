<script lang="ts">
	import { page } from '$app/state';
	import SidebarSection from './SidebarSection.svelte';
	import SidebarItem from './SidebarItem.svelte';
	import ActiveProjectSection from './ActiveProjectSection.svelte';

	let collapsed = $state(false);

	function toggleSidebar() {
		collapsed = !collapsed;
	}

	let isBooksShelfRoute = $derived(page.url.pathname === '/books');
	let isReaderRoute = $derived(
		page.url.pathname.startsWith('/books/') && page.url.pathname !== '/books',
	);
	let isHomeActive = $derived(page.url.pathname === '/' || isReaderRoute);
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
		<SidebarItem label="Nova" locked={true}>
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
		<SidebarItem label="Images" locked={true}>
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
		<SidebarItem label="Styles" locked={true}>
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
	</SidebarSection>

	<hr class="sidebar-divider" />

	<SidebarSection label="PROJECTS">
		<SidebarItem href="/books" label="Books" active={isBooksShelfRoute}>
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
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
					<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
				</svg>
			{/snippet}
		</SidebarItem>
		<SidebarItem href="/stories" label="Stories">
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
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
					<polyline points="14 2 14 8 20 8"></polyline>
					<line x1="16" y1="13" x2="8" y2="13"></line>
					<line x1="16" y1="17" x2="8" y2="17"></line>
					<polyline points="10 9 9 9 8 9"></polyline>
				</svg>
			{/snippet}
		</SidebarItem>
	</SidebarSection>

	<SidebarSection label="RECENT">
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
		transition: width 0.2s ease-in-out;
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
		transition: color 0.2s ease-in-out;
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
</style>
