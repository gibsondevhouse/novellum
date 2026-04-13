<script lang="ts">
	import type { Snippet } from 'svelte';

	let { open, onClose, header, children } = $props<{
		/** Whether the overlay is visible. */
		open: boolean;
		onClose: () => void;
		/** Header region: title, close action, breadcrumb, etc. */
		header?: Snippet;
		children?: Snippet;
	}>();

	let panelEl = $state<HTMLDivElement | undefined>(undefined);

	// Auto-focus panel on open so keyboard navigation works immediately
	$effect(() => {
		if (open && panelEl) {
			panelEl.focus();
		}
	});

	function handleBackdropClick() {
		onClose();
	}

	function handlePanelKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			// Stop propagation so the parent card's global ESC handler doesn't also fire
			e.stopPropagation();
			onClose();
		}
	}
</script>

{#if open}
	<!-- Dimming backdrop — click to dismiss -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fo-backdrop"
		role="presentation"
		onclick={handleBackdropClick}
	></div>

	<!-- Overlay panel — positioned absolutely inside the parent card -->
	<div
		bind:this={panelEl}
		class="fo-panel"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onkeydown={handlePanelKeydown}
	>
		{#if header}
			<div class="fo-header">{@render header()}</div>
		{/if}
		{#if children}
			<div class="fo-body">{@render children()}</div>
		{/if}
	</div>
{/if}

<style>
	/* ── Backdrop: covers the parent card surface ── */
	.fo-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		backdrop-filter: blur(1px);
		z-index: 9;
		cursor: pointer;
	}

	/* ── Overlay panel: slightly smaller than parent, centered ── */
	.fo-panel {
		position: absolute;
		inset: var(--space-5);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.7),
			0 0 0 1px rgba(255, 255, 255, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.07);
		z-index: 10;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: fo-enter 150ms var(--ease-decelerate) forwards;
	}

	@keyframes fo-enter {
		from {
			opacity: 0;
			transform: scale(0.97);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.fo-header {
		flex-shrink: 0;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-elevated) 50%, transparent);
	}

	.fo-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
	}
</style>
