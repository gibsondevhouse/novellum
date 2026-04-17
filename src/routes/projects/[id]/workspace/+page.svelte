<script lang="ts">
	import { untrack } from 'svelte';
	import type { Arc, Act, Scene, Character, Beat, Stage, Milestone } from '$lib/db/types.js';
	import type { ArcType } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import {
		getActiveMode,
		getActiveSelectedId,
		selectItem,
		setMode,
		resetSelections,
	} from '$modules/workspace/stores/workspace-mode.svelte.js';
	import { createArc, updateArc, removeArc } from '$modules/outliner/services/arc-repository.js';
	import {
		createAct,
		updateAct,
		removeAct,
		createMilestone as createMilestoneApi,
		updateMilestone as updateMilestoneApi,
		removeMilestone as removeMilestoneApi,
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
	import {
		createBeat,
		updateBeat,
		removeBeat,
	} from '$modules/editor/services/beat-repository.js';
	import {
		createStage,
		updateStage as updateStageApi,
		removeStage,
	} from '$modules/editor/services/stage-repository.js';
	import WorkspaceHelpModal from '$modules/workspace/components/WorkspaceHelpModal.svelte';
	import StructureCarousel from '$modules/workspace/components/StructureCarousel.svelte';
	import ArcWorkspace from '$modules/workspace/components/ArcWorkspace.svelte';
	import ActsWorkspace from '$modules/workspace/components/ActsWorkspace.svelte';
	import ChaptersWorkspace from '$modules/workspace/components/ChaptersWorkspace.svelte';
	import { WORKSPACE_MODE_LABELS } from '$modules/workspace/types.js';

	let { data } = $props<{

		data: {
			projectId: string;
			arcs: Arc[];
			acts: Act[];
			milestones: Milestone[];
			chapters: ChapterWithScenes[];
			scenes: Scene[];
			characters: Character[];
			beats: Beat[];
			stages: Stage[];
		};
	}>();

	let arcs = $state<Arc[]>(untrack(() => data.arcs));
	let acts = $state<Act[]>(untrack(() => data.acts));
	let milestones = $state<Milestone[]>(untrack(() => data.milestones));
	let chapters = $state<ChapterWithScenes[]>(untrack(() => data.chapters));
	let scenes = $state<Scene[]>(untrack(() => data.scenes));
	let characters = $state<Character[]>(untrack(() => data.characters));
	let beats = $state<Beat[]>(untrack(() => data.beats));
	let stages = $state<Stage[]>(untrack(() => data.stages));

	let focusedArcType = $state<ArcType | null>(null);
	let showHelp = $state(false);

	// One-time initialization — runs at component creation, NOT inside $effect
	// (Writing to $state inside $effect during mount poisons the Svelte 5 reactive graph)
	setMode('arcs');
	resetSelections();

	$effect(() => {
		if (arcs.length > 0) {
			selectItem('arcs', arcs[0].id);
		}
	});

	const mode = $derived(getActiveMode());
	const selectedId = $derived(getActiveSelectedId());

	// Auto-select first item when mode changes or collection changes and nothing is selected
	$effect(() => {
		const items = mode === 'arcs' ? arcs : mode === 'acts' ? acts : mode === 'chapters' ? chapters : scenes;
		if (!selectedId && items.length > 0) {
			selectItem(mode, items[0].id);
		}
	});

	$effect(() => {
		void mode;
		focusedArcType = null;
	});

	const _heroSceneCount = $derived.by(() => {
		if (mode !== 'chapters' || !selectedId) return 0;
		const ch = chapters.find((c) => c.id === selectedId);
		return ch ? ch.scenes.length : 0;
	});

	const _heroPovName = $derived.by(() => {
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

			/* Pre-seed default milestones for the new act */
			const seeds: { title: string; description: string }[] = [
				{ title: 'Disruption of normal', description: 'Introduce a destabilizing event that interrupts the protagonist\u2019s current state.' },
				{ title: 'Active commitment', description: 'The protagonist makes a conscious choice to engage with the central conflict.' },
				{ title: 'Irreversible shift', description: 'A decision or event that prevents returning to the previous state.' },
			];
			const created = await Promise.all(
				seeds.map((s, i) => createMilestoneApi(act.id, data.projectId, s.title, i, s.description)),
			);
			milestones = [...milestones, ...created];

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

	function handleUpdateArc(id: string, changes: Partial<Arc>) {
		void updateArc(id, changes);
		arcs = arcs.map((a) => (a.id === id ? { ...a, ...changes } : a));
	}

	/* ── Beat CRUD ── */
	function handleCreateBeat(beat: Beat) {
		beats = [...beats, beat];
		void createBeat({
			arcId: beat.arcId,
			projectId: beat.projectId,
			title: beat.title,
			type: beat.type,
			order: beat.order,
			notes: beat.notes,
		});
	}

	function handleUpdateBeat(id: string, changes: Partial<Beat>) {
		beats = beats.map((b) => (b.id === id ? { ...b, ...changes } : b));
		void updateBeat(id, changes);
	}

	function handleDeleteBeat(id: string) {
		// Also remove stages belonging to this beat
		const beatStages = stages.filter((s) => s.beatId === id);
		for (const s of beatStages) {
			void removeStage(s.id);
		}
		stages = stages.filter((s) => s.beatId !== id);
		beats = beats.filter((b) => b.id !== id);
		void removeBeat(id);
	}

	/* ── Stage CRUD ── */
	function handleCreateStage(stage: Stage) {
		stages = [...stages, stage];
		void createStage({
			beatId: stage.beatId,
			projectId: stage.projectId,
			title: stage.title,
			description: stage.description,
			order: stage.order,
			status: stage.status,
		});
	}

	function handleUpdateStage(id: string, changes: Partial<Stage>) {
		stages = stages.map((s) => (s.id === id ? { ...s, ...changes } : s));
		void updateStageApi(id, changes);
	}

	function handleDeleteStage(id: string) {
		stages = stages.filter((s) => s.id !== id);
		void removeStage(id);
	}

	/* ── Act-specific handlers ── */
	function handleUpdateAct(id: string, changes: Partial<Act>) {
		void updateAct(id, changes);
		acts = acts.map((a) => (a.id === id ? { ...a, ...changes } : a));
	}

	/* ── Milestone CRUD ── */
	async function handleCreateMilestone(actId: string) {
		const actMilestones = milestones.filter((m) => m.actId === actId);
		const milestone = await createMilestoneApi(actId, data.projectId, `Milestone ${actMilestones.length + 1}`, actMilestones.length);
		milestones = [...milestones, milestone];
	}

	function handleUpdateMilestone(id: string, changes: Partial<Milestone>) {
		void updateMilestoneApi(id, changes);
		milestones = milestones.map((m) => (m.id === id ? { ...m, ...changes } : m));
	}

	function handleDeleteMilestone(id: string) {
		void removeMilestoneApi(id);
		milestones = milestones.filter((m) => m.id !== id);
	}

	function handleLinkChapterToMilestone(milestoneId: string, chapterId: string) {
		const ms = milestones.find((m) => m.id === milestoneId);
		if (!ms || ms.chapterIds.includes(chapterId)) return;
		const updated = [...ms.chapterIds, chapterId];
		void updateMilestoneApi(milestoneId, { chapterIds: updated });
		milestones = milestones.map((m) => (m.id === milestoneId ? { ...m, chapterIds: updated } : m));
	}

	function handleUnlinkChapterFromMilestone(milestoneId: string, chapterId: string) {
		const ms = milestones.find((m) => m.id === milestoneId);
		if (!ms) return;
		const updated = ms.chapterIds.filter((id) => id !== chapterId);
		void updateMilestoneApi(milestoneId, { chapterIds: updated });
		milestones = milestones.map((m) => (m.id === milestoneId ? { ...m, chapterIds: updated } : m));
	}

	/* ── Chapter-specific handlers ── */
	function handleUpdateChapter(id: string, changes: Partial<ChapterWithScenes>) {
		void updateChapter(id, changes);
		chapters = chapters.map((c) => (c.id === id ? { ...c, ...changes } : c));
	}

	/* ── Chapter → Scene CRUD ── */
	async function handleCreateChapterScene(chapterId: string) {
		const ch = chapters.find((c) => c.id === chapterId);
		if (!ch) return;
		const scene = await createScene({
			projectId: data.projectId,
			chapterId,
			title: `Scene ${ch.scenes.length + 1}`,
			summary: '',
			povCharacterId: null,
			locationId: null,
			timelineEventId: null,
			order: ch.scenes.length,
			content: '',
			wordCount: 0,
			characterIds: [],
			locationIds: [],
		});
		scenes = [...scenes, scene];
		chapters = chapters.map((c) =>
			c.id === chapterId ? { ...c, scenes: [...c.scenes, scene] } : c,
		);
	}

	function handleUpdateChapterScene(id: string, changes: Partial<Scene>) {
		void updateScene(id, changes);
		scenes = scenes.map((s) => (s.id === id ? { ...s, ...changes } : s));
		chapters = chapters.map((c) => ({
			...c,
			scenes: c.scenes.map((s) => (s.id === id ? { ...s, ...changes } : s)),
		}));
	}

	function handleDeleteChapterScene(id: string) {
		void removeScene(id);
		scenes = scenes.filter((s) => s.id !== id);
		chapters = chapters.map((c) => ({ ...c, scenes: c.scenes.filter((s) => s.id !== id) }));
	}
</script>

<svelte:head>
	<title>Workspace — Novellum</title>
</svelte:head>

<WorkspaceHelpModal
        open={showHelp}
        onClose={() => (showHelp = false)}
        activeMode={mode}
        items={railItems}
        {activeIndex}
        onNavigate={handleNavigate}
        onCreate={handleCreate}
        {focusedArcType}
        onArcTypeFocus={(t) => (focusedArcType = t)}
/>

{#if mode === 'arcs'}
        <div class="workspace-board-view">
                <div class="board-header-row">
                        <div class="collection-header">
                                <span class="collection-label arc-selection-row">
                                        {#each collectionItems as item, i (item.id)}
                                                <button 
                                                        class="arc-selector" 
                                                        class:arc-selector--active={selectedId === item.id}
                                                        onclick={() => handleSelectItem(item.id)}
                                                >
                                                        {item.title ? item.title.toUpperCase() : `ARC ${i + 1}`}
                                                </button>
                                                {#if i < collectionItems.length - 1}
                                                        <span class="divider"> | </span>
                                                {/if}
                                        {/each}
                                        <button class="arc-selector arc-new-btn" onclick={handleCreate}>+ New</button>
                                </span>
                                <button class="help-toggle" onclick={() => (showHelp = true)} aria-label="Show conceptual help">
                                        ?
                                </button>
                        </div>
                </div>

                <ArcWorkspace
                        arc={heroItem as Arc | null}
                        allBeats={beats}
                        allStages={stages}
                        projectId={data.projectId}
                        onUpdateArc={handleUpdateArc}
                        onDeleteArc={handleDelete}
                        onCreateBeat={handleCreateBeat}
                        onUpdateBeat={handleUpdateBeat}
                        onDeleteBeat={handleDeleteBeat}
                        onCreateStage={handleCreateStage}
                        onUpdateStage={handleUpdateStage}
                        onDeleteStage={handleDeleteStage}
                />
        </div>
{:else if mode === 'acts'}
        <div class="workspace-board-view">
                <div class="board-header-row">
                        <div class="collection-header">
                                <span class="collection-label item-selection-row">
                                        {#each collectionItems as item, i (item.id)}
                                                <button
                                                        class="item-selector"
                                                        class:item-selector--active={selectedId === item.id}
                                                        onclick={() => handleSelectItem(item.id)}
                                                >
                                                        {item.title ? item.title.toUpperCase() : `ACT ${i + 1}`}
                                                </button>
                                                {#if i < collectionItems.length - 1}
                                                        <span class="divider"> | </span>
                                                {/if}
                                        {/each}
                                        <button class="item-selector item-new-btn" onclick={handleCreate}>+ New</button>
                                </span>
                                <button class="help-toggle" onclick={() => (showHelp = true)} aria-label="Show conceptual help">
                                        ?
                                </button>
                        </div>
                </div>

                <ActsWorkspace
                        act={heroItem as Act | null}
                        {milestones}
                        allChapters={chapters}
                        projectId={data.projectId}
                        onUpdateAct={handleUpdateAct}
                        onDeleteAct={handleDelete}
                        onCreateMilestone={handleCreateMilestone}
                        onUpdateMilestone={handleUpdateMilestone}
                        onDeleteMilestone={handleDeleteMilestone}
                        onLinkChapter={handleLinkChapterToMilestone}
                        onUnlinkChapter={handleUnlinkChapterFromMilestone}
                />
        </div>
{:else if mode === 'chapters'}
        <div class="workspace-board-view">
                <div class="board-header-row">
                        <div class="collection-header">
                                <span class="collection-label item-selection-row">
                                        {#each collectionItems as item, i (item.id)}
                                                <button
                                                        class="item-selector"
                                                        class:item-selector--active={selectedId === item.id}
                                                        onclick={() => handleSelectItem(item.id)}
                                                >
                                                        {item.title ? item.title.toUpperCase() : `CH ${i + 1}`}
                                                </button>
                                                {#if i < collectionItems.length - 1}
                                                        <span class="divider"> | </span>
                                                {/if}
                                        {/each}
                                        <button class="item-selector item-new-btn" onclick={handleCreate}>+ New</button>
                                </span>
                                <button class="help-toggle" onclick={() => (showHelp = true)} aria-label="Show conceptual help">
                                        ?
                                </button>
                        </div>
                </div>

                <ChaptersWorkspace
                        chapter={heroItem as ChapterWithScenes | null}
                        projectId={data.projectId}
                        onUpdateChapter={handleUpdateChapter}
                        onDeleteChapter={handleDelete}
                        onCreateScene={handleCreateChapterScene}
                        onUpdateScene={handleUpdateChapterScene}
                        onDeleteScene={handleDeleteChapterScene}
                />
        </div>
{:else}
        <div class="workspace-surface">

                <div class="collection-header">
                        <span class="collection-label">
                                {collectionItems.length}
                                {WORKSPACE_MODE_LABELS[mode].toLowerCase()}
                        </span>
                        <button class="help-toggle" onclick={() => (showHelp = true)} aria-label="Show conceptual help">
                                ?
                        </button>
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
{/if}
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
		justify-content: space-between;
		padding: 0 var(--space-1);
	}
        .help-toggle {
                background: var(--color-surface-glass);
                border: 1px solid var(--color-border-subtle);
                color: var(--color-text-secondary);
                width: 24px;
                height: 24px;
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: var(--font-mono);
                font-size: var(--text-xs);
                font-weight: var(--font-weight-bold);
                cursor: pointer;
                transition: var(--transition-color);
        }
        .help-toggle:hover {
                background: var(--color-surface-raised);
                color: var(--color-text-primary);
                border-color: var(--color-border-strong);
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

        /* ── Board View (Arcs) ── */

        .workspace-board-view {
                display: flex;
                flex-direction: column;
                flex: 1;
                min-height: 0;
        }

        .board-header-row {
                flex-shrink: 0;
                padding: var(--space-3) var(--space-6);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .arc-selection-row {
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
        }

        .arc-selector {
                background: none;
                border: none;
                color: var(--color-text-secondary);
                font-family: var(--font-sans);
                font-size: var(--text-sm);
                font-weight: var(--font-weight-medium);
                letter-spacing: var(--tracking-wider);
                cursor: pointer;
                padding: var(--space-1) var(--space-2);
                border-radius: var(--radius-sm);
                transition: color 150ms ease, background 150ms ease;
        }

        .arc-selector:hover {
                color: var(--color-text-primary);
                background: rgba(255, 255, 255, 0.05);
        }

        .arc-selector--active {
                color: var(--color-nova-blue);
        }

        .arc-new-btn {
                color: var(--color-text-tertiary);
                margin-left: var(--space-2);
        }

        /* ── Board View (Acts) ── */

        .item-selection-row {
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
        }

        .item-selector {
                background: none;
                border: none;
                color: var(--color-text-secondary);
                font-family: var(--font-sans);
                font-size: var(--text-sm);
                font-weight: var(--font-weight-medium);
                letter-spacing: var(--tracking-wider);
                cursor: pointer;
                padding: var(--space-1) var(--space-2);
                border-radius: var(--radius-sm);
                transition: color 150ms ease, background 150ms ease;
        }

        .item-selector:hover {
                color: var(--color-text-primary);
                background: rgba(255, 255, 255, 0.05);
        }

        .item-selector--active {
                color: var(--color-nova-blue);
        }

        .item-new-btn {
                color: var(--color-text-tertiary);
                margin-left: var(--space-2);
        }
</style>
