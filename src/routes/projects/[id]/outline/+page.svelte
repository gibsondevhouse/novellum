<script lang="ts">
	import { untrack } from 'svelte';
	import type { Chapter, Scene, StoryFrame, Act } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import HierarchyNavigator from '$modules/outliner/components/HierarchyNavigator.svelte';
	import OutlineDetailCard from '$modules/outliner/components/OutlineDetailCard.svelte';
	import type { OutlineSelection } from '$modules/outliner/components/OutlineDetailCard.svelte';
	import {
		getSelectedChapterId,
		getSelectedSceneId,
		setSelectedAct,
		setSelectedChapter,
		setSelectedScene,
		setActiveProject,
	} from '$modules/outliner/stores/outliner.svelte.js';
	import { createAct } from '$modules/outliner/services/story-structure-service.js';

	let { data } = $props<{
		data: {
			projectId: string;
			storyFrame: StoryFrame;
			acts: Act[];
			chapters: ChapterWithScenes[];
		};
	}>();

	let projectId = $derived(data.projectId);
	let acts = $state<Act[]>(untrack(() => data.acts));
	let chapters = $state<ChapterWithScenes[]>(untrack(() => data.chapters));
	let storyFrame = $state<StoryFrame>(untrack(() => data.storyFrame));

	$effect(() => {
		setActiveProject(projectId);
	});

	function handleSelectChapter(ch: Chapter) {
		setSelectedChapter(ch.id);
	}
	function handleSelectScene(sc: Scene) {
		setSelectedScene(sc.id);
	}
	function handleSelectAct(act: Act) {
		setSelectedAct(act.id);
	}
	async function handleAddAct(title: string) {
		const act = await createAct(projectId, title, acts.length);
		acts = [...acts, act];
	}

	const selectedChapterId = $derived(getSelectedChapterId());
	const selectedSceneId = $derived(getSelectedSceneId());

	const selection = $derived.by((): OutlineSelection | null => {
		if (selectedSceneId) {
			for (const ch of chapters) {
				const sc = ch.scenes.find((s) => s.id === selectedSceneId);
				if (sc) return { type: 'scene', scene: sc };
			}
		}
		if (selectedChapterId) {
			const ch = chapters.find((c) => c.id === selectedChapterId);
			if (ch) return { type: 'chapter', chapter: ch };
		}
		return null;
	});

	let cardWidth = $state(480);
</script>

<svelte:head>
	<title>Outline — Novellum</title>
</svelte:head>

<div class="outline-workspace" role="main">
	<div class="col-nav outline-main">
		<HierarchyNavigator
			{projectId}
			{storyFrame}
			{acts}
			{chapters}
			onSelectChapter={handleSelectChapter}
			onSelectScene={handleSelectScene}
			onSelectAct={handleSelectAct}
			onAddAct={handleAddAct}
			onChaptersChange={(new_chapters) => {
				chapters = new_chapters;
			}}
		/>
	</div>
	{#if selection}
		<div class="col-side">
			<OutlineDetailCard
				{selection}
				width={cardWidth}
				onWidthChange={(w) => (cardWidth = w)}
				onClose={() => {
					setSelectedChapter(null);
					setSelectedScene(null);
				}}
				onChapterUpdate={(id, patch) => {
					chapters = chapters.map((ch) => (ch.id === id ? { ...ch, ...patch } : ch));
				}}
				onSceneUpdate={(id, patch) => {
					chapters = chapters.map((ch) => ({
						...ch,
						scenes: ch.scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)),
					}));
				}}
			/>
		</div>
	{/if}
</div>

<style>
	.outline-workspace {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: var(--space-6);
		padding: var(--space-6) max(var(--space-6), calc(50% - 600px));
		height: calc(100vh - var(--header-height, 64px));
		overflow: auto;
		box-sizing: border-box;
		position: relative;
	}
	.outline-main {
		flex: 1;
		min-width: 480px;
		max-width: 800px;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.col-side {
		flex-shrink: 0;
		position: sticky;
		top: var(--space-6);
	}
</style>
