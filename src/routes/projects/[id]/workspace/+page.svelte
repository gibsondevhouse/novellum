<script lang="ts">
	import { untrack } from 'svelte';
	import type { Arc, Act, Scene, Character } from '$lib/db/types.js';
	import type { ArcType } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import {
		getActiveMode,
		getActiveSelectedId,
		nextMode,
		prevMode,
		selectItem,
		setMode,
		resetSelections,
	} from '$modules/workspace/stores/workspace-mode.svelte.js';
	import { createArc, updateArc, removeArc } from '$modules/outliner/services/arc-repository.js';
	import {
		createAct,
		updateAct,
		removeAct,
	} from '$modules/outliner/services/story-structure-service.js';
	import {
		createChapter,
		updateChapter,
		removeChapter,
	} from '$modules/project/services/chapter-repository.js';
	import {
		createScene,
		updateScene,
		removeScene,
	} from '$modules/editor/services/scene-repository.js';
	import WorkspaceHeroShell from '$modules/workspace/components/WorkspaceHeroShell.svelte';
	import WorkspaceHeroCard from '$modules/workspace/components/WorkspaceHeroCard.svelte';
	import WorkspaceDetailCard from '$modules/workspace/components/WorkspaceDetailCard.svelte';
	import EmptyDetailCard from '$modules/workspace/components/EmptyDetailCard.svelte';
	import StructureCarousel from '$modules/workspace/components/StructureCarousel.svelte';
	import { WORKSPACE_MODE_LABELS } from '$modules/workspace/types.js';

	let { data } = $props<{
		data: {
			projectId: string;
			arcs: Arc[];
			acts: Act[];
			chapters: ChapterWithScenes[];
			scenes: Scene[];
			characters: Character[];
		};
	}>();

	let arcs = $state<Arc[]>(untrack(() => data.arcs));
	let acts = $state<Act[]>(untrack(() => data.acts));
	let chapters = $state<ChapterWithScenes[]>(untrack(() => data.chapters));
	let scenes = $state<Scene[]>(untrack(() => data.scenes));
	let characters = $state<Character[]>(untrack(() => data.characters));

	let focusedArcType = $state<ArcType | null>(null);

	$effect(() => {
		setMode('arcs');
		resetSelections();
		focusedArcType = null;
	});

	const mode = $derived(getActiveMode());
	const selectedId = $derived(getActiveSelectedId());

	$effect(() => {
		mode;
		focusedArcType = null;
	});

	const heroSceneCount = $derived.by(() => {
		if (mode !== 'chapters' || !selectedId) return 0;
		const ch = chapters.find((c) => c.id === selectedId);
		return ch ? ch.scenes.length : 0;
	});

	const heroPovName = $derived.by(() => {
		if (mode !== 'scenes' || !selectedId) return null;
		const sc = scenes.find((s) => s.id === selectedId);
		if (!sc?.povCharacterId) return null;
		return characters.find((c) => c.id === sc.povCharacterId)?.name ?? null;
	});

	const heroItem = $derived.by((): Arc | Act | ChapterWithScenes | Scene | null => {
		if (!selectedId) return null;
		if (mode === 'arcs') return arcs.find((a) => a.id === selectedId) ?? null;
		if (mode === 'acts') return acts.find((a) => a.id === selectedId) ?? null;
		if (mode === 'chapters') return chapters.find((c) => c.id === selectedId) ?? null;
		return scenes.find((s) => s.id === selectedId) ?? null;
	});

	/* ── Collection items for active mode ── */
	type CollectionItem = { id: string; title: string; subtitle: string };

	const collectionItems = $derived.by((): CollectionItem[] => {
		if (mode === 'arcs')
			return arcs.map((a) => ({ id: a.id, title: a.title, subtitle: a.description || '' }));
		if (mode === 'acts')
			return acts.map((a) => ({
				id: a.id,
				title: a.title,
				subtitle: `Act ${a.order + 1}`,
			}));
		if (mode === 'chapters')
			return chapters.map((c) => ({
				id: c.id,
				title: c.title,
				subtitle: `${c.scenes.length} scene${c.scenes.length === 1 ? '' : 's'}`,
			}));
		return scenes.map((s) => ({
			id: s.id,
			title: s.title,
			subtitle: s.summary || '',
		}));
	});

	const railItems = $derived(collectionItems.map((i) => ({ id: i.id, title: i.title })));
	const activeIndex = $derived(railItems.findIndex((i) => i.id === selectedId));

	function handleNavigate(index: number) {
		const item = railItems[index];
		if (item) selectItem(mode, item.id);
	}

	/* ── CRUD handlers ── */
	async function handleCreate() {
		if (mode === 'arcs') {
			const arc = await createArc({
				projectId: data.projectId,
				title: `Arc ${arcs.length + 1}`,
				description: '',
				purpose: '',
				order: arcs.length,
			});
			arcs = [...arcs, arc];
			selectItem('arcs', arc.id);
		} else if (mode === 'acts') {
			const act = await createAct(data.projectId, `Act ${acts.length + 1}`, acts.length);
			acts = [...acts, act];
			selectItem('acts', act.id);
		} else if (mode === 'chapters') {
			const chapter = await createChapter({
				projectId: data.projectId,
				title: `Chapter ${chapters.length + 1}`,
				order: chapters.length,
				summary: '',
				wordCount: 0,
			});
			chapters = [...chapters, { ...chapter, scenes: [] }];
			selectItem('chapters', chapter.id);
		} else if (mode === 'scenes') {
			const firstChapter = chapters[0];
			if (!firstChapter) return;
			const scene = await createScene({
				projectId: data.projectId,
				chapterId: firstChapter.id,
				title: `Scene ${scenes.length + 1}`,
				summary: '',
				povCharacterId: null,
				locationId: null,
				timelineEventId: null,
				order: scenes.length,
				content: '',
				wordCount: 0,
				characterIds: [],
				locationIds: [],
			});
			scenes = [...scenes, scene];
			chapters = chapters.map((c) =>
				c.id === firstChapter.id ? { ...c, scenes: [...c.scenes, scene] } : c,
			);
			selectItem('scenes', scene.id);
		}
	}

	async function handleRename(id: string, newTitle: string) {
		if (mode === 'arcs') {
			await updateArc(id, { title: newTitle });
			arcs = arcs.map((a) => (a.id === id ? { ...a, title: newTitle } : a));
		} else if (mode === 'acts') {
			await updateAct(id, { title: newTitle });
			acts = acts.map((a) => (a.id === id ? { ...a, title: newTitle } : a));
		} else if (mode === 'chapters') {
			await updateChapter(id, { title: newTitle });
			chapters = chapters.map((c) => (c.id === id ? { ...c, title: newTitle } : c));
		} else if (mode === 'scenes') {
			await updateScene(id, { title: newTitle });
			scenes = scenes.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
			chapters = chapters.map((c) => ({
				...c,
				scenes: c.scenes.map((s) => (s.id === id ? { ...s, title: newTitle } : s)),
			}));
		}
	}

	async function handleDelete(id: string) {
		if (mode === 'arcs') {
			await removeArc(id);
			arcs = arcs.filter((a) => a.id !== id);
			if (selectedId === id) selectItem('arcs', null);
		} else if (mode === 'acts') {
			await removeAct(id);
			acts = acts.filter((a) => a.id !== id);
			if (selectedId === id) selectItem('acts', null);
		} else if (mode === 'chapters') {
			await removeChapter(id);
			chapters = chapters.filter((c) => c.id !== id);
			if (selectedId === id) selectItem('chapters', null);
		} else if (mode === 'scenes') {
			await removeScene(id);
			scenes = scenes.filter((s) => s.id !== id);
			chapters = chapters.map((c) => ({ ...c, scenes: c.scenes.filter((s) => s.id !== id) }));
			if (selectedId === id) selectItem('scenes', null);
		}
	}

	function handleSelectItem(id: string) {
		selectItem(mode, selectedId === id ? null : id);
	}

	async function handleUpdateArc(
		id: string,
		changes: Partial<{ title: string; description: string; arcType: ArcType }>,
	) {
		await updateArc(id, changes);
		arcs = arcs.map((a) => (a.id === id ? { ...a, ...changes } : a));
	}
</script>

<svelte:head>
	<title>Workspace — Novellum</title>
</svelte:head>

<div class="workspace-surface">
	<WorkspaceHeroShell
		activeMode={mode}
		onPrev={prevMode}
		onNext={nextMode}
		items={railItems}
		{activeIndex}
		onNavigate={handleNavigate}
		onCreate={handleCreate}
		{focusedArcType}
		onArcTypeFocus={(t) => (focusedArcType = t)}
	>
		<WorkspaceHeroCard {mode} {focusedArcType} />
	</WorkspaceHeroShell>

	{#if heroItem !== null}
		<WorkspaceDetailCard
			{mode}
			item={heroItem}
			projectId={data.projectId}
			sceneCount={heroSceneCount}
			povCharacterName={heroPovName}
			onUpdate={mode === 'arcs' ? handleUpdateArc : undefined}
		/>
	{:else}
		<EmptyDetailCard {mode} {focusedArcType} />
	{/if}

	<div class="collection-header">
		<span class="collection-label">
			{collectionItems.length}
			{WORKSPACE_MODE_LABELS[mode].toLowerCase()}
		</span>
	</div>

	<StructureCarousel
		items={collectionItems}
		{selectedId}
		{mode}
		onCreate={handleCreate}
		onSelect={handleSelectItem}
		onRename={handleRename}
		onDelete={handleDelete}
	/>
</div>

<style>
	.workspace-surface {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--space-6) var(--space-6) var(--space-10);
		min-height: 100%;
	}
	.collection-header {
		display: flex;
		align-items: center;
		padding: 0 var(--space-1);
	}
	.collection-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.4;
		user-select: none;
	}
	@media (max-width: 640px) {
		.workspace-surface {
			padding: var(--space-4) var(--space-4) var(--space-8);
		}
	}
</style>
