<!--
  WorkspaceCollectionPane: Lower structure management zone.
  Grid transitions smoothly when the active mode changes.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { WorkspaceMode } from '../types.js';

	let { children, mode }: { children: Snippet; mode: WorkspaceMode } = $props();
</script>

<div class="collection-pane">
	{#key mode}
		<div class="collection-grid">
			{@render children()}
		</div>
	{/key}
</div>

<style>
	.collection-pane {
		flex: 1;
		min-height: 0;
	}
	.collection-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
		gap: var(--space-3);
		padding: var(--space-1) 0;
		animation: grid-appear var(--duration-enter) var(--ease-decelerate) both;
	}
	@keyframes grid-appear {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.collection-grid {
			animation: none;
		}
	}
</style>
