<script lang="ts">
	import type { Arc, ArcStatus } from '$lib/db/types.js';
	import { ARC_STATUSES } from '../constants.js';

	let { arc, onUpdateArc, onDeleteArc } = $props<{
		arc: Arc;
		onUpdateArc?: (id: string, changes: Partial<Arc>) => void;
		onDeleteArc?: (id: string) => void;
	}>();

	let editArc = $state({
		title: '',
		arcType: '',
		purpose: '',
		description: '',
		status: 'planned' as ArcStatus,
		characterIds: [] as string[]
	});

	$effect(() => {
		if (arc) {
			editArc.title = arc.title || '';
			editArc.arcType = arc.arcType || '';
			editArc.purpose = arc.purpose || '';
			editArc.description = arc.description || '';
			editArc.status = arc.status || 'planned';
			editArc.characterIds = arc.characterIds || [];
		}
	});

	function handleFieldUpdate(field: keyof typeof editArc, value: string) {
		(editArc as Record<string, unknown>)[field] = value;
		onUpdateArc?.(arc.id, { [field]: value });
	}
</script>

<header class="arc-header split-panel">
	<div class="panel-left">
		<div class="title-row">
			<input type="text" class="arc-title-input" bind:value={editArc.title} onchange={() => handleFieldUpdate('title', editArc.title)} placeholder="Untitled Arc" />
			<input type="text" class="arc-type-input" bind:value={editArc.arcType} onchange={() => handleFieldUpdate('arcType', editArc.arcType)} placeholder="Type" />
			<button class="delete-arc-btn" onclick={() => onDeleteArc?.(arc.id)} title="Delete arc">&times;</button>
		</div>
		<textarea class="arc-purpose-input" bind:value={editArc.purpose} onchange={() => handleFieldUpdate('purpose', editArc.purpose)} placeholder="Arc Purpose..."></textarea>
		<div class="meta-row">
			<div class="meta-field">
				<span class="field-label">Status</span>
				<select class="arc-status-select" bind:value={editArc.status} onchange={() => handleFieldUpdate('status', editArc.status)}>
					{#each ARC_STATUSES as opt (opt.value)}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
			<div class="meta-field">
				<span class="field-label">Characters</span>
				<div class="character-chips">
					{#each editArc.characterIds as charId (charId)}
						<span class="character-chip active">{charId}</span>
					{/each}
					<button class="character-chip add-chip">Add +</button>
				</div>
			</div>
		</div>
	</div>
	<div class="panel-right">
		<span class="field-label">Description</span>
		<textarea class="arc-desc-input" bind:value={editArc.description} onchange={() => handleFieldUpdate('description', editArc.description)} placeholder="Arc Description..."></textarea>
	</div>
</header>

<style>
	.arc-header.split-panel {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
		padding: var(--space-3) 0 var(--space-4);
		margin-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		align-items: stretch;
	}

	.panel-left {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.title-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.delete-arc-btn {
		background: transparent;
		border: 1px solid transparent;
		color: var(--color-text-tertiary);
		font-size: var(--text-lg);
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		line-height: 1;
		transition: color 0.15s ease, background 0.15s ease;
	}

	.delete-arc-btn:hover {
		color: var(--color-danger, #ef4444);
		background: var(--color-surface-hover);
	}

	.panel-right {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding-top: var(--space-1);
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
		margin-top: var(--space-1);
	}

	.meta-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.arc-status-select {
		font-family: inherit;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		padding: 3px var(--space-2);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: border-color var(--duration-base) var(--ease-standard);
	}

	.arc-status-select:hover {
		border-color: var(--color-border-default);
	}

	.arc-status-select:focus {
		border-color: var(--color-border-focus);
		outline: none;
	}

	.character-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.character-chip {
		font-family: inherit;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		background: transparent;
		border: 1px solid var(--color-border-subtle);
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: all var(--duration-base) var(--ease-standard);
	}

	.character-chip:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-border-default);
	}

	.character-chip.active {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		color: var(--color-text-primary);
	}

	.add-chip {
		border-style: dashed;
		color: var(--color-text-muted);
		background: transparent;
	}

	.add-chip:hover {
		color: var(--color-text-primary);
		border-color: var(--color-border-default);
		background: var(--color-surface-hover);
	}

	.field-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.arc-title-input {
		font-size: var(--text-2xl);
		font-family: var(--font-display);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		border: 1px solid transparent;
		background: transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
		line-height: var(--leading-tight);
		flex: 1;
		min-width: 0;
	}

	.arc-type-input {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface-raised);
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
		width: auto;
		min-width: 72px;
		max-width: 120px;
		text-align: center;
		flex-shrink: 0;
		align-self: center;
	}

	.arc-purpose-input, .arc-desc-input {
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		border: 1px solid transparent;
		background: transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.6;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
		width: calc(100% + var(--space-2));
	}

	.arc-purpose-input {
		min-height: 2.4rem;
	}

	.arc-desc-input {
		min-height: 5rem;
		flex: 1;
		margin-left: 0;
		width: 100%;
	}

	.arc-title-input:hover,
	.arc-purpose-input:hover,
	.arc-desc-input:hover {
		background: var(--color-surface-hover);
	}

	.arc-type-input:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-border-default);
	}

	.arc-title-input:focus,
	.arc-type-input:focus,
	.arc-purpose-input:focus,
	.arc-desc-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}
</style>
