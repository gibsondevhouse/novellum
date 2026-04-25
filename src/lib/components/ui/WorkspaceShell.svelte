<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		hero,
		sidebar,
		main,
		sidebarLabel = 'Workspace selector',
		mainLabel = 'Workspace detail',
		class: className = '',
	}: {
		hero?: Snippet;
		sidebar?: Snippet;
		main: Snippet;
		sidebarLabel?: string;
		mainLabel?: string;
		class?: string;
	} = $props();
</script>

<div class="workspace-shell {className}" class:workspace-shell--with-sidebar={Boolean(sidebar)}>
	{#if hero}
		<div class="workspace-shell__hero">{@render hero()}</div>
	{/if}

	<div class="workspace-shell__body" class:workspace-shell__body--split={Boolean(sidebar)}>
		{#if sidebar}
			<aside class="workspace-shell__sidebar" aria-label={sidebarLabel}>
				<div class="workspace-shell__sidebar-scroll">{@render sidebar()}</div>
			</aside>
		{/if}

		<section class="workspace-shell__main" aria-label={mainLabel}>
			{@render main()}
		</section>
	</div>
</div>

<style>
	.workspace-shell {
		display: grid;
		gap: var(--space-5);
		padding: var(--space-5) 0 var(--space-8);
	}

	.workspace-shell--with-sidebar {
		min-height: 0;
	}

	.workspace-shell__body {
		display: block;
	}

	.workspace-shell__body--split {
		display: grid;
		grid-template-columns: minmax(280px, 340px) 1fr;
		gap: var(--space-4);
		padding: 0 var(--space-2) var(--space-1);
		height: calc(100vh - var(--header-height, 64px));
		overflow: hidden;
		box-sizing: border-box;
		min-height: 0;
	}

	.workspace-shell__sidebar {
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--color-border-default);
		padding-right: var(--space-4);
		height: 100%;
		overflow: hidden;
		min-height: 0;
	}

	.workspace-shell__sidebar-scroll {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		min-height: 0;
		padding-right: var(--space-1);
	}

	.workspace-shell__body--split .workspace-shell__main {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		height: 100%;
		overflow: hidden;
		min-height: 0;
	}
</style>
