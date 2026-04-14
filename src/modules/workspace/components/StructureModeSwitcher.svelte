<!--
  StructureModeSwitcher: Inline tab-style mode selector.
  ARCS · ACTS · CHAPTERS · SCENES — active mode is highlighted.
-->
<script lang="ts">
	import { WORKSPACE_MODES, WORKSPACE_MODE_LABELS, type WorkspaceMode } from '../types.js';

	let {
		activeMode,
		onPrev,
		onNext,
	}: {
		activeMode: WorkspaceMode;
		onPrev: () => void;
		onNext: () => void;
	} = $props();

	import { setMode } from '$modules/workspace/stores/workspace-mode.svelte.js';
</script>

<nav class="mode-tabs" aria-label="Structural mode">
	{#each WORKSPACE_MODES as m, i}
		{#if i > 0}<span class="mode-sep" aria-hidden="true">·</span>{/if}
		<button
			class="mode-tab"
			class:mode-tab--active={m === activeMode}
			onclick={() => setMode(m)}
			type="button"
			aria-current={m === activeMode ? 'page' : undefined}
		>
			{WORKSPACE_MODE_LABELS[m].toUpperCase()}
		</button>
	{/each}
</nav>

<style>
	.mode-tabs {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.mode-sep {
		color: var(--color-text-muted);
		opacity: 0.2;
		font-size: var(--text-xs);
		user-select: none;
	}

	.mode-tab {
		background: none;
		border: none;
		padding: 0;
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.35;
		cursor: pointer;
		transition: opacity var(--duration-base) var(--ease-standard);
		line-height: 1;
	}

	.mode-tab:hover {
		opacity: 0.65;
	}

	.mode-tab--active {
		color: var(--color-text-primary);
		opacity: 1;
	}

	.mode-tab:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-xs);
	}
</style>
