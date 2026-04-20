<script lang="ts">
	import { GhostButton } from '$lib/components/ui/index.js';

	let { openExport, openDelete }: { openExport: () => void; openDelete: () => void } = $props();
</script>

<div class="hub-hero-actions">
	<GhostButton onclick={openExport}>Export</GhostButton>
	<GhostButton onclick={openDelete} class="hub-util-btn--danger">Delete</GhostButton>
</div>

<style>
	.hub-hero-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: calc(-1 * var(--space-3));
	}

	:global(.hub-util-btn--danger:hover) {
		color: var(--color-error) !important;
		border-color: var(--color-error) !important;
	}
</style>