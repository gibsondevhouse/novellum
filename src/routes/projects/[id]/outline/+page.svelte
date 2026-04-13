<script lang="ts">
	import { untrack } from 'svelte';
	import type { Chapter, Scene } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import {
		createChapter,
		removeChapter,
		reorderChapters,
	} from '$modules/project/services/chapter-repository.js';
	import { removeScene } from '$modules/editor/services/scene-repository.js';
	import { setActiveProject, toggleChapter } from '$modules/outliner/stores/outliner.svelte.js';
	import ChapterGroup from '$modules/outliner/components/ChapterGroup.svelte';
	import AddChapterForm from '$modules/outliner/components/AddChapterForm.svelte';
	import OutlinePlanningHeader from '$modules/outliner/components/OutlinePlanningHeader.svelte';
	import OutlineDetailCard, {
		type OutlineSelection,
	} from '$modules/outliner/components/OutlineDetailCard.svelte';
	import OutlineEmptyState from '$modules/outliner/components/OutlineEmptyState.svelte';

	let { data } = $props<{ data: { projectId: string; chapters: ChapterWithScenes[] } }>();

	let chapters = $state<ChapterWithScenes[]>(untrack(() => data.chapters));
	let dragId = $state<string | null>(null);
	let dragOverIdx = $state<number | null>(null);
	let addChapterActive = $state(false);

	// ── Outline detail panel state ──────────────────────
	let selection = $state<OutlineSelection | null>(null);
	let panelWidth = $state(480);

	// ── Card vertical anchoring ──────────────────────────
	let workspaceEl = $state<HTMLDivElement | undefined>(undefined);
	let cardTopOffset = $state(0);

	function computeCardOffset() {
		if (!selection || !workspaceEl) {
			cardTopOffset = 0;
			return;
		}

		let chapterId: string;
		if (selection.type === 'chapter') {
			chapterId = selection.chapter.id;
		} else {
			const parent = chapters.find((c) => c.scenes.some((s) => s.id === (selection as Extract<OutlineSelection, { type: 'scene' }>).scene.id));
			chapterId = parent?.id ?? '';
		}

		if (!chapterId) {
			cardTopOffset = 0;
			return;
		}

		const slotEl = workspaceEl.querySelector<HTMLElement>(`[data-chapter-id="${chapterId}"]`);
		if (!slotEl) {
			cardTopOffset = 0;
			return;
		}

		const slotRect = slotEl.getBoundingClientRect();
		const workspaceRect = workspaceEl.getBoundingClientRect();
		const rawOffset = slotRect.top - workspaceRect.top;

		// Clamp so card always has at least 380px of visible height
		const maxOffset = window.innerHeight - 380;
		cardTopOffset = Math.max(0, Math.min(rawOffset, maxOffset > 0 ? maxOffset : 0));
	}

	$effect(() => {
		const currentSel = selection; // track selection changes
		if (currentSel !== null) {
			requestAnimationFrame(computeCardOffset);
		} else {
			cardTopOffset = 0;
		}
	});

	const selectedId = $derived(
		selection === null
			? null
			: selection.type === 'chapter'
				? selection.chapter.id
				: selection.scene.id,
	);

	$effect(() => {
		setActiveProject(data.projectId);
		return () => setActiveProject(null);
	});

	function handleSelectChapter(chapter: Chapter) {
		selection = { type: 'chapter', chapter };
	}

	function handleSelectScene(scene: Scene) {
		selection = { type: 'scene', scene };
	}

	function handleChapterUpdate(
		id: string,
		data: Partial<Omit<Chapter, 'id' | 'createdAt'>>,
	) {
		chapters = chapters.map((c) => (c.id === id ? { ...c, ...data } : c));
		if (selection?.type === 'chapter' && selection.chapter.id === id) {
			selection = { type: 'chapter', chapter: { ...selection.chapter, ...data } };
		}
	}

	function handleSceneUpdate(id: string, data: Partial<Omit<Scene, 'id' | 'createdAt'>>) {
		if (selection?.type === 'scene' && selection.scene.id === id) {
			selection = { type: 'scene', scene: { ...selection.scene, ...data } };
		}
	}

	async function handleAddChapter(title: string) {
		const ch = await createChapter({
			projectId: data.projectId,
			title,
			order: chapters.length,
			summary: '',
			wordCount: 0,
		});
		const newChapter: ChapterWithScenes = { ...ch, scenes: [] };
		chapters = [...chapters, newChapter];
		// Auto-expand new chapter so user can immediately add scenes
		toggleChapter(ch.id);
	}

	async function handleChapterDelete(id: string) {
		const ch = chapters.find((c) => c.id === id);
		if (ch) await Promise.all(ch.scenes.map((s) => removeScene(s.id)));
		await removeChapter(id);
		chapters = chapters.filter((c) => c.id !== id);
	}

	function handleChapterRename(id: string, title: string) {
		chapters = chapters.map((c) => (c.id === id ? { ...c, title } : c));
	}

	function onDragStart(e: DragEvent, id: string) {
		dragId = id;
		e.dataTransfer?.setData('text/plain', id);
	}

	async function onDrop(i: number) {
		if (dragId === null) return;
		const from = chapters.findIndex((c) => c.id === dragId);
		if (from === i) {
			dragId = null;
			dragOverIdx = null;
			return;
		}
		const arr = [...chapters];
		const [item] = arr.splice(from, 1);
		arr.splice(i, 0, item);
		chapters = arr;
		await reorderChapters(
			data.projectId,
			arr.map((c) => c.id),
		);
		dragId = null;
		dragOverIdx = null;
	}
