<script lang="ts">
	import { untrack } from 'svelte';
	import type { Arc, Act, Scene, Character } from '$lib/db/types.js';
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
	import WorkspaceDetailCard from '$modules/workspace/components/WorkspaceDetailCard.svelte';
	import WorkspaceHelpModal from '$modules/workspace/components/WorkspaceHelpModal.svelte';
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
	let showHelp = $state(false);

	$effect(() => {
		setMode('arcs');
		resetSelections();
		focusedArcType = null;
	});

	const mode = $derived(getActiveMode());
	const selectedId = $derived(getActiveSelectedId());

	$effect(() => {
		void mode;
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
                                        {#each collectionItems as item, i}
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
                                </span>
                                <button class="help-toggle" onclick={() => (showHelp = true)} aria-label="Show conceptual help">
                                        ?
                                </button>
                        </div>
                </div>

                <div class="arc-dashboard">
                        {#if heroItem}
                                <div class="arc-dashboard-header">
                                        <div class="arc-meta">
                                                <h1>{heroItem.title || 'Untitled Arc'}</h1>
                                        </div>
                                        <WorkspaceDetailCard
                                                {mode}
                                                item={heroItem}
                                                projectId={data.projectId}
                                                sceneCount={heroSceneCount}
                                                povCharacterName={heroPovName}
                                                onUpdate={handleUpdateArc}
                                        />
                                </div>
                                <div class="arc-dashboard-content">
                                        <div class="arc-dashboard-section">
                                                <h2>Arc Progression</h2>
                                                <div class="arc-timeline">
                                                        <div class="timeline-dropzone">
                                                                <button class="add-event-btn">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                                        </svg>
                                                                        <span>Add Story Beat</span>
                                                                </button>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        {:else}
                                <div class="arc-dashboard-empty">
                                        <div class="empty-state-content">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; margin-bottom: 1rem;">
                                                        <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                        <path d="M2 15h10"></path>
                                                        <path d="m9 18 3-3-3-3"></path>
                                                </svg>
                                                <h2>No Arc Selected</h2>
                                                <p>Select an arc from the header or create a new one to begin mapping out the story.</p>
                                                <button class="add-column-btn" onclick={handleCreate} style="margin-top: 1rem;">
                                                        <span>New Arc</span>
                                                </button>
                                        </div>
                                </div>
                        {/if}
                </div>
        </div>
{:else}
        <div class="workspace-surface">

                {#if heroItem !== null}
                        <WorkspaceDetailCard
                                {mode}
                                item={heroItem}
                                projectId={data.projectId}
                                sceneCount={heroSceneCount}
                                povCharacterName={heroPovName}
                                onUpdate={undefined}
                        />
                {/if}

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

        .arc-dashboard {
                display: flex;
                flex-direction: column;
                flex: 1;
                overflow-y: auto;
                padding: var(--space-6);
                gap: var(--space-6);
        }

        .arc-dashboard-header {
                display: flex;
                flex-direction: row;
                gap: var(--space-6);
                align-items: flex-start;
                padding-bottom: var(--space-6);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .arc-meta {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: var(--space-2);
        }

        .arc-meta h1 {
                font-family: var(--font-serif);
                font-size: var(--text-3xl);
                margin: 0;
                color: #fff;
        }

        .arc-dashboard-content {
                display: flex;
                flex-direction: column;
                gap: var(--space-8);
                flex: 1;
        }

        .arc-dashboard-section h2 {
                font-size: var(--text-sm);
                text-transform: uppercase;
                letter-spacing: var(--tracking-wider);
                font-weight: var(--font-weight-bold);
                color: var(--color-text-secondary);
                margin-bottom: var(--space-4);
        }

        .arc-timeline {
                display: flex;
                flex-direction: row;
                gap: var(--space-4);
                overflow-x: auto;
                padding-bottom: var(--space-4);
        }

        .timeline-dropzone {
                display: flex;
                flex: 0 0 200px;
                min-height: 120px;
                border: 2px dashed rgba(255, 255, 255, 0.15);
                border-radius: var(--radius-md);
                align-items: center;
                justify-content: center;
                transition: all 150ms ease;
        }

        .timeline-dropzone:hover {
                border-color: var(--color-nova-blue);
                background: color-mix(in srgb, var(--color-nova-blue) 10%, transparent);
        }

        .add-event-btn {
                background: none;
                border: none;
                color: var(--color-text-secondary);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-2);
                cursor: pointer;
                font-size: var(--text-sm);
        }

        .timeline-dropzone:hover .add-event-btn {
                color: var(--color-nova-blue);
        }

        .arc-dashboard-empty {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                height: 100%;
        }

        .empty-state-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                max-width: 400px;
                color: var(--color-text-secondary);
        }

        .empty-state-content h2 {
                color: #fff;
                margin-bottom: var(--space-2);
                font-size: var(--text-xl);
                font-weight: var(--font-weight-medium);
        }

        .add-column-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--space-2);
                width: 100%;
                height: 100%;
                min-height: 200px;
                background: transparent;
                border: none;
                border-radius: var(--radius-lg);
                color: #a0a0a0;
                font-family: var(--font-sans);
                font-size: var(--text-base);
                font-weight: var(--font-weight-medium);
                cursor: pointer;
                transition: all 150ms ease;
        }

        .add-column-btn:hover {
                color: var(--color-nova-blue);
                background: color-mix(in srgb, var(--color-nova-blue) 8%, transparent);
        }
</style>
