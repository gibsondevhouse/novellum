<script lang="ts">
	import { untrack } from 'svelte';
	import type { Act } from '$lib/db/types.js';

	let { act, onUpdate, onDelete } = $props<{
		act: Act;
		onUpdate: (patch: Partial<Omit<Act, 'id' | 'projectId' | 'createdAt'>>) => void;
		onDelete: (id: string) => void;
	}>();

	let title = $state(untrack(() => act.title));
	let planningNotes = $state(untrack(() => act.planningNotes));
	let editingTitle = $state(false);

	$effect(() => {
		title = act.title;
		planningNotes = act.planningNotes;
	});

	function saveTitle() {
		editingTitle = false;
		const t = title.trim();
		if (t && t !== act.title) onUpdate({ title: t });
		else title = act.title;
	}

	function handleTitleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') saveTitle();
		if (e.key === 'Escape') {
			editingTitle = false;
			title = act.title;
		}
	}

	function handleDelete() {
		if (confirm(`Delete "${act.title}"?`)) onDelete(act.id);
	}
</script>

<div class="act-panel">
	<div class="act-header">
		{#if editingTitle}
			<input
				class="title-input"
				type="text"
				bind:value={title}
				onblur={saveTitle}
				onkeydown={handleTitleKeydown}
				aria-label="Act title"
			/>
		{:else}
			<button class="title-btn" onclick={() => (editingTitle = true)} aria-label="Edit act title">
				{act.title}
			</button>
		{/if}
		<button class="delete-btn" onclick={handleDelete} aria-label="Delete act">✕</button>
	</div>

	<div class="field">
		<label class="field-label" for="act-notes">Planning Notes</label>
		<textarea
			id="act-notes"
			class="field-textarea"
			rows="4"
			placeholder="What must this act accomplish? Key plot movements, emotional arc…"
			bind:value={planningNotes}
			onblur={() => onUpdate({ planningNotes })}
		></textarea>
	</div>
</div>

<style>
	.act-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.act-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.title-btn {
		flex: 1;
		background: none;
		border: none;
		text-align: left;
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		transition: background 0.1s;
	}

	.title-btn:hover {
		background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
	}

	.title-input {
		flex: 1;
		background: var(--color-surface-ground);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		font-family: inherit;
		padding: var(--space-1) var(--space-2);
	}

	.title-input:focus {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.delete-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		transition:
			color 0.1s,
			background 0.1s;
	}

	.delete-btn:hover {
		color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.field-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.field-textarea {
		width: 100%;
		background: var(--color-surface-ground);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: inherit;
		line-height: 1.5;
		padding: var(--space-2) var(--space-3);
		resize: vertical;
		transition: border-color 0.1s;
	}

	.field-textarea:focus {
		outline: none;
		border-color: var(--color-border-default);
		box-shadow: var(--focus-ring);
	}
</style>
