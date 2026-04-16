<!--
  WorkspaceBoardShell: Reusable split-panel layout for board-style workspaces.
  Provides a main content column + sidebar context column with configurable proportions.
  Domain-specific content is injected via Svelte 5 snippets.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		showEmpty = false,
		mainWidth = '3fr',
		sidebarWidth = '2fr',
		onBackdropClick,
		header,
		columnHeaders,
		main,
		sidebar,
		empty,
	}: {
		/** When true, renders the empty snippet instead of the board layout. */
		showEmpty?: boolean;
		/** CSS grid width for the main column. Default: '3fr'. */
		mainWidth?: string;
		/** CSS grid width for the sidebar column. Default: '2fr'. */
		sidebarWidth?: string;
		/** Called when clicking the layout backdrop (outside main/sidebar content). */
		onBackdropClick?: () => void;
		/** Domain-specific header area rendered above the split layout. */
		header?: Snippet;
		/** Labels rendered above each column (e.g., "Beats" / "Stages"). */
		columnHeaders?: Snippet;
		/** Main content column (left). */
		main: Snippet;
		/** Sidebar/context column (right). */
		sidebar: Snippet;
		/** Content shown when showEmpty is true. */
		empty?: Snippet;
	} = $props();

	function handleLayoutClick(e: MouseEvent) {
		if (!onBackdropClick) return;
		const t = e.target as HTMLElement;
		if (t.closest('[data-board-interactive]')) return;
		onBackdropClick();
	}
</script>

<div class="board-shell">
	{#if showEmpty && empty}
		<div class="board-shell__empty">
			{@render empty()}
		</div>
	{:else}
		{#if header}
			{@render header()}
		{/if}

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="board-shell__layout"
			style:--board-main-width={mainWidth}
			style:--board-sidebar-width={sidebarWidth}
			onclick={handleLayoutClick}
		>
			{#if columnHeaders}
				<div class="board-shell__column-headers">
					{@render columnHeaders()}
				</div>
			{/if}

			<div class="board-shell__body">
				<div class="board-shell__main" data-board-interactive>
					{@render main()}
				</div>
				<div class="board-shell__sidebar" data-board-interactive>
					{@render sidebar()}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.board-shell {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		height: 100%;
		padding: var(--space-4);
	}

	.board-shell__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-secondary);
		gap: var(--space-2);
		text-align: center;
	}

	.board-shell__layout {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		gap: var(--space-3);
	}

	.board-shell__column-headers {
		display: grid;
		grid-template-columns: var(--board-main-width) var(--board-sidebar-width);
		gap: var(--space-6);
	}

	.board-shell__body {
		display: grid;
		grid-template-columns: var(--board-main-width) var(--board-sidebar-width);
		gap: var(--space-6);
		flex: 1;
		min-height: 0;
	}

	.board-shell__main {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.board-shell__sidebar {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}
</style>
