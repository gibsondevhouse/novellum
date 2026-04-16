<script lang="ts">
	import type { BeatWithStages } from '../types.js';

	let { beat, selected, onSelect, onUpdateTitle, onUpdateNotes, onDelete } = $props<{
		beat: BeatWithStages;
		selected: boolean;
		onSelect: () => void;
		onUpdateTitle: (value: string) => void;
		onUpdateNotes: (value: string) => void;
		onDelete: () => void;
	}>();
</script>

<div class="beat-card" class:selected>
	<div class="beat-card-header">
		<input
			type="text"
			class="beat-title-input"
			value={beat.title}
			oninput={(e) => onUpdateTitle(e.currentTarget.value)}
			onclick={onSelect}
		/>
		<button class="delete-btn" onclick={onDelete} title="Delete beat">&times;</button>
	</div>
	<textarea
		class="beat-desc-input"
		value={beat.notes}
		oninput={(e) => onUpdateNotes(e.currentTarget.value)}
		placeholder="Describe this beat..."
		rows="2"
		onclick={() => { if (!selected) onSelect(); }}
	></textarea>
	<div class="stage-summary">
		{beat.stages.length} stage{beat.stages.length !== 1 ? 's' : ''}
	</div>
</div>

<style>
	.beat-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		height: var(--card-row-height);
		overflow: hidden;
	}

	.beat-card:hover {
		border-color: var(--color-border-hover);
		background: var(--color-surface-hover);
	}

	.beat-card.selected {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 1px var(--color-primary);
	}

	.beat-card-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.beat-title-input {
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

	.beat-title-input:hover {
		background: var(--color-surface-hover);
	}

	.beat-title-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.beat-desc-input {
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.5;
		width: calc(100% + var(--space-2));
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.beat-desc-input:hover {
		background: var(--color-surface-hover);
	}

	.beat-desc-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.delete-btn {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		cursor: pointer;
		padding: 0 var(--space-1);
		line-height: 1;
		border-radius: var(--radius-sm);
		transition: color var(--duration-base) var(--ease-standard);
		flex-shrink: 0;
	}

	.delete-btn:hover {
		color: var(--color-danger, #e53e3e);
	}

	.stage-summary {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-2);
	}
</style>
