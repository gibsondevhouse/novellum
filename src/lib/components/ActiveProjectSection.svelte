<script lang="ts">
        import { page } from '$app/state';
	import { browser } from '$app/environment';
        import SidebarSection from './SidebarSection.svelte';
        import SidebarItem from './SidebarItem.svelte';
        import { getPreference, setPreference } from '$lib/preferences.js';

        const PREF_KEY = 'app.lastProjectId';

        let base = $state<string | null>(null);

        $effect(() => {
			if (!browser) {
				base = null;
				return;
			}

                const currentId = page.params.id;
                const isProjectRoute = page.url.pathname.startsWith('/projects/');

                if (isProjectRoute && currentId && currentId !== 'undefined') {
                        localStorage.setItem('novellum_last_project_id', currentId);
                        void setPreference(PREF_KEY, currentId);
                        base = `/projects/${currentId}`;
                } else {
                        const storedId = localStorage.getItem('novellum_last_project_id');
                        if (storedId) {
                                base = `/projects/${storedId}`;
                        } else {
                                base = null;
                                // Reconcile from SQLite-canonical store when local cache is empty.
                                void getPreference<string | null>(PREF_KEY, null).then((remote) => {
                                        if (remote) {
                                                localStorage.setItem('novellum_last_project_id', remote);
                                                base = `/projects/${remote}`;
                                        }
                                });
                        }
                }
        });
</script>

{#if base}
	<hr class="sidebar-divider" />

	<SidebarSection label="LAST PROJECT" collapsible>
		<SidebarItem href={base} label="Hub">
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
		<SidebarItem href="{base}/editor" label="Editor">
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
		<SidebarItem href="{base}/world-building" label="World Building">
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
		<SidebarItem href="{base}/continuity" label="Continuity">
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
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
				</svg>
			{/snippet}
		</SidebarItem>
		<SidebarItem href="{base}/outline" label="Outline">
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
{/if}

<style>
	.sidebar-divider {
		border: none;
		border-top: 1px solid var(--color-border-default);
		margin: var(--space-3) var(--space-3);
	}
</style>
