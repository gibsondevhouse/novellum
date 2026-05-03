<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Pencil from '@lucide/svelte/icons/pencil';
	import X from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import type { Scene } from '$lib/db/domain-types';
	import { GhostButton } from '$lib/components/ui/index.js';

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
			<GhostButton class="btn-icon btn-save" type="button" onclick={saveTitle} aria-label="Save">
				<Check class="btn-icon__glyph" aria-hidden="true" />
			</GhostButton>
		</div>
	{:else}
		<div class="scene-header">
			<GhostButton
				class="scene-title"
				type="button"
				onclick={() => onSelect(scene)}
				aria-label="Select scene: {scene.title}"
			>
				{scene.title}
			</GhostButton>
			{#if scene.wordCount > 0}
				<span class="wc-badge">{scene.wordCount}w</span>
			{/if}
			<div class="scene-actions" role="toolbar" aria-label="Scene actions">
				<GhostButton class="btn-icon" type="button" onclick={startEditing} aria-label="Rename scene">
					<Pencil class="btn-icon__glyph" aria-hidden="true" />
				</GhostButton>
				<GhostButton class="btn-icon btn-del" type="button" onclick={handleDelete} aria-label="Delete scene">
					<X class="btn-icon__glyph" aria-hidden="true" />
				</GhostButton>
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
		transition: background var(--duration-fast) var(--ease-standard);
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
		background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
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

	:global(.scene-title) {
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
		transition: color var(--duration-fast) var(--ease-standard);
		border-radius: var(--radius-sm);
	}

	:global(.scene-title:hover) {
		color: var(--color-text-primary);
	}

	.is-selected :global(.scene-title) {
		color: var(--color-text-primary);
		font-weight: var(--font-weight-medium);
	}

	:global(.scene-title:focus-visible) {
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
		box-shadow: var(--focus-ring);
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
		transition: opacity var(--duration-fast) var(--ease-standard);
	}

	.scene-row:hover .scene-actions,
	.scene-row:focus-within .scene-actions {
		opacity: 1;
	}

	:global(.btn-icon) {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: var(--space-1);
		border-radius: var(--radius-sm);
		line-height: 0;
		transition:
			color 0.1s,
			background 0.1s;
	}

	:global(.btn-icon__glyph) {
		width: 14px;
		height: 14px;
		stroke-width: 2;
	}

	:global(.btn-icon:hover) {
		color: var(--color-text-secondary);
		background: var(--color-surface-overlay);
	}

	:global(.btn-icon:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	:global(.btn-del:hover) {
		color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
	}

	:global(.btn-save) {
		color: var(--color-teal);
	}

	:global(.btn-save:hover) {
		color: var(--color-teal);
		background: color-mix(in srgb, var(--color-teal) 10%, transparent);
	}
</style>
