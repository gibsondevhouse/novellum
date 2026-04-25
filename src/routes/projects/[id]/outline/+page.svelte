<script lang="ts">
	import { untrack } from 'svelte';
	import type { Chapter, Scene, StoryFrame, Act, Arc, Character } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import { WorkspaceShell, WorkspaceHero } from '$lib/components/ui/index.js';
	import HierarchyNavigator from '$modules/outliner/components/HierarchyNavigator.svelte';
	import ActClarityPanel from '$modules/outliner/components/ActClarityPanel.svelte';
	import ChapterClarityPanel from '$modules/outliner/components/ChapterClarityPanel.svelte';
	import SceneClarityPanel from '$modules/outliner/components/SceneClarityPanel.svelte';
	import {
		getSelectedActId,
		getSelectedChapterId,
		getSelectedSceneId,
		setSelectedAct,
		setSelectedChapter,
		setSelectedScene,
		setActiveProject,
	} from '$modules/outliner/stores/outliner.svelte.js';
	import { createAct, updateAct } from '$modules/outliner/services/story-structure-service.js';
	import { updateChapter } from '$modules/project/services/chapter-repository.js';
	import { createScene, updateScene } from '$modules/editor/services/scene-repository.js';
	import { createBeat } from '$modules/editor/services/beat-repository.js';

	let { data } = $props<{
		data: {
			projectId: string;
			storyFrame: StoryFrame;
			arcs: Arc[];
			acts: Act[];
			characters: Character[];
			chapters: ChapterWithScenes[];
		};
	}>();

	let projectId = $derived(data.projectId);
	let arcs = $state<Arc[]>(untrack(() => data.arcs));
	let acts = $state<Act[]>(untrack(() => data.acts));
	let characters = $state<Character[]>(untrack(() => data.characters));
	let chapters = $state<ChapterWithScenes[]>(untrack(() => data.chapters));
	let storyFrame = $state<StoryFrame>(untrack(() => data.storyFrame));

	$effect(() => {
		setActiveProject(projectId);
	});

	function handleSelectChapter(chapter: Chapter) {
		setSelectedChapter(chapter.id);
	}

	function handleSelectScene(scene: Scene) {
		setSelectedScene(scene.id);
	}

	function handleSelectAct(act: Act) {
		setSelectedAct(act.id);
	}

	async function handleAddAct(title: string) {
		const act = await createAct(projectId, title, acts.length);
		acts = [...acts, act];
	}

	const navigatorProps = $derived({
		projectId,
		storyFrame,
		acts,
		chapters,
		onSelectChapter: handleSelectChapter,
		onSelectScene: handleSelectScene,
		onSelectAct: handleSelectAct,
		onAddAct: handleAddAct,
		onChaptersChange: (nextChapters: ChapterWithScenes[]) => {
			chapters = nextChapters;
		},
	});

	const selectedActId = $derived(getSelectedActId());
	const selectedChapterId = $derived(getSelectedChapterId());
	const selectedSceneId = $derived(getSelectedSceneId());

	const selectedAct = $derived.by((): Act | null => {
		if (!selectedActId) return null;
		return acts.find((act) => act.id === selectedActId) ?? null;
	});

	const selectedChapter = $derived.by((): ChapterWithScenes | null => {
		if (!selectedChapterId) return null;
		return chapters.find((chapter) => chapter.id === selectedChapterId) ?? null;
	});

	const selectedChapterAct = $derived.by((): Act | null => {
		if (!selectedChapter?.actId) return null;
		return acts.find((act) => act.id === selectedChapter.actId) ?? null;
	});

	const selectedChapterNumber = $derived.by((): number => {
		if (!selectedChapter) return 0;
		const ordered = [...chapters].sort((a, b) => a.order - b.order);
		const index = ordered.findIndex((chapter) => chapter.id === selectedChapter.id);
		return index >= 0 ? index + 1 : selectedChapter.order + 1;
	});

	const selectedScene = $derived.by((): Scene | null => {
		if (!selectedSceneId) return null;
		for (const chapter of chapters) {
			const scene = chapter.scenes.find((s) => s.id === selectedSceneId);
			if (scene) return scene;
		}
		return null;
	});

	const selectedSceneChapter = $derived.by((): Chapter | null => {
		if (!selectedScene) return null;
		return chapters.find((chapter) => chapter.id === selectedScene.chapterId) ?? null;
	});

	const selectedSceneAct = $derived.by((): Act | null => {
		if (!selectedSceneChapter?.actId) return null;
		return acts.find((act) => act.id === selectedSceneChapter.actId) ?? null;
	});

	const selectedSceneNumber = $derived.by((): number => {
		if (!selectedScene || !selectedSceneChapter) return 0;
		const chapterWithScenes = chapters.find((c) => c.id === selectedSceneChapter.id);
		if (!chapterWithScenes) return selectedScene.order + 1;
		const ordered = chapterWithScenes.scenes.sort((a: Scene, b: Scene) => a.order - b.order);
		const index = ordered.findIndex((scene: Scene) => scene.id === selectedScene.id);
		return index >= 0 ? index + 1 : selectedScene.order + 1;
	});

	const selectedActChapters = $derived.by((): ChapterWithScenes[] => {
		if (!selectedAct) return [];
		return chapters.filter((chapter) => chapter.actId === selectedAct.id);
	});

	const selectedActArc = $derived.by((): Arc | null => {
		if (!selectedAct?.arcId) return null;
		return arcs.find((arc) => arc.id === selectedAct.arcId) ?? null;
	});

	const totalSceneCount = $derived.by(() =>
		chapters.reduce((total, chapter) => total + chapter.scenes.length, 0),
	);

	const selectionSummary = $derived.by(() => {
		if (selectedScene) return `Scene focus: ${selectedScene.title}`;
		if (selectedChapter) return `Chapter focus: ${selectedChapter.title}`;
		if (selectedAct) return `Act focus: ${selectedAct.title}`;
		return 'Select a node to start planning';
	});

	async function handleUpdateSelectedAct(patch: Partial<Omit<Act, 'id' | 'projectId' | 'createdAt'>>) {
		if (!selectedAct) return;
		await updateAct(selectedAct.id, patch);
		acts = acts.map((act) =>
			act.id === selectedAct.id
				? {
					...act,
					...patch,
					updatedAt: new Date().toISOString(),
				}
				: act,
		);
	}

	async function handleUpdateSelectedChapter(
		patch: Partial<Omit<Chapter, 'id' | 'projectId' | 'createdAt'>>,
	) {
		if (!selectedChapter) return;
		await updateChapter(selectedChapter.id, patch);
		chapters = chapters.map((chapter) =>
			chapter.id === selectedChapter.id
				? {
					...chapter,
					...patch,
					updatedAt: new Date().toISOString(),
				}
				: chapter,
		);
	}

	async function handleAddSceneToSelectedChapter(chapterId: string) {
		const chapter = chapters.find((item) => item.id === chapterId);
		if (!chapter) return;

		const scene = await createScene({
			chapterId,
			projectId,
			title: `Scene ${chapter.scenes.length + 1}`,
			summary: '',
			content: '',
			wordCount: 0,
			notes: '',
			order: chapter.scenes.length,
			povCharacterId: null,
			locationId: null,
			timelineEventId: null,
			characterIds: [],
			locationIds: [],
		});

		chapters = chapters.map((item) =>
			item.id === chapterId ? { ...item, scenes: [...item.scenes, scene] } : item,
		);
	}

	async function handleUpdateSelectedScene(
		patch: Partial<Omit<Scene, 'id' | 'projectId' | 'createdAt'>>,
	) {
		if (!selectedScene) return;
		await updateScene(selectedScene.id, patch);
		chapters = chapters.map((chapter) => ({
			...chapter,
			scenes: chapter.scenes.map((scene) =>
				scene.id === selectedScene.id
					? {
						...scene,
						...patch,
						updatedAt: new Date().toISOString(),
					}
					: scene,
			),
		}));
	}

	async function handleAddBeatToSelectedScene(sceneId: string, title: string) {
		const scene = selectedScene;
		if (!scene || scene.id !== sceneId) return;

		const beatsInScene = await (async () => {
			const { getBeatsBySceneId } = await import('$modules/editor/services/beat-repository.js');
			return await getBeatsBySceneId(sceneId);
		})();

		await createBeat({
			sceneId,
			projectId,
			title,
			type: 'beat',
			order: beatsInScene.length,
			notes: '',
		});
	}
