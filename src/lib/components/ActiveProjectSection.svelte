<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import SidebarSection from './SidebarSection.svelte';
	import SidebarItem from './SidebarItem.svelte';
	import { resolveLastProjectId } from '$lib/navigation-state.js';
	import { resolveProjectSidebarActiveState } from '$lib/sidebar-navigation.js';

	let base = $state<string | null>(null);
	let refreshToken = 0;
	let activeState = $derived.by(() => {
		if (!base) {
			return {
				hub: false,
				editor: false,
				outline: false,
				worldbuilding: false,
				aiAssistant: false,
			};
		}
		return resolveProjectSidebarActiveState(base, page.url.pathname, page.url.searchParams);
	});

	function withExportFlag(search: string): string {
		const raw = search.startsWith('?') ? search.slice(1) : search;
		const filtered = raw
			.split('&')
			.filter(Boolean)
			.filter((entry) => !entry.startsWith('export='));
		filtered.push('export=1');
		return `?${filtered.join('&')}`;
	}

	async function refreshFromCache(): Promise<void> {
		const token = ++refreshToken;
		const resolved = await resolveLastProjectId();
		if (token !== refreshToken) return;
		base = resolved.id ? `/projects/${resolved.id}` : null;
	}

	function openLastProjectExport(): void {
		if (!browser || !base) return;

		const activePath = page.url.pathname;
		const inProjectScope = activePath === base || activePath.startsWith(`${base}/`);
		const targetPath = inProjectScope ? activePath : base;
		const nextSearch = inProjectScope ? withExportFlag(page.url.search) : '?export=1';
		void goto(`${targetPath}${nextSearch}`);
	}

	$effect(() => {
		if (!browser) {
			base = null;
			return;
		}

		const currentId = page.params.id;
		const isProjectRoute = page.url.pathname.startsWith('/projects/');
		if (isProjectRoute && currentId && currentId !== 'undefined') {
			base = `/projects/${currentId}`;
			return;
		}

		void refreshFromCache();
	});
</script>

{#if base}
	<hr class="sidebar-divider" />

		<SidebarSection label="LAST PROJECT" collapsible>
			<SidebarItem href={base} label="Hub" active={activeState.hub}>
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
			<SidebarItem href="{base}/editor" label="Editor" active={activeState.editor}>
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
					<path d="M12 20h9"></path>
					<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
				</svg>
			{/snippet}
		</SidebarItem>
			<SidebarItem href="{base}/outline" label="Outline" active={activeState.outline}>
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
			<SidebarItem
				href="{base}/world-building"
				label="Worldbuilding"
				active={activeState.worldbuilding}
			>
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
					<line x1="2" y1="12" x2="22" y2="12"></line>
					<path
						d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
					></path>
				</svg>
			{/snippet}
		</SidebarItem>
			<SidebarItem
				href="{base}/editor?panel=ai"
				label="AI Assistant"
				active={activeState.aiAssistant}
			>
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
					<path d="M12 2L2 7l10 5 10-5-10-5z"></path>
					<path d="M2 17l10 5 10-5"></path>
					<path d="M2 12l10 5 10-5"></path>
				</svg>
			{/snippet}
		</SidebarItem>
		<button
			type="button"
			class="sidebar-export-btn"
			onclick={openLastProjectExport}
			aria-label="Export project"
		>
			<span class="sidebar-export-btn__icon">
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
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="17 8 12 3 7 8"></polyline>
					<line x1="12" y1="3" x2="12" y2="15"></line>
				</svg>
			</span>
			<span class="sidebar-export-btn__label">Export</span>
		</button>
	</SidebarSection>
{/if}

<style>
	.sidebar-divider {
		border: none;
		border-top: 1px solid var(--color-border-default);
		margin: var(--space-3) var(--space-3);
	}

	.sidebar-export-btn {
		display: flex;
		align-items: center;
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: transparent;
		border: none;
		border-left: 2px solid transparent;
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		gap: var(--space-3);
		cursor: pointer;
		text-align: left;
		transition:
			color var(--duration-fast) var(--ease-standard),
			background-color var(--duration-fast) var(--ease-standard);
	}

	.sidebar-export-btn:hover {
		background: var(--color-surface-glass);
	}

	.sidebar-export-btn:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: -2px;
		background: var(--color-surface-glass);
	}

	.sidebar-export-btn__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1em;
		height: 1em;
	}
</style>
