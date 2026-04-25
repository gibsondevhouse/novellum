<script lang="ts">
	import { GhostButton } from '$lib/components/ui/index.js';

	let {
		openExport,
		openDelete
	}: {
		openExport: () => void;
		openDelete: () => void;
	} = $props();
</script>

<div class="hub-hero-actions" role="group" aria-label="Project actions">
	<div class="hub-hero-actions__primary">
		<GhostButton onclick={openExport}>Export</GhostButton>
	</div>
	<div class="hub-hero-actions__danger">
		<GhostButton onclick={openDelete} class="hub-util-btn--danger">Delete</GhostButton>
	</div>
</div>

<style>
	.hub-hero-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-surface-glass) 70%, transparent);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		align-self: flex-end;
		position: sticky;
		top: calc(48px + var(--space-2));
		z-index: 10;
	}

	.hub-hero-actions__primary,
	.hub-hero-actions__danger {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.hub-hero-actions__danger {
		padding-left: var(--space-2);
		border-left: 1px solid var(--color-border-subtle);
	}

	:global(.hub-util-btn--danger:hover) {
		color: var(--color-error) !important;
		border-color: var(--color-error) !important;
	}

	@media (max-width: 640px) {
		.hub-hero-actions {
			width: 100%;
			justify-content: space-between;
			border-radius: var(--radius-lg);
		}
	}
</style>