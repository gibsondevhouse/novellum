<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		hero,
		sidebar,
		main,
		mainHeader,
		sidebarLabel = 'Workspace selector',
		mainLabel = 'Workspace detail',
		class: className = '',
	}: {
		hero?: Snippet;
		sidebar?: Snippet;
		main: Snippet;
		mainHeader?: Snippet;
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
			{#if mainHeader}
				<div class="workspace-shell__main-header">{@render mainHeader()}</div>
			{/if}
			<div class="workspace-shell__main-content">{@render main()}</div>
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
		min-height: min(42rem, calc(100vh - var(--header-height, 64px) - var(--space-5)));
		overflow: visible;
		box-sizing: border-box;
	}

	.workspace-shell__sidebar {
		position: sticky;
		top: var(--space-3);
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--color-border-default);
		padding-right: var(--space-4);
		max-height: calc(100vh - var(--header-height, 64px) - var(--space-6));
		overflow: hidden;
		min-height: 0;
	}

	.workspace-shell__sidebar-scroll {
		max-height: inherit;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		min-height: 0;
		padding-right: var(--space-1);
	}

	.workspace-shell__body--split .workspace-shell__main {
		display: grid;
		grid-template-rows: auto minmax(0, auto);
		overflow: visible;
		min-height: 0;
		padding-right: var(--space-2);
	}

	.workspace-shell__main-header {
		position: sticky;
		top: 0;
		z-index: 2;
		background: color-mix(in srgb, var(--color-surface-base) 86%, transparent);
		backdrop-filter: blur(3px);
	}

	.workspace-shell__main-content {
		overflow-y: visible;
		overflow-x: hidden;
		overscroll-behavior: contain;
		min-height: 0;
		padding: var(--space-3) 0 var(--space-3);
	}

	@media (max-width: 56rem) {
		.workspace-shell__body--split {
			grid-template-columns: 1fr;
			min-height: 0;
			overflow: visible;
		}

		.workspace-shell__sidebar {
			position: static;
			max-height: none;
			border-right: 0;
			border-bottom: 1px solid var(--color-border-default);
			padding-right: 0;
			padding-bottom: var(--space-4);
		}

		.workspace-shell__sidebar-scroll {
			max-height: none;
			overflow: visible;
			padding-right: 0;
		}

		.workspace-shell__body--split .workspace-shell__main {
			padding-right: 0;
		}
	}
</style>