</script>

<svelte:head>
	<title>Outline — Novellum</title>
</svelte:head>

<div class="outline-workspace" class:is-split={selection !== null} bind:this={workspaceEl}>
	<div class="structure-panel">
		<!-- Planning header: always visible, shows structure stats -->
		<OutlinePlanningHeader
			chapterCount={chapters.length}
			sceneCount={chapters.reduce((acc, ch) => acc + ch.scenes.length, 0)}
		/>

		<!-- Empty state: shown only when no chapters exist -->
		{#if chapters.length === 0 && !addChapterActive}
			<OutlineEmptyState onAddFirstChapter={() => (addChapterActive = true)} />
		{/if}

		<!-- Chapter groups -->
		{#if chapters.length > 0}
			<div class="chapter-list" role="list">
				{#each chapters as chapter, i (chapter.id)}
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
							onDelete={handleChapterDelete}
							onRename={handleChapterRename}
							onSelectChapter={handleSelectChapter}
							onSelectScene={handleSelectScene}
							{selectedId}
							{onDragStart}
						/>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Add chapter action — shown once chapters exist or form was triggered -->
		{#if chapters.length > 0 || addChapterActive}
			<div class="add-chapter-row">
				<AddChapterForm onAdd={handleAddChapter} bind:active={addChapterActive} />
			</div>
		{/if}
	</div>

	{#if selection !== null}
		<OutlineDetailCard
			{selection}
			topOffset={cardTopOffset}
			width={panelWidth}
			onClose={() => (selection = null)}
			onWidthChange={(w) => (panelWidth = w)}
			onChapterUpdate={handleChapterUpdate}
			onSceneUpdate={handleSceneUpdate}
		/>
	{/if}
</div>

<style>
	/* ── Workspace root ── */
	.outline-workspace {
		display: flex;
		min-height: 100%;
	}

	/* Single mode: full centered column */
	.outline-workspace:not(.is-split) {
		flex-direction: column;
	}

	/* Split mode: stable two-column master-detail */
	.outline-workspace.is-split {
		align-items: flex-start;
	}

	/* ── Structure panel ── */
	.structure-panel {
		padding: var(--space-6) var(--space-6) var(--space-10);
	}

	/* Single mode: center with max-width */
	.outline-workspace:not(.is-split) .structure-panel {
		max-width: 1000px;
		margin: 0 auto;
		width: 100%;
	}

	/* Split mode: take remaining flex space, reduce right padding near card */
	.outline-workspace.is-split .structure-panel {
		flex: 1;
		min-width: 0;
		padding-right: var(--space-4);
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

	.add-chapter-row {
		margin-top: var(--space-5);
	}

	@media (max-width: 640px) {
		.structure-panel {
			padding: var(--space-4) var(--space-4) var(--space-8);
		}
	}
</style>
