<script lang="ts">
	import { untrack } from 'svelte';
	import type { Chapter, Scene, StoryFrame, Act } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import {
		createChapter,
		removeChapter,
		reorderChapters,
	} from '$modules/project/services/chapter-repository.js';
	import {
		createScene,
		removeScene,
		reorderScenes,
	} from '$modules/editor/services/scene-repository.js';
	import { toggleChapter } from '$modules/outliner/stores/outliner.svelte.js';
	import { computeMetrics } from '$modules/outliner/services/pacing-telemetry.js';
	import OutlinePlanningHeader from './OutlinePlanningHeader.svelte';
	import OutlineEmptyState from './OutlineEmptyState.svelte';
	import AddChapterForm from './AddChapterForm.svelte';
	import ActGroup from './ActGroup.svelte';
	import ChapterGroup from './ChapterGroup.svelte';

	let {
		storyFrame: _storyFrame,
		acts,
		chapters,
		projectId,
		onSelectChapter,
		onSelectScene,
		onSelectAct,
		onAddAct,
		onChaptersChange,
	} = $props<{
		storyFrame: StoryFrame;
		acts: Act[];
		chapters: ChapterWithScenes[];
		projectId: string;
		onSelectChapter: (chapter: Chapter) => void;
		onSelectScene: (scene: Scene) => void;
		onSelectAct: (act: Act) => void;
		onAddAct: (title: string) => void;
		onChaptersChange: (chapters: ChapterWithScenes[]) => void;
	}>();

	// eslint-disable-next-line svelte/prefer-writable-derived
	let localChapters = $state<ChapterWithScenes[]>(untrack(() => chapters));
	let addChapterActive = $state(false);
	let dragId = $state<string | null>(null);
	let dragOverIdx = $state<number | null>(null);

	$effect(() => {
		localChapters = chapters;
	});

	const metrics = $derived(computeMetrics(acts, localChapters));

	const unassignedChapters = $derived(localChapters.filter((ch) => !ch.actId));

	function chaptersForAct(actId: string): ChapterWithScenes[] {
		return localChapters.filter((ch) => ch.actId === actId);
	}

	async function handleAddChapter(title: string) {
		const ch = await createChapter({
			projectId,
			title,
			order: localChapters.length,
			summary: '',
			wordCount: 0,
		});
		const next: ChapterWithScenes[] = [...localChapters, { ...ch, scenes: [] }];
		localChapters = next;
		onChaptersChange(next);
		toggleChapter(ch.id);
	}

	async function handleAddScene(chapter: ChapterWithScenes, title: string) {
		const s = await createScene({
			chapterId: chapter.id,
			projectId,
			title,
			summary: '',
			content: '',
			wordCount: 0,
			order: chapter.scenes.length,
			povCharacterId: null,
			locationId: null,
			timelineEventId: null,
			characterIds: [],
			locationIds: [],
		});
		const next = localChapters.map((ch) =>
			ch.id === chapter.id ? { ...ch, scenes: [...ch.scenes, s] } : ch,
		);
		localChapters = next;
		onChaptersChange(next);
	}

	async function handleDeleteScene(chapter: ChapterWithScenes, sceneId: string) {
		await removeScene(sceneId);
		const next = localChapters.map((ch) =>
			ch.id === chapter.id ? { ...ch, scenes: ch.scenes.filter((s) => s.id !== sceneId) } : ch,
		);
		localChapters = next;
		onChaptersChange(next);
	}

	async function handleReorderScenes(chapter: ChapterWithScenes, ids: string[]) {
		await reorderScenes(chapter.id, ids);
		const next = localChapters.map((ch) => {
			if (ch.id !== chapter.id) return ch;
			const ordered = ids.map((id) => ch.scenes.find((s) => s.id === id)!).filter(Boolean);
			return { ...ch, scenes: ordered };
		});
		localChapters = next;
		onChaptersChange(next);
	}

	async function handleDeleteChapter(id: string) {
		const ch = localChapters.find((c) => c.id === id);
		if (ch) await Promise.all(ch.scenes.map((s) => removeScene(s.id)));
		await removeChapter(id);
		const next = localChapters.filter((c) => c.id !== id);
		localChapters = next;
		onChaptersChange(next);
	}

	function handleRenameChapter(id: string, title: string) {
		const next = localChapters.map((c) => (c.id === id ? { ...c, title } : c));
		localChapters = next;
		onChaptersChange(next);
	}

	function onDragStart(e: DragEvent, id: string) {
		dragId = id;
		e.dataTransfer?.setData('text/plain', id);
	}

	async function onDrop(i: number) {
		if (dragId === null) return;
		const from = localChapters.findIndex((c) => c.id === dragId);
		if (from === i) {
			dragId = null;
			dragOverIdx = null;
			return;
		}
		const arr = [...localChapters];
		const [item] = arr.splice(from, 1);
		arr.splice(i, 0, item);
		localChapters = arr;
		onChaptersChange(arr);
		await reorderChapters(
			projectId,
			arr.map((c) => c.id),
		);
		dragId = null;
		dragOverIdx = null;
	}
