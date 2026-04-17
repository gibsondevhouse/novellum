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
		getParentContext,
		propagateParentFromSelection,
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
		reorderScenes,
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
	import ArcWorkspace from '$modules/workspace/components/ArcWorkspace.svelte';
	import ActsWorkspace from '$modules/workspace/components/ActsWorkspace.svelte';
	import ChaptersWorkspace from '$modules/workspace/components/ChaptersWorkspace.svelte';
	import ScenesWorkspace from '$modules/workspace/components/ScenesWorkspace.svelte';
	import WorkspaceSubheader from '$modules/workspace/components/WorkspaceSubheader.svelte';
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
		if (arcs.length > 0 && !getActiveSelectedId()) {
			selectItem('arcs', arcs[0].id);
			propagateParentFromSelection('arcs');
		}
	});

	const mode = $derived(getActiveMode());
	const selectedId = $derived(getActiveSelectedId());

	/* ── Parent context for current mode ── */
	const actsParentArcId = $derived(getParentContext('acts'));
	const chaptersParentActId = $derived(getParentContext('chapters'));
	const scenesParentChapterId = $derived(getParentContext('scenes'));

	/* ── Scoped collections ── */
	const scopedActs = $derived.by(() => {
		if (!actsParentArcId) return { scoped: [] as Act[], unassigned: acts };
		return {
			scoped: acts.filter((a) => a.arcId === actsParentArcId),
			unassigned: acts.filter((a) => !a.arcId),
		};
	});

	const scopedChapters = $derived.by(() => {
		if (!chaptersParentActId) return { scoped: [] as ChapterWithScenes[], unassigned: chapters };
		return {
			scoped: chapters.filter((c) => c.actId === chaptersParentActId),
			unassigned: chapters.filter((c) => !c.actId),
		};
	});

	const scopedScenes = $derived.by(() => {
		if (!scenesParentChapterId) return { scoped: [] as Scene[], unassigned: scenes };
		return {
			scoped: scenes.filter((s) => s.chapterId === scenesParentChapterId),
			unassigned: scenes.filter((s) => s.chapterId !== scenesParentChapterId),
		};
	});

	/** The visible collection for the current mode: scoped + unassigned combined. */
	function visibleActs(): Act[] {
		if (!actsParentArcId) return acts;
		return [...scopedActs.scoped, ...scopedActs.unassigned];
	}

	function visibleChapters(): ChapterWithScenes[] {
		if (!chaptersParentActId) return chapters;
		return [...scopedChapters.scoped, ...scopedChapters.unassigned];
	}

	function visibleScenes(): Scene[] {
		if (!scenesParentChapterId) return scenes;
		return [...scopedScenes.scoped, ...scopedScenes.unassigned];
	}

	/* ── Context labels for breadcrumbs ── */
	const parentContextLabel = $derived.by((): string | null => {
		if (mode === 'acts' && actsParentArcId) {
			const arc = arcs.find((a) => a.id === actsParentArcId);
			return arc ? `Arc: ${arc.title}` : null;
		}
		if (mode === 'chapters' && chaptersParentActId) {
			const act = acts.find((a) => a.id === chaptersParentActId);
			return act ? `Act: ${act.title}` : null;
		}
		if (mode === 'scenes' && scenesParentChapterId) {
			const ch = chapters.find((c) => c.id === scenesParentChapterId);
			return ch ? `Chapter: ${ch.title}` : null;
		}
		return null;
	});

	// Auto-select first item when mode changes or collection changes and nothing is selected
	$effect(() => {
		const items = mode === 'arcs' ? arcs : mode === 'acts' ? visibleActs() : mode === 'chapters' ? visibleChapters() : visibleScenes();
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

	/* ── Collection items for active mode (scoped) ── */
	type CollectionItem = { id: string; title: string; subtitle: string; isUnassigned?: boolean };

	const collectionItems = $derived.by((): CollectionItem[] => {
		if (mode === 'arcs')
			return arcs.map((a) => ({ id: a.id, title: a.title, subtitle: a.description || '' }));
		if (mode === 'acts') {
			const items: CollectionItem[] = [];
			if (actsParentArcId) {
				for (const a of scopedActs.scoped)
					items.push({ id: a.id, title: a.title, subtitle: `Act ${a.order + 1}` });
				for (const a of scopedActs.unassigned)
					items.push({ id: a.id, title: a.title, subtitle: 'Unassigned', isUnassigned: true });
			} else {
				for (const a of acts)
					items.push({ id: a.id, title: a.title, subtitle: `Act ${a.order + 1}` });
			}
			return items;
		}
		if (mode === 'chapters') {
			const items: CollectionItem[] = [];
			if (chaptersParentActId) {
				for (const c of scopedChapters.scoped)
					items.push({ id: c.id, title: c.title, subtitle: `${c.scenes.length} scene${c.scenes.length === 1 ? '' : 's'}` });
				for (const c of scopedChapters.unassigned)
					items.push({ id: c.id, title: c.title, subtitle: 'Unassigned', isUnassigned: true });
			} else {
				for (const c of chapters)
					items.push({ id: c.id, title: c.title, subtitle: `${c.scenes.length} scene${c.scenes.length === 1 ? '' : 's'}` });
			}
			return items;
		}
		// scenes
		if (scenesParentChapterId) {
			return scopedScenes.scoped.map((s) => ({
				id: s.id,
				title: s.title,
				subtitle: s.summary || '',
			}));
		}
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
			propagateParentFromSelection('arcs');
		} else if (mode === 'acts') {
			const parentArcId = actsParentArcId ?? undefined;
			const act = await createAct(data.projectId, `Act ${acts.length + 1}`, acts.length, parentArcId);
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
			propagateParentFromSelection('acts');
		} else if (mode === 'chapters') {
			const parentActId = chaptersParentActId ?? undefined;
			const chapter = await createChapter({
				projectId: data.projectId,
				title: `Chapter ${chapters.length + 1}`,
				order: chapters.length,
				summary: '',
				wordCount: 0,
				...(parentActId ? { actId: parentActId } : {}),
			});
			chapters = [...chapters, { ...chapter, scenes: [] }];
			selectItem('chapters', chapter.id);
			propagateParentFromSelection('chapters');
		} else if (mode === 'scenes') {
			const parentChapterId = scenesParentChapterId;
			if (!parentChapterId) return;
			const parentChapter = chapters.find((c) => c.id === parentChapterId);
			if (!parentChapter) return;
			const siblingCount = scenes.filter((s) => s.chapterId === parentChapterId).length;
			const scene = await createScene({
				projectId: data.projectId,
				chapterId: parentChapterId,
				title: `Scene ${siblingCount + 1}`,
				summary: '',
				povCharacterId: null,
				locationId: null,
				timelineEventId: null,
				order: siblingCount,
				content: '',
				wordCount: 0,
				notes: '',
				characterIds: [],
				locationIds: [],
			});
			scenes = [...scenes, scene];
			chapters = chapters.map((c) =>
				c.id === parentChapterId ? { ...c, scenes: [...c.scenes, scene] } : c,
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
		// Propagate selection as parent context for the child mode
		propagateParentFromSelection(mode);
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
			notes: '',
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

	function handleReorderChapterScenes(chapterId: string, orderedIds: string[]) {
		void reorderScenes(chapterId, orderedIds);
		chapters = chapters.map((c) => {
			if (c.id !== chapterId) return c;
			const reordered = orderedIds.map((id, i) => {
				const s = c.scenes.find((sc) => sc.id === id);
				return s ? { ...s, order: i } : s;
			}).filter(Boolean) as typeof c.scenes;
			return { ...c, scenes: reordered };
		});
	}

	/* ── Scene Workspace handlers ── */
	function handleUpdateWorkspaceScene(id: string, changes: Partial<Scene>) {
		void updateScene(id, changes);
		scenes = scenes.map((s) => (s.id === id ? { ...s, ...changes } : s));
		chapters = chapters.map((c) => ({
			...c,
			scenes: c.scenes.map((s) => (s.id === id ? { ...s, ...changes } : s)),
		}));
	}

	let sceneDragId = $state<string | null>(null);

	function handleSceneDragStart(e: DragEvent, id: string) {
		sceneDragId = id;
		e.dataTransfer?.setData('text/plain', id);
	}

	function handleSceneDrop(targetIdx: number) {
		if (sceneDragId === null) return;
		const sorted = scenes.slice().sort((a, b) => a.order - b.order);
		const fromIdx = sorted.findIndex((s) => s.id === sceneDragId);
		if (fromIdx === targetIdx) {
			sceneDragId = null;
			return;
		}
		const reordered = [...sorted];
		const [moved] = reordered.splice(fromIdx, 1);
		reordered.splice(targetIdx, 0, moved);
		const orderedIds = reordered.map((s) => s.id);
		scenes = reordered.map((s, i) => ({ ...s, order: i }));
		// Sync chapter scenes too
		chapters = chapters.map((c) => ({
			...c,
			scenes: c.scenes.map((s) => {
				const newOrder = orderedIds.indexOf(s.id);
				return newOrder >= 0 ? { ...s, order: newOrder } : s;
			}),
		}));
		if (moved) {
			void reorderScenes(moved.chapterId, orderedIds);
		}
		sceneDragId = null;
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
                <WorkspaceSubheader
                        items={collectionItems}
                        {selectedId}
                        fallbackLabel="ARC"
                        onSelect={handleSelectItem}
                        onCreate={handleCreate}
                        onHelp={() => (showHelp = true)}
                />

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
                <WorkspaceSubheader
                        items={collectionItems}
                        {selectedId}
                        fallbackLabel="ACT"
                        {parentContextLabel}
                        onSelect={handleSelectItem}
                        onCreate={handleCreate}
                        onHelp={() => (showHelp = true)}
                />

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
                <WorkspaceSubheader
                        items={collectionItems}
                        {selectedId}
                        fallbackLabel="CH"
                        {parentContextLabel}
                        onSelect={handleSelectItem}
                        onCreate={handleCreate}
                        onHelp={() => (showHelp = true)}
                />

                <ChaptersWorkspace
                        chapter={heroItem as ChapterWithScenes | null}
                        projectId={data.projectId}
                        onUpdateChapter={handleUpdateChapter}
                        onDeleteChapter={handleDelete}
                        onCreateScene={handleCreateChapterScene}
                        onUpdateScene={handleUpdateChapterScene}
                        onDeleteScene={handleDeleteChapterScene}
                        onReorderScenes={handleReorderChapterScenes}
                />
        </div>
{:else if mode === 'scenes'}
        <div class="workspace-board-view">
                <WorkspaceSubheader
                        items={collectionItems}
                        {selectedId}
                        fallbackLabel="SCENE"
                        {parentContextLabel}
                        onSelect={handleSelectItem}
                        onCreate={handleCreate}
                        onHelp={() => (showHelp = true)}
                />

                <ScenesWorkspace
                        scene={heroItem as Scene | null}
                        allScenes={scenesParentChapterId ? scopedScenes.scoped : scenes}
                        projectId={data.projectId}
                        onSelectScene={(id) => handleSelectItem(id)}
                        onUpdateScene={handleUpdateWorkspaceScene}
                        onDeleteScene={handleDelete}
                        onCreateScene={handleCreate}
                        onDragStart={handleSceneDragStart}
                        onDrop={handleSceneDrop}
                />
        </div>
{/if}
<style>
        .workspace-board-view {
                display: flex;
                flex-direction: column;
                flex: 1;
                min-height: 0;
        }
</style>
