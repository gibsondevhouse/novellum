<script lang="ts">
	import type { EditMode } from '$lib/ai/types.js';

	let {
		activeMode,
		isRunning,
		onSelectMode,
	}: {
		activeMode: EditMode | null;
		isRunning: boolean;
		onSelectMode: (mode: EditMode) => void;
	} = $props();

	const modes: { value: EditMode; label: string }[] = [
		{ value: 'developmental', label: 'Developmental' },
		{ value: 'line_edit', label: 'Line Edit' },
		{ value: 'proofread', label: 'Proofread' },
	];
</script>

<div class="toolbar" role="toolbar" aria-label="Edit mode">
	{#each modes as mode (mode.value)}
		<button
			class="toolbar-btn"
			class:active={activeMode === mode.value}
			disabled={isRunning}
			aria-pressed={activeMode === mode.value}
			onclick={() => onSelectMode(mode.value)}
		>
			{mode.label}
		</button>
	{/each}
</div>

<style>
	.toolbar {
		display: flex;
		gap: var(--space-2);
	}

	.toolbar-btn {
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

	.toolbar-btn:hover:not(:disabled) {
		background-color: var(--color-surface-elevated);
		color: var(--color-text-primary);
	}

	.toolbar-btn.active {
		background-color: color-mix(in srgb, var(--color-nova-blue) 15%, transparent);
		color: var(--color-nova-blue);
		border-color: var(--color-nova-blue);
	}

	.toolbar-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
