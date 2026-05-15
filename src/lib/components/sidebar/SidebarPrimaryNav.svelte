<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolveLastReadBookId } from '$lib/navigation-state.js';
	import { resolveReaderSidebarEntryState } from '$lib/sidebar-navigation.js';
	import SidebarSection from '$lib/components/SidebarSection.svelte';
	import SidebarItem from '$lib/components/SidebarItem.svelte';

	const isHomeActive = $derived(page.url.pathname === '/');
	const isBooksActive = $derived(page.url.pathname.startsWith('/books'));
	const isNovaActive = $derived(page.url.pathname === '/nova');
	const isImagesActive = $derived(page.url.pathname.startsWith('/images'));
	const isProjectsActive = $derived(page.url.pathname === '/projects');
	const isStylesActive = $derived(page.url.pathname === '/styles');

	let readerHref = $state<string | undefined>(undefined);
	let readerLocked = $state(true);
	let readerRefreshToken = 0;

	async function refreshReaderEntry(currentPathname: string): Promise<void> {
		const token = ++readerRefreshToken;
		const resolved = await resolveLastReadBookId();
		if (token !== readerRefreshToken) return;
		const next = resolveReaderSidebarEntryState(resolved);
		if (next.locked && /^\/books\/[^/]+/.test(currentPathname)) {
			readerHref = currentPathname;
			readerLocked = false;
			return;
		}
		readerHref = next.href;
		readerLocked = next.locked;
	}

	$effect(() => {
		const currentPathname = page.url.pathname;
		if (!browser) {
			readerHref = undefined;
			readerLocked = true;
			return;
		}
		void refreshReaderEntry(currentPathname);
	});
</script>

<SidebarSection>
	<SidebarItem href="/?home=1" label="Home" active={isHomeActive}>
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
	<SidebarItem href={readerHref} label="Reader" active={isBooksActive} locked={readerLocked}>
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
			<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
			<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
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
