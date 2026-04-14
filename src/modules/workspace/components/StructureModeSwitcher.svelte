<!--
  StructureModeSwitcher: Inline tab-style mode selector.
  ARCS · ACTS · CHAPTERS · SCENES — active mode is highlighted.
-->
<script lang="ts">
	import { WORKSPACE_MODES, WORKSPACE_MODE_LABELS, type WorkspaceMode } from '../types.js';
	import { setMode } from '$modules/workspace/stores/workspace-mode.svelte.js';

	let {
		activeMode,
	}: {
		activeMode: WorkspaceMode;
	} = $props();

	function handleKeydown(e: KeyboardEvent, i: number) {
		if (e.key === 'ArrowLeft' && i > 0) {
			e.preventDefault();
			setMode(WORKSPACE_MODES[i - 1]);
		} else if (e.key === 'ArrowRight' && i < WORKSPACE_MODES.length - 1) {
			e.preventDefault();
			setMode(WORKSPACE_MODES[i + 1]);
		}
	}
</script>

<nav class="ps-mode-switcher" aria-label="Structural mode">
	{#each WORKSPACE_MODES as m, i (m)}
		<button
			class="mode-tab"
			class:is-active={m === activeMode}
			onclick={() => setMode(m)}
			onkeydown={(e) => handleKeydown(e, i)}
			type="button"
			aria-current={m === activeMode ? 'page' : undefined}
		>
			{WORKSPACE_MODE_LABELS[m]}
		</button>
	{/each}
</nav>

<style>
	.ps-mode-switcher {
		display: flex;
		gap: var(--space-1);
		background: var(--color-surface-ground);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-full);
		padding: var(--space-1);
	}

	.mode-tab {
		padding: var(--space-1) var(--space-4);
		border-radius: var(--radius-full);
		background: none;
		border: none;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		cursor: pointer;
		white-space: nowrap;
		font-family: inherit;
		transition:
			color var(--duration-base) var(--ease-standard),
			background var(--duration-base) var(--ease-standard),
			box-shadow var(--duration-base) var(--ease-standard);
	}

	.mode-tab:hover {
		color: var(--color-text-primary);
	}

	.mode-tab.is-active {
		background: var(--color-surface-elevated);
		color: var(--color-text-primary);
		box-shadow:
			0 1px 3px color-mix(in srgb, black 60%, transparent),
			0 0 0 1px var(--color-border-default);
	}

	.mode-tab:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
