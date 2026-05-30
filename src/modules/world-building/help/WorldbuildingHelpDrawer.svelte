<script lang="ts">
	import type { WorldbuildingHelpSection } from './worldbuilding-help-content.js';
	import WorldbuildingHelpPanel from './WorldbuildingHelpPanel.svelte';

	interface Props {
		open: boolean;
		sections: readonly WorldbuildingHelpSection[];
	}

	let { open = $bindable(), sections }: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialogEl) return;
		if (open) {
			dialogEl.showModal?.();
		} else {
			dialogEl.close?.();
		}
	});

	function handleBackdropClick(e: MouseEvent): void {
		if (e.target === dialogEl) open = false;
	}

	function handleKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Escape') open = false;
	}
</script>

<dialog
	bind:this={dialogEl}
	class="help-drawer"
	aria-label="Worldbuilding Orientation"
	onclick={handleBackdropClick}
	onkeydown={handleKeyDown}
>
	<div class="help-drawer__panel" role="document">
		<div class="help-drawer__header">
			<h2 class="help-drawer__title">Worldbuilding Orientation</h2>
			<button
				type="button"
				class="help-drawer__close"
				aria-label="Close orientation"
				onclick={() => (open = false)}
			>✕</button>
		</div>
		<p class="help-drawer__intro">
			World building is not inventory. It is a causality framework for meaning. Use this panel as a
			reference for semantics first: what each domain is for, what questions it should answer, and
			how to recognize incomplete logic before it leaks into drafting.
		</p>
		<div class="help-drawer__body">
			<WorldbuildingHelpPanel {sections} />
		</div>
	</div>
</dialog>

<style>
	.help-drawer {
		position: fixed;
		inset: 0 0 0 auto;
		margin: 0;
		width: min(640px, 90vw);
		height: 100%;
		max-height: 100%;
		border: none;
		border-left: 1px solid var(--color-border-default);
		background: var(--color-surface-base);
		color: var(--color-text-primary);
		padding: 0;
		box-shadow: var(--shadow-xl);
		overflow: hidden;
	}

	.help-drawer::backdrop {
		background: var(--color-scrim-strong);
	}

	.help-drawer__panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.help-drawer__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-5) var(--space-6);
		border-bottom: 1px solid var(--color-border-default);
		flex-shrink: 0;
	}

	.help-drawer__title {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
	}

	.help-drawer__close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: var(--space-8);
		height: var(--space-8);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-subtle);
		background: transparent;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		cursor: pointer;
		transition:
			background var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.help-drawer__close:hover {
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
	}

	.help-drawer__intro {
		margin: 0;
		padding: var(--space-4) var(--space-6);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		background: color-mix(in srgb, var(--color-surface-raised) 60%, transparent);
		border-bottom: 1px solid var(--color-border-subtle);
		flex-shrink: 0;
	}

	.help-drawer__body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-6);
	}
</style>
