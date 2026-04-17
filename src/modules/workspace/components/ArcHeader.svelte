<script lang="ts">
	import type { Arc, ArcStatus, ArcType } from '$lib/db/types.js';
	import { ARC_STATUSES, CORE_ARC_TYPES } from '../constants.js';

	let { arc, onUpdateArc, onDeleteArc } = $props<{
		arc: Arc;
		onUpdateArc?: (id: string, changes: Partial<Arc>) => void;
		onDeleteArc?: (id: string) => void;
	}>();

	let editArc = $state({
		title: '',
		arcType: '' as ArcType | '',
		purpose: '',
		description: '',
		status: 'planned' as ArcStatus,
		characterIds: [] as string[]
	});

	let typePicker = $state(false);
	let customInput = $state(false);
	let customValue = $state('');

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

	const arcTypeLabel = $derived.by(() => {
		const t = editArc.arcType;
		if (!t) return null;
		if (t.startsWith('custom:')) return t.slice(7);
		return CORE_ARC_TYPES.find((o) => o.value === t)?.label ?? null;
	});

	function handleFieldUpdate(field: keyof typeof editArc, value: string) {
		(editArc as Record<string, unknown>)[field] = value;
		onUpdateArc?.(arc.id, { [field]: value });
	}

	function selectArcType(value: ArcType) {
		editArc.arcType = value;
		typePicker = false;
		customInput = false;
		onUpdateArc?.(arc.id, { arcType: value });
	}

	function submitCustomType() {
		const trimmed = customValue.trim();
		if (!trimmed) return;
		selectArcType(`custom:${trimmed}` as ArcType);
		customValue = '';
	}
</script>

<header class="arc-header split-panel">
	<div class="panel-left">
		<div class="title-row">
			<input type="text" class="arc-title-input" bind:value={editArc.title} onchange={() => handleFieldUpdate('title', editArc.title)} placeholder="Untitled Arc" />
			<div class="type-picker-anchor">
				<button
					class="arc-type-pill"
					class:arc-type-pill--set={!!editArc.arcType}
					onclick={() => { typePicker = !typePicker; customInput = false; }}
					aria-label="Set arc type"
					aria-expanded={typePicker}
				>
					{arcTypeLabel ?? 'Set type\u2026'}
				</button>
				{#if typePicker}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="type-picker-backdrop" onclick={() => { typePicker = false; customInput = false; }}></div>
					<div class="type-picker" role="dialog" aria-label="Choose arc type">
						<p class="type-picker__label">Arc Type</p>
						<div class="type-picker__list">
							{#each CORE_ARC_TYPES as t (t.value)}
								<button
									class="type-option"
									class:type-option--active={editArc.arcType === t.value}
									onclick={() => selectArcType(t.value)}
								>
									<span class="type-option__label">{t.label}</span>
									<span class="type-option__desc">{t.description}</span>
								</button>
							{/each}
						</div>
						<div class="type-picker__custom">
							{#if customInput}
								<form class="custom-input-row" onsubmit={(e) => { e.preventDefault(); submitCustomType(); }}>
									<input
										type="text"
										class="custom-type-input"
										bind:value={customValue}
										placeholder="e.g. Spiritual, Political"
									/>
									<button type="submit" class="custom-submit-btn" disabled={!customValue.trim()}>Add</button>
								</form>
							{:else}
								<button class="custom-toggle-btn" onclick={() => { customInput = true; }}>+ Custom type</button>
							{/if}
						</div>
					</div>
				{/if}
			</div>
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

	.type-picker-anchor {
		position: relative;
		flex-shrink: 0;
		align-self: center;
	}

	.arc-type-pill {
		font-family: inherit;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		border: 1px dashed var(--color-border-subtle);
		background: transparent;
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: all var(--duration-base) var(--ease-standard);
		min-width: 72px;
		text-align: center;
	}

	.arc-type-pill--set {
		border-style: solid;
		background: var(--color-surface-raised);
		color: var(--color-text-secondary);
	}

	.arc-type-pill:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-border-default);
		color: var(--color-text-primary);
	}

	.type-picker-backdrop {
		position: fixed;
		inset: 0;
		z-index: 90;
	}

	.type-picker {
		position: absolute;
		top: calc(100% + var(--space-2));
		left: 0;
		z-index: 91;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		min-width: 280px;
		box-shadow: var(--shadow-lg, 0 4px 16px rgba(0,0,0,.25));
	}

	.type-picker__label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		margin: 0 0 var(--space-2);
	}

	.type-picker__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.type-option {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--space-2);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		transition: all var(--duration-base) var(--ease-standard);
	}

	.type-option:hover {
		background: var(--color-surface-hover);
	}

	.type-option--active {
		background: var(--color-surface-sunken);
		border-color: var(--color-border-focus);
	}

	.type-option__label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.type-option__desc {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: 1.4;
	}

	.type-picker__custom {
		margin-top: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
	}

	.custom-toggle-btn {
		font-family: inherit;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		background: transparent;
		border: none;
		cursor: pointer;
		padding: var(--space-1) 0;
		transition: color var(--duration-base) var(--ease-standard);
	}

	.custom-toggle-btn:hover {
		color: var(--color-text-primary);
	}

	.custom-input-row {
		display: flex;
		gap: var(--space-2);
	}

	.custom-type-input {
		flex: 1;
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		background: var(--color-surface-sunken);
		border: 1px solid var(--color-border-subtle);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.custom-type-input:focus {
		border-color: var(--color-border-focus);
		outline: none;
	}

	.custom-submit-btn {
		font-family: inherit;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all var(--duration-base) var(--ease-standard);
	}

	.custom-submit-btn:hover:not(:disabled) {
		background: var(--color-surface-hover);
		border-color: var(--color-border-default);
	}

	.custom-submit-btn:disabled {
		opacity: 0.4;
		cursor: default;
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

	.arc-title-input:focus,
	.arc-purpose-input:focus,
	.arc-desc-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}
</style>
