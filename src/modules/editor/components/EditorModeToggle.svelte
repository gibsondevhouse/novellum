<script lang="ts">
	import type { EditorMode } from '../stores/editor-preferences.svelte.js';

	interface Props {
		mode: EditorMode;
		onModeChange: (mode: EditorMode) => void;
	}

	let { mode, onModeChange }: Props = $props();

	const modes: { value: EditorMode; label: string }[] = [
		{ value: 'writing', label: 'Writing' },
		{ value: 'planning', label: 'Planning' },
		{ value: 'revision', label: 'Revision' },
	];
</script>

<div class="mode-toggle" role="group" aria-label="Editor mode">
	{#each modes as m (m.value)}
		<button
			type="button"
			class="mode-btn"
			class:active={mode === m.value}
			onclick={() => onModeChange(m.value)}
			aria-pressed={mode === m.value}
		>
			{m.label}
		</button>
	{/each}
</div>

<style>
	.mode-toggle {
		display: flex;
		gap: 0;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.mode-btn {
		background: none;
		border: none;
		border-right: 1px solid var(--color-border-default);
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: background-color 0.1s ease, color 0.1s ease;
	}

	.mode-btn:last-child {
		border-right: none;
	}

	.mode-btn:hover {
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.mode-btn.active {
		background-color: color-mix(in srgb, var(--color-teal) 12%, transparent);
		color: var(--color-teal);
	}
</style>
