<script lang="ts">
	import { untrack } from 'svelte';
	import type { Beat } from '$lib/db/types.js';

	let { beat, index, onDelete, onSelect, onDragStart } = $props<{
		beat: Beat;
		index: number;
		onDelete: (id: string) => void;
		/** Primary action: opens the beat focus overlay. */
		onSelect?: (beat: Beat) => void;
		onDragStart: (e: DragEvent, id: string) => void;
	}>();

	function handleDelete() {
		if (confirm('Delete this beat?')) onDelete(beat.id);
	}
</script>

<div
	class="beat-item"
	draggable="true"
	role="listitem"
	ondragstart={(e) => {
		e.stopPropagation();
		onDragStart(e, beat.id);
	}}
>
	<span class="drag-handle" aria-hidden="true">⠿</span>
	<span class="beat-num" aria-hidden="true">{index + 1}</span>
	<button class="beat-text" onclick={() => onSelect?.(beat)}>{beat.title}</button>
	<button class="btn-delete" onclick={handleDelete} aria-label="Delete beat">✕</button>
</div>

<style>
	.beat-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-ground);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-subtle);
		transition: border-color 0.1s, background 0.1s;
	}

	.beat-item:hover {
		border-color: var(--color-border-default);
	}

	.drag-handle {
		color: var(--color-text-muted);
		cursor: grab;
		font-size: var(--text-sm);
		user-select: none;
		opacity: 0.4;
	}

	.beat-num {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		min-width: 18px;
		text-align: right;
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
		opacity: 0.55;
	}

	.beat-text {
		flex: 1;
		text-align: left;
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-family: inherit;
		cursor: pointer;
		padding: 0;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: color 0.1s;
	}

	.beat-text:hover {
		color: var(--color-text-primary);
	}

	.beat-text:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-sm);
	}

	.btn-delete {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: var(--text-xs);
		padding: 0 var(--space-1);
		opacity: 0;
		transition: opacity 0.1s, color 0.1s;
	}

	.beat-item:hover .btn-delete {
		opacity: 1;
	}

	.btn-delete:hover {
		color: var(--color-error);
	}

	.btn-delete:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		opacity: 1;
	}
</style>
