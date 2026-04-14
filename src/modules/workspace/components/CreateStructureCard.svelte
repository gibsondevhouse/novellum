<!--
  CreateStructureCard: Subordinate insertion point for a new structural item.
  Visually recessed — smaller, quieter, clearly secondary to real content cards.
-->
<script lang="ts">
	import type { WorkspaceMode } from '../types.js';
	import { WORKSPACE_MODE_LABELS } from '../types.js';

	let {
		mode,
		onCreate,
	}: {
		mode: WorkspaceMode;
		onCreate: () => void;
	} = $props();

	const singular = $derived(WORKSPACE_MODE_LABELS[mode].slice(0, -1));
</script>

<button class="add-item" onclick={onCreate} type="button" aria-label="Add new {singular}">
	<svg
		class="add-item__icon"
		width="13"
		height="13"
		viewBox="0 0 13 13"
		fill="none"
		aria-hidden="true"
	>
		<path
			d="M6.5 1.5V11.5M1.5 6.5H11.5"
			stroke="currentColor"
			stroke-width="1.25"
			stroke-linecap="round"
		/>
	</svg>
	<span class="add-item__label">Add {singular}</span>
</button>

<style>
	.add-item {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		background: transparent;
		border: 1px dashed color-mix(in srgb, var(--color-border-default) 50%, transparent);
		border-radius: var(--radius-md);
		cursor: pointer;
		font-family: var(--font-sans);
		width: 100%;
		min-height: 52px;
		opacity: 0.4;
		transition:
			opacity var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard),
			background var(--duration-base) var(--ease-standard);
	}
	.add-item:hover {
		opacity: 0.85;
		border-color: color-mix(in srgb, var(--color-border-default) 80%, transparent);
		background: color-mix(in srgb, white 2%, transparent);
	}
	.add-item:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		opacity: 0.85;
	}
	.add-item__icon {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
	.add-item__label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
	}
</style>
