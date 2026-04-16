<script lang="ts">
	import type { Milestone } from '$lib/db/types.js';

	let { milestone, selected, onSelect, onUpdateTitle, onUpdateDescription } = $props<{
		milestone: Milestone;
		selected: boolean;
		onSelect: () => void;
		onUpdateTitle: (value: string) => void;
		onUpdateDescription: (value: string) => void;
	}>();
</script>

<div class="milestone-card" class:selected>
	<div class="milestone-card-header">
		<input
			type="text"
			class="milestone-title-input"
			value={milestone.title}
			oninput={(e) => onUpdateTitle(e.currentTarget.value)}
			onclick={onSelect}
		/>
		<span class="milestone-meta">
			{milestone.chapterIds.length} chapter{milestone.chapterIds.length !== 1 ? 's' : ''}
		</span>
	</div>
	<textarea
		class="milestone-description-input"
		value={milestone.description}
		oninput={(e) => onUpdateDescription(e.currentTarget.value)}
		placeholder="Describe this turning point..."
		rows="2"
		onclick={() => { if (!selected) onSelect(); }}
	></textarea>
</div>

<style>
	.milestone-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		min-height: var(--card-row-height, 148px);
		overflow: hidden;
	}

	.milestone-card:hover {
		border-color: var(--color-border-hover);
		background: var(--color-surface-hover);
	}

	.milestone-card.selected {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 1px var(--color-primary);
	}

	.milestone-card-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.milestone-title-input {
		font-size: var(--text-md);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		flex: 1;
		min-width: 0;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.milestone-title-input:hover {
		background: var(--color-surface-hover);
	}

	.milestone-title-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.milestone-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.milestone-description-input {
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.5;
		width: 100%;
		flex: 1;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.milestone-description-input:hover {
		background: var(--color-surface-hover);
	}

	.milestone-description-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}
</style>
