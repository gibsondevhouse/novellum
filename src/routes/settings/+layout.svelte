<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { PageHeader } from '$lib/components/ui/index.js';
	import PillNav, { type PillNavItem } from '$lib/components/ui/PillNav.svelte';

	let { children } = $props<{ children?: import('svelte').Snippet }>();

	const items: PillNavItem[] = [
		{ id: 'appearance', label: 'Appearance' },
		{ id: 'defaults', label: 'Defaults' },
		{ id: 'shortcuts', label: 'Shortcuts' },
		{ id: 'ai', label: 'AI' },
		{ id: 'data', label: 'Data' },
	];

	const allowed = new Set(items.map((item) => item.id));

	let activeId = $derived.by(() => {
		const segment = page.url.pathname.split('/')[2] ?? '';
		return allowed.has(segment) ? segment : null;
	});

	function handleSelect(id: string) {
		void goto(`/settings/${id}`);
	}
</script>

<svelte:head>
	<title>Settings — Novellum</title>
</svelte:head>

<div class="settings-page">
	<PageHeader
		eyebrow="Configuration"
		title="Integrations & Settings"
		description="Manage your external connections and global preferences."
	/>

	<div class="settings-pillnav">
		<PillNav
			{items}
			{activeId}
			onSelect={handleSelect}
			ariaLabel="Settings categories"
		/>
	</div>

	<main class="settings-content">
		{@render children?.()}
	</main>
</div>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-12) var(--space-8);
		width: 100%;
		gap: var(--space-6);
	}

	.settings-page :global(.page-header) {
		padding-bottom: 0;
	}

	.settings-pillnav {
		display: flex;
		justify-content: flex-start;
	}

	.settings-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}
</style>
