<script lang="ts">
	import { untrack } from 'svelte';
	import type { Scene } from '$lib/db/types.js';

	let { scene, onDelete, onRename, onSelect, isSelected, onDragStart } = $props<{
		scene: Scene;
		onDelete: (id: string) => void;
		onRename: (id: string, title: string) => void;
		onSelect: (scene: Scene) => void;
		isSelected: boolean;
		onDragStart: (e: DragEvent, id: string) => void;
	}>();

	let editing = $state(false);
	let draft = $state(untrack(() => scene.title));
	let inputEl = $state<HTMLInputElement | undefined>(undefined);

	$effect(() => {
		if (!editing) draft = scene.title;
	});

	$effect(() => {
		if (editing && inputEl) inputEl.focus();
	});

	function startEditing(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		draft = scene.title;
		editing = true;
	}

	function saveTitle() {
		editing = false;
		const t = draft.trim();
		if (t && t !== scene.title) onRename(scene.id, t);
		else draft = scene.title;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') saveTitle();
		if (e.key === 'Escape') {
			editing = false;
			draft = scene.title;
		}
	}

	function handleDelete(e: Event) {
		e.stopPropagation();
		if (confirm(`Delete scene "${scene.title}"?`)) onDelete(scene.id);
	}

	const _editorHref = $derived(`/projects/${scene.projectId}/editor/${scene.id}`);

	const summary = $derived(
		scene.summary ? scene.summary.slice(0, 100) + (scene.summary.length > 100 ? '…' : '') : '',
	);
</script>

<div
	class="scene-row"
	class:is-selected={isSelected}
	draggable="true"
	role="listitem"
	ondragstart={(e) => {
		e.stopPropagation();
		onDragStart(e, scene.id);
	}}
>
	{#if editing}
		<div class="scene-header scene-header--editing">
			<input
				bind:this={inputEl}
				class="title-edit"
				type="text"
				bind:value={draft}
				onblur={saveTitle}
				onkeydown={handleKeydown}
			/>
			<button class="btn-icon btn-save" onclick={saveTitle} aria-label="Save">✓</button>
		</div>
	{:else}
		<div class="scene-header">
			<button
				class="scene-title"
				onclick={() => onSelect(scene)}
				aria-label="Select scene: {scene.title}"
			>
				{scene.title}
			</button>
			{#if scene.wordCount > 0}
				<span class="wc-badge">{scene.wordCount}w</span>
			{/if}
			<div class="scene-actions" role="toolbar" aria-label="Scene actions">
				<button class="btn-icon" onclick={startEditing} aria-label="Rename scene">✎</button>
				<button class="btn-icon btn-del" onclick={handleDelete} aria-label="Delete scene">✕</button>
			</div>
		</div>
		{#if summary}
			<p class="scene-summary">{summary}</p>
		{/if}
	{/if}
</div>

<style>
	/* ── Scene row ─ flat row inside chapter group ── */
	.scene-row {
		border-radius: var(--radius-sm);
		overflow: hidden;
		transition: background 0.1s ease;
	}

	.scene-row.is-selected {
		background: color-mix(in srgb, var(--color-nova-blue) 13%, transparent);
		border-left: 2px solid var(--color-nova-blue);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
		margin-left: -2px;
		padding-left: 2px;
	}

	.scene-row.is-selected:hover {
		background: color-mix(in srgb, var(--color-nova-blue) 17%, transparent);
	}

	.scene-row:hover {
		background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
	}

	.scene-row:focus-within {
		background: color-mix(in srgb, var(--color-nova-blue) 5%, transparent);
	}

	.scene-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
		min-height: 32px;
	}

	.scene-header--editing {
		padding: var(--space-2);
	}

	.scene-title {
		flex: 1;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		padding: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-secondary);
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: color 0.12s ease;
		border-radius: var(--radius-sm);
	}

	.scene-title:hover {
		color: var(--color-text-primary);
	}

	.is-selected .scene-title {
		color: var(--color-text-primary);
		font-weight: var(--font-weight-medium);
	}

	.scene-title:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.title-edit {
		flex: 1;
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-nova-blue);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		padding: 2px var(--space-2);
	}

	.title-edit:focus {
		outline: none;
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-nova-blue) 25%, transparent);
	}

	.wc-badge {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.scene-summary {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		padding: 0 var(--space-2) var(--space-1) calc(var(--space-2) + 18px);
		margin: 0;
	}

	.scene-actions {
		display: flex;
		gap: 2px;
		margin-left: auto;
		flex-shrink: 0;
		opacity: 0;
		transition: opacity 0.12s ease;
	}

	.scene-row:hover .scene-actions,
	.scene-row:focus-within .scene-actions {
		opacity: 1;
	}

	.btn-icon {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		line-height: 1;
		transition:
			color 0.1s,
			background 0.1s;
	}

	.btn-icon:hover {
		color: var(--color-text-secondary);
		background: var(--color-surface-overlay);
	}

	.btn-icon:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.btn-del:hover {
		color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
	}

	.btn-save {
		color: var(--color-teal);
	}

	.btn-save:hover {
		color: var(--color-teal);
		background: color-mix(in srgb, var(--color-teal) 10%, transparent);
	}
</style>
