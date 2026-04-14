<script lang="ts">
	import { untrack } from 'svelte';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import type { Chapter, Scene } from '$lib/db/types.js';
	import { updateChapter } from '$modules/project/services/chapter-repository.js';
	import { updateScene } from '$modules/editor/services/scene-repository.js';
	import {
		getExpandedChapterIds,
		toggleChapter,
	} from '$modules/outliner/stores/outliner.svelte.js';
	import PacingSignal from './PacingSignal.svelte';
	import SceneRow from './SceneRow.svelte';
	import AddSceneForm from './AddSceneForm.svelte';

	let {
		chapter,
		onDelete,
		onRename,
		onSelectChapter,
		onSelectScene,
		selectedId,
		onDragStart,
		onAddScene,
		onDeleteScene,
		onReorderScenes,
	} = $props<{
		chapter: ChapterWithScenes;
		onDelete?: (id: string) => void;
		onRename?: (id: string, title: string) => void;
		onSelectChapter: (chapter: Chapter) => void;
		onSelectScene: (scene: Scene) => void;
		selectedId: string | null;
		onDragStart?: (e: DragEvent, id: string) => void;
		onAddScene?: (title: string) => void;
		onDeleteScene?: (id: string) => void;
		onReorderScenes?: (ids: string[]) => void;
	}>();

	// eslint-disable-next-line svelte/prefer-writable-derived
	let scenes = $state<Scene[]>(untrack(() => chapter.scenes));
	let editing = $state(false);
	let draft = $state(untrack(() => chapter.title));
	let titleInputEl = $state<HTMLInputElement | undefined>(undefined);
	let sceneDragId = $state<string | null>(null);
	let sceneDragOverIdx = $state<number | null>(null);

	const expanded = $derived(getExpandedChapterIds().has(chapter.id));

	const scenePacingSparsity = $derived<'healthy' | 'sparse' | 'very-sparse'>(
		scenes.length === 0 ? 'very-sparse' : scenes.length === 1 ? 'sparse' : 'healthy',
	);

	$effect(() => {
		scenes = chapter.scenes;
	});

	$effect(() => {
		if (editing && titleInputEl) titleInputEl.focus();
	});

	$effect(() => {
		if (!editing) draft = chapter.title;
	});

	function startEditing(e: Event) {
		e.stopPropagation();
		draft = chapter.title;
		editing = true;
	}

	function saveTitle() {
		editing = false;
		const t = draft.trim();
		if (t && t !== chapter.title) {
			updateChapter(chapter.id, { title: t });
			onRename?.(chapter.id, t);
		} else {
			draft = chapter.title;
		}
	}

	function handleTitleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') saveTitle();
		if (e.key === 'Escape') {
			editing = false;
			draft = chapter.title;
		}
	}

	function handleDelete(e: Event) {
		e.stopPropagation();
		if (confirm(`Delete "${chapter.title}" and all its scenes?`)) onDelete?.(chapter.id);
	}

	function handleAddScene(title: string) {
		onAddScene?.(title);
	}

	function deleteScene(id: string) {
		onDeleteScene?.(id);
		scenes = scenes.filter((s) => s.id !== id);
	}

	async function renameScene(id: string, title: string) {
		await updateScene(id, { title });
		scenes = scenes.map((s) => (s.id === id ? { ...s, title } : s));
	}

	function onSceneDragStart(e: DragEvent, id: string) {
		sceneDragId = id;
		e.dataTransfer?.setData('text/plain', id);
	}

	function onSceneDrop(i: number) {
		if (sceneDragId === null) return;
		const from = scenes.findIndex((s) => s.id === sceneDragId);
		if (from === i) {
			sceneDragId = null;
			sceneDragOverIdx = null;
			return;
		}
		const arr = [...scenes];
		const [item] = arr.splice(from, 1);
		arr.splice(i, 0, item);
		scenes = arr;
		onReorderScenes?.(arr.map((s) => s.id));
		sceneDragId = null;
		sceneDragOverIdx = null;
	}
</script>

<div
	class="chapter-group"
	class:is-expanded={expanded}
	class:is-selected={selectedId === chapter.id}
	draggable={onDragStart !== undefined}
	role="listitem"
	ondragstart={(e) => {
		e.stopPropagation();
		onDragStart?.(e, chapter.id);
	}}