</script>

<svelte:head>
	<title>Outline — Novellum</title>
</svelte:head>

<WorkspaceShell sidebarLabel="Outline selector" mainLabel="Outline detail workspace">
	{#snippet hero()}
		<WorkspaceHero
			eyebrow="Storyboard Room"
			title="Narrative Structure"
			description="Map acts, chapters, and scenes as production beats. Keep structure explicit before entering manuscript drafting."
		>
			{#snippet metrics()}
				<div class="storyboard-metrics" aria-label="Outline metrics">
					<div class="metric-card">
						<span>Acts</span>
						<strong>{acts.length}</strong>
					</div>
					<div class="metric-card">
						<span>Chapters</span>
						<strong>{chapters.length}</strong>
					</div>
					<div class="metric-card">
						<span>Scenes</span>
						<strong>{totalSceneCount}</strong>
					</div>
					<div class="metric-card metric-card--wide">
						<span>Selection</span>
						<strong>{selectionSummary}</strong>
					</div>
				</div>
			{/snippet}
		</WorkspaceHero>
	{/snippet}

	{#snippet sidebar()}
		<HierarchyNavigator {...navigatorProps} />
	{/snippet}

	{#snippet main()}
		{#if selectedScene}
			<SceneClarityPanel
				{projectId}
				scene={selectedScene}
				sceneNumber={selectedSceneNumber}
				parentChapter={selectedSceneChapter}
				parentAct={selectedSceneAct}
				{characters}
				{arcs}
				onUpdateScene={(id, patch) => (id === selectedScene.id ? handleUpdateSelectedScene(patch) : Promise.resolve())}
				onAddBeat={handleAddBeatToSelectedScene}
			/>
		{:else if selectedChapter}
			<ChapterClarityPanel
				{projectId}
				chapter={selectedChapter}
				chapterNumber={selectedChapterNumber}
				parentAct={selectedChapterAct}
				scenes={selectedChapter.scenes}
				{characters}
				{arcs}
				onUpdateChapter={(id, patch) => (id === selectedChapter.id ? handleUpdateSelectedChapter(patch) : Promise.resolve())}
				onAddScene={handleAddSceneToSelectedChapter}
			/>
		{:else if selectedAct}
			<ActClarityPanel
				act={selectedAct}
				chapters={selectedActChapters}
				relatedArc={selectedActArc}
				onUpdateAct={handleUpdateSelectedAct}
			/>
		{:else}
			<div class="outline-main-empty">
				<h2>Select an Act, Chapter, or Scene</h2>
				<p>Choose an item on the left to define story structure and execution details.</p>
			</div>
		{/if}
	{/snippet}
</WorkspaceShell>

<style>
	.storyboard-metrics {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.metric-card {
		display: grid;
		gap: 0.15rem;
		padding: var(--space-3);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-overlay) 76%, transparent);
	}

	.metric-card span {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.metric-card strong {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.metric-card--wide {
		grid-column: 1 / -1;
	}

	.outline-main-empty {
		width: min(620px, 100%);
		margin-top: var(--space-10);
		padding: var(--space-6);
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-raised) 80%, transparent);
	}

	.outline-main-empty h2 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-lg);
		font-family: var(--font-display);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.outline-main-empty p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}
</style>