</script>

<div class="hierarchy-navigator" role="tree" aria-label="Story outline">
	<OutlinePlanningHeader
		chapterCount={localChapters.length}
		sceneCount={localChapters.reduce((n, ch) => n + ch.scenes.length, 0)}
		{metrics}
	/>

	{#if localChapters.length === 0 && !addChapterActive}
		<OutlineEmptyState onAddFirstChapter={() => (addChapterActive = true)} />
	{/if}

	{#if acts.length > 0}
		{#each acts as act (act.id)}
			<ActGroup
				{act}
				chapters={chaptersForAct(act.id)}
				selectedId={null}
				{onSelectChapter}
				{onSelectScene}
				{onSelectAct}
				onAddScene={handleAddScene}
				onDeleteScene={handleDeleteScene}
				onReorderScenes={handleReorderScenes}
			/>
		{/each}
		{#if unassignedChapters.length > 0}
			<div class="unassigned-group">
				<span class="unassigned-label">Unassigned</span>
				{#each unassignedChapters as chapter (chapter.id)}
					<ChapterGroup
						{chapter}
						selectedId={null}
						{onSelectChapter}
						{onSelectScene}
						onDelete={handleDeleteChapter}
						onRename={handleRenameChapter}
						onAddScene={(title) => handleAddScene(chapter, title)}
						onDeleteScene={(id) => handleDeleteScene(chapter, id)}
						onReorderScenes={(ids) => handleReorderScenes(chapter, ids)}
						{onDragStart}
					/>
				{/each}
			</div>
		{/if}
	{:else if localChapters.length > 0}
		<div class="chapter-list" role="list">
			{#each localChapters as chapter, i (chapter.id)}
				<div
					class="chapter-slot"
					class:drag-over={dragOverIdx === i}
					data-chapter-id={chapter.id}
					role="listitem"
					ondragover={(e) => {
						e.preventDefault();
						dragOverIdx = i;
					}}
					ondragleave={() => (dragOverIdx = null)}
					ondrop={() => onDrop(i)}
				>
					<ChapterGroup
						{chapter}
						selectedId={null}
						{onSelectChapter}
						{onSelectScene}
						onDelete={handleDeleteChapter}
						onRename={handleRenameChapter}
						onAddScene={(title) => handleAddScene(chapter, title)}
						onDeleteScene={(id) => handleDeleteScene(chapter, id)}
						onReorderScenes={(ids) => handleReorderScenes(chapter, ids)}
						{onDragStart}
					/>
				</div>
			{/each}
		</div>
	{/if}

	{#if localChapters.length > 0 || addChapterActive}
		<div class="add-chapter-row">
			<AddChapterForm onAdd={handleAddChapter} bind:active={addChapterActive} />
		</div>
	{/if}
	{#if acts.length === 0}
		<div class="add-act-row">
			<button class="btn-add-act" onclick={() => onAddAct('New Act')}>+ Add Act</button>
		</div>
	{/if}
</div>

<style>
	.hierarchy-navigator {
		display: flex;
		flex-direction: column;
	}

	.chapter-list {
		display: flex;
		flex-direction: column;
	}

	.chapter-slot.drag-over {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: 2px;
		border-radius: var(--radius-md);
	}

	.unassigned-group {
		margin-top: var(--space-3);
	}

	.unassigned-label {
		display: block;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		padding: var(--space-1) var(--space-2) var(--space-2);
	}

	.add-chapter-row {
		margin-top: var(--space-5);
	}

	.add-act-row {
		margin-top: var(--space-3);
	}

	.btn-add-act {
		background: none;
		border: 1px dashed var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-family: inherit;
		cursor: pointer;
		padding: var(--space-1) var(--space-3);
		transition:
			border-color 0.1s,
			color 0.1s;
	}

	.btn-add-act:hover {
		border-color: var(--color-border-default);
		color: var(--color-text-secondary);
	}

	.btn-add-act:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