>
	<div class="chapter-header">
		<!-- Expand/collapse chevron — separate from selection -->
		<button
			class="expand-btn"
			onclick={(e) => {
				e.stopPropagation();
				toggleChapter(chapter.id);
			}}
			aria-expanded={expanded}
			aria-label="{expanded ? 'Collapse' : 'Expand'} chapter"
		>
			<span class="expand-icon" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
		</button>

		{#if editing}
			<input
				bind:this={titleInputEl}
				class="title-input"
				type="text"
				bind:value={draft}
				onblur={saveTitle}
				onkeydown={handleTitleKeydown}
			/>
		{:else}
			<!-- Primary select target: title + count -->
			<button
				class="chapter-select"
				onclick={() => onSelectChapter(chapter)}
				aria-label="Select chapter: {chapter.title}"
			>
				<span class="chapter-title">{chapter.title}</span>
				<span class="scene-count">{scenes.length} {scenes.length === 1 ? 'scene' : 'scenes'}</span>
				{#if scenePacingSparsity !== 'healthy'}
					<PacingSignal
						sparsity={scenePacingSparsity}
						label={scenes.length === 0 ? 'No scenes yet' : 'Could use more scenes'}
					/>
				{/if}
			</button>
		{/if}

		<!-- Quiet utility cluster — only visible on hover -->
		<div class="chapter-utils" role="toolbar" aria-label="Chapter actions">
			<button class="util-btn" onclick={startEditing} aria-label="Rename chapter" title="Rename"
				>✎</button
			>
			<button
				class="util-btn util-btn--danger"
				onclick={handleDelete}
				aria-label="Delete chapter"
				title="Delete">✕</button
			>
		</div>
	</div>

	{#if expanded}
		<div class="scene-region">
			<div class="scene-list" role="list">
				{#each scenes as scene, i (scene.id)}
					<div
						class="scene-slot"
						class:drag-over={sceneDragOverIdx === i}
						role="listitem"
						ondragover={(e) => {
							e.preventDefault();
							sceneDragOverIdx = i;
						}}
						ondragleave={() => (sceneDragOverIdx = null)}
						ondrop={() => onSceneDrop(i)}
					>
						<SceneRow
							{scene}
							onDelete={deleteScene}
							onRename={renameScene}
							onSelect={onSelectScene}
							isSelected={scene.id === selectedId}
							onDragStart={onSceneDragStart}
						/>
					</div>
				{/each}
			</div>
			<div class="add-scene-row">
				<AddSceneForm onAdd={handleAddScene} />
			</div>
		</div>
	{/if}
</div>

<style>
	/* ── Group container ── */
	.chapter-group {
		border: 1px solid var(--color-border-subtle);
		border-left: 3px solid color-mix(in srgb, var(--color-teal) 35%, transparent);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-4);
		background: var(--color-surface-overlay);
		transition:
			border-color 0.15s ease,
			border-left-color 0.15s ease,
			background 0.15s ease;
	}

	.chapter-group:hover {
		border-color: var(--color-border-default);
		border-left-color: color-mix(in srgb, var(--color-teal) 70%, transparent);
	}

	.chapter-group.is-expanded {
		border-left-color: var(--color-teal);
	}

	.chapter-group.is-selected {
		border-left-color: var(--color-teal);
		border-color: color-mix(in srgb, var(--color-teal) 45%, transparent);
		background: color-mix(in srgb, var(--color-teal) 10%, var(--color-surface-overlay));
		/* Soft right-side glow — visual hint toward the card */
		box-shadow:
			0 2px 12px rgba(0, 0, 0, 0.35),
			2px 0 0 color-mix(in srgb, var(--color-teal) 18%, transparent);
	}

	/* ── Chapter header ── */
	.chapter-header {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3) var(--space-2) var(--space-2);
		user-select: none;
		border-radius: calc(var(--radius-md) - 1px) calc(var(--radius-md) - 1px) 0 0;
	}

	.is-expanded .chapter-header {
		border-bottom: 1px solid var(--color-border-subtle);
	}

	/* ── Expand-only button ── */
	.expand-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		flex-shrink: 0;
		transition:
			color 0.1s,
			background 0.1s;
	}

	.expand-btn:hover {
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
	}

	.expand-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* ── Chapter select button (primary action) ── */
	.chapter-select {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		flex: 1;
		min-width: 0;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		padding: var(--space-1) var(--space-2);
		color: inherit;
		border-radius: var(--radius-sm);
		transition: background 0.1s ease;
	}

	.chapter-select:hover {
		background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
	}

	.chapter-select:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.is-selected .chapter-select {
		background: transparent;
	}

	/* ── Expand icon ── */
	.expand-icon {
		font-size: 0.6rem;
		color: var(--color-text-muted);
		pointer-events: none;
		user-select: none;
		flex-shrink: 0;
		transition: color 0.12s;
	}

	.chapter-group.is-expanded .expand-icon {
		color: var(--color-teal);
	}

	/* ── Chapter title ── */
	.chapter-title {
		flex: 1;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		letter-spacing: var(--tracking-tight);
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		pointer-events: none;
	}

	.is-selected .chapter-title {
		color: color-mix(in srgb, var(--color-teal) 85%, var(--color-text-primary));
	}

	/* ── Scene count (inside select button) ── */
	.scene-count {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		flex-shrink: 0;
		white-space: nowrap;
		pointer-events: none;
	}

	/* ── Title edit input ── */
	.title-input {
		flex: 1;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-nova-blue);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		padding: var(--space-1) var(--space-2);
	}

	.title-input:focus {
		outline: none;
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-nova-blue) 25%, transparent);
	}

	/* ── Utility actions ── */
	.chapter-utils {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
		opacity: 0;
		transition: opacity 0.12s;
	}

	.chapter-group:hover .chapter-utils,
	.chapter-group:focus-within .chapter-utils {
		opacity: 1;
	}

	.util-btn {
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

	.util-btn:hover {
		color: var(--color-text-secondary);
		background: var(--color-surface-elevated);
	}

	.util-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.util-btn--danger:hover {
		color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
	}

	/* ── Scene region ── */
	.scene-region {
		padding: var(--space-2) var(--space-3) var(--space-3) var(--space-7);
	}

	.scene-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.scene-slot.drag-over {
		outline: 2px solid var(--color-teal);
		outline-offset: 1px;
		border-radius: var(--radius-sm);
	}

	/* ── Add scene row ── */
	.add-scene-row {
		margin-top: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
	}
</style>
