<script lang="ts">
	import type { Act } from '$lib/db/types.js';

	let { act, onUpdateAct, onDeleteAct } = $props<{
		act: Act;
		onUpdateAct?: (id: string, changes: Partial<Act>) => void;
		onDeleteAct?: (id: string) => void;
	}>();

	let editAct = $state({
		title: '',
		planningNotes: '',
	});

	$effect(() => {
		if (act) {
			editAct.title = act.title || '';
			editAct.planningNotes = act.planningNotes || '';
		}
	});

	function handleFieldUpdate(field: keyof typeof editAct, value: string) {
		(editAct as Record<string, unknown>)[field] = value;
		onUpdateAct?.(act.id, { [field]: value });
	}
</script>

<header class="act-header">
	<div class="header-left">
		<div class="title-row">
			<span class="act-ordinal">Act {act.order + 1}</span>
			<input
				type="text"
				class="act-title-input"
				bind:value={editAct.title}
				onchange={() => handleFieldUpdate('title', editAct.title)}
				placeholder="Untitled Act"
			/>
			<button class="delete-act-btn" onclick={() => onDeleteAct?.(act.id)} title="Delete act">&times;</button>
		</div>
	</div>
	<div class="header-right">
		<span class="field-label">Progression Summary</span>
		<textarea
			class="act-notes-input"
			bind:value={editAct.planningNotes}
			onchange={() => handleFieldUpdate('planningNotes', editAct.planningNotes)}
			placeholder="What does this act accomplish in the story?"
			rows="3"
		></textarea>
	</div>
</header>

<style>
	.act-header {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
		padding: var(--space-3) 0 var(--space-4);
		margin-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		align-items: stretch;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.title-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.act-ordinal {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.act-title-input {
		font-size: var(--text-xl);
		font-weight: var(--font-weight-bold);
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

	.act-title-input:hover {
		background: var(--color-surface-hover);
	}

	.act-title-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.delete-act-btn {
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

	.delete-act-btn:hover {
		color: var(--color-danger, #ef4444);
		background: var(--color-surface-hover);
	}

	.header-right {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding-top: var(--space-1);
	}

	.field-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wider);
		color: var(--color-text-muted);
	}

	.act-notes-input {
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.5;
		width: 100%;
		flex: 1;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.act-notes-input:hover {
		background: var(--color-surface-hover);
	}

	.act-notes-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}
</style>
