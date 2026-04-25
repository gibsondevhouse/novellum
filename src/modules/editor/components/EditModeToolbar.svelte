<script lang="ts">
	import type { EditMode } from '$lib/ai/types.js';
	import { EDIT_MODES } from '../constants.js';
	import { GhostButton } from '$lib/components/ui/index.js';

	let {
		activeMode,
		isRunning,
		onSelectMode,
	}: {
		activeMode: EditMode | null;
		isRunning: boolean;
		onSelectMode: (mode: EditMode) => void;
	} = $props();
</script>

<div class="toolbar" role="toolbar" aria-label="Edit mode">
	{#each EDIT_MODES as mode (mode.value)}
		<GhostButton
			class={`toolbar-btn ${activeMode === mode.value ? 'active' : ''}`}
			type="button"
			disabled={isRunning}
			aria-pressed={activeMode === mode.value}
			onclick={() => onSelectMode(mode.value)}
		>
			{mode.label}
		</GhostButton>
	{/each}
</div>

<style>
	.toolbar {
		display: flex;
		gap: var(--space-2);
	}

	:global(.toolbar-btn) {
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		border: 1px solid var(--color-border-strong);
		background-color: transparent;
		color: var(--color-text-secondary);
		transition: var(--transition-color);
	}

	:global(.toolbar-btn:hover:not(:disabled)) {
		background-color: var(--color-surface-elevated);
		color: var(--color-text-primary);
	}

	:global(.toolbar-btn.active) {
		background-color: color-mix(in srgb, var(--color-nova-blue) 15%, transparent);
		color: var(--color-nova-blue);
		border-color: var(--color-nova-blue);
	}

	:global(.toolbar-btn:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
