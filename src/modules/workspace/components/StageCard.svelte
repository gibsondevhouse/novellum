<script lang="ts">
	import type { Stage } from '$lib/db/types.js';
	import type { StatusOption } from '../types.js';
	import StatusDotDropdown from './StatusDotDropdown.svelte';

	let { stage, stageStatuses, onUpdateField, onDelete } = $props<{
		stage: Stage;
		stageStatuses: StatusOption[];
		onUpdateField: (field: keyof Stage, value: string) => void;
		onDelete: () => void;
	}>();
</script>

<div class="stage-row" data-status={stage.status}>
	<div class="stage-row-header">
		<StatusDotDropdown
			status={stage.status}
			statuses={stageStatuses}
			onSelect={(value) => onUpdateField('status', value)}
		/>
		<input
			type="text"
			class="stage-title-input"
			value={stage.title}
			oninput={(e) => onUpdateField('title', e.currentTarget.value)}
		/>
		<button class="delete-btn small" onclick={onDelete} title="Delete stage">&times;</button>
	</div>
	<textarea
		class="stage-desc-input"
		value={stage.description}
		oninput={(e) => onUpdateField('description', e.currentTarget.value)}
		placeholder="Stage details..."
		rows="2"
	></textarea>
</div>

<style>
	.stage-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		cursor: default;
		transition: border-color 0.2s ease;
		height: var(--card-row-height);
		overflow: hidden;
	}

	.stage-row:hover {
		border-color: var(--color-border-hover);
	}

	.stage-row-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.stage-title-input {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		flex: 1;
		min-width: 0;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.stage-title-input:hover {
		background: var(--color-surface-hover);
	}

	.stage-title-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.stage-desc-input {
		font-family: inherit;
		font-size: var(--text-xs);
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

	.stage-desc-input:hover {
		background: var(--color-surface-hover);
	}

	.stage-desc-input:focus {
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

	.delete-btn.small {
		font-size: var(--text-sm);
		align-self: flex-start;
		margin-top: var(--space-1);
	}
</style>
