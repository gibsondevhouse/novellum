<script lang="ts">
	import { untrack } from 'svelte';
	import type { Chapter, Scene, StoryFrame, Act, Arc, Character } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
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

<div class="outline-shell" role="main">
	<section class="storyboard-hero" aria-labelledby="storyboard-title">
		<div>
			<p class="storyboard-eyebrow">Storyboard Room</p>
			<h1 id="storyboard-title">Narrative Structure</h1>
			<p class="storyboard-copy">
				Map acts, chapters, and scenes as production beats. Keep structure explicit before entering manuscript drafting.
			</p>
		</div>
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
	</section>

	<div class="outline-workspace">
	<aside class="outline-sidebar" aria-label="Outline selector">
		<div class="outline-sidebar-scroll">
			<HierarchyNavigator {...navigatorProps} />
		</div>
	</aside>

	<section class="outline-main" aria-label="Outline detail workspace">
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
	</section>
	</div>
</div>

<style>
	.outline-shell {
		display: grid;
		gap: var(--space-5);
		padding: var(--space-5) 0 var(--space-8);
	}

	.storyboard-hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem);
		gap: var(--space-4);
		padding: var(--space-5);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		background:
			radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--color-teal) 12%, transparent), transparent 40%),
			linear-gradient(165deg, var(--color-surface-overlay), var(--color-surface-ground));
	}

	.storyboard-eyebrow,
	.storyboard-hero h1,
	.storyboard-copy {
		margin: 0;
	}

	.storyboard-eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.storyboard-hero h1 {
		margin-top: var(--space-1);
		font-size: var(--text-2xl);
	}

	.storyboard-copy {
		margin-top: var(--space-2);
		max-width: 60ch;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

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

	.outline-workspace {
		display: grid;
		grid-template-columns: minmax(280px, 340px) 1fr;
		gap: var(--space-4);
		padding: 0 var(--space-2) var(--space-1);
		height: calc(100vh - var(--header-height, 64px));
		overflow: hidden;
		box-sizing: border-box;
		min-height: 0;
	}

	.outline-sidebar {
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--color-border-default);
		padding-right: var(--space-4);
		height: 100%;
		overflow: hidden;
		min-height: 0;
	}

	.outline-sidebar-scroll {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		min-height: 0;
		padding-right: var(--space-1);
	}

	.outline-main {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		height: 100%;
		overflow: hidden;
		min-height: 0;
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

	@media (max-width: 960px) {
		.storyboard-hero {
			grid-template-columns: 1fr;
		}

		.outline-workspace {
			grid-template-columns: 1fr;
			height: auto;
			overflow: auto;
		}

		.outline-sidebar {
			border-right: none;
			padding-right: 0;
		}

		.outline-main {
			display: none;
		}
	}
</style>
