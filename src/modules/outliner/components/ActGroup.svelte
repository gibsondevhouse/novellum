<script lang="ts">
	import type { Act, Chapter, Scene } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import { GhostButton } from '$lib/components/ui/index.js';
	import ChapterGroup from './ChapterGroup.svelte';
	import AddChapterForm from './AddChapterForm.svelte';

	let {
		act,
		chapters,
		selectedId,
		onSelectChapter,
		onSelectScene,
		onSelectAct,
		onAddScene,
		onAddChapter,
		onDeleteScene,
		onReorderScenes,
		onMoveScene,
	} = $props<{
		act: Act;
		chapters: ChapterWithScenes[];
		selectedId: string | null;
		onSelectChapter: (chapter: Chapter) => void;
		onSelectScene: (scene: Scene) => void;
		onSelectAct: (act: Act) => void;
		onAddScene: (chapter: ChapterWithScenes, title: string) => void;
		onAddChapter: (actId: string, title: string) => void;
		onDeleteScene: (chapter: ChapterWithScenes, sceneId: string) => void;
		onReorderScenes: (chapter: ChapterWithScenes, ids: string[]) => void;
		onMoveScene: (sceneId: string, fromChapterId: string, toChapterId: string, index: number) => void;
	}>();

	let expanded = $state(true);
	let addChapterActive = $state(false);

	function handleHeaderKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			expanded = !expanded;
		}
	}
</script>

<div class="act-group" role="group" aria-label={act.title}>
	<div class="act-header">
		<GhostButton
			class="act-expand-btn"
			type="button"
			onclick={() => (expanded = !expanded)}
			onkeydown={handleHeaderKeydown}
			aria-label="{expanded ? 'Collapse' : 'Expand'} act"
		>
			<span class="act-chevron" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
		</GhostButton>
		<GhostButton
			class="act-select-btn"
			type="button"
			onclick={() => onSelectAct(act)}
			aria-label="Select act: {act.title}"
		>
			<span class="act-title">{act.title}</span>
			{#if chapters.length > 0}
				<span class="act-badge">{chapters.length}</span>
			{/if}
		</GhostButton>
	</div>

	{#if expanded}
		<div class="act-chapters" role="group" aria-label="Chapters in {act.title}">
			{#each chapters as chapter (chapter.id)}
				<ChapterGroup
					{chapter}
					{selectedId}
					{onSelectChapter}
					{onSelectScene}
					onAddScene={(title) => onAddScene(chapter, title)}
					onDeleteScene={(id) => onDeleteScene(chapter, id)}
					onReorderScenes={(ids) => onReorderScenes(chapter, ids)}
					{onMoveScene}
				/>
			{/each}
			<div class="act-add-chapter">
				<AddChapterForm
					onAdd={(title) => onAddChapter(act.id, title)}
					bind:active={addChapterActive}
					entityLabel="Chapter"
					placeholder="Chapter title..."
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.act-group {
		margin-bottom: var(--space-3);
	}

	.act-header {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
	}

	:global(.act-expand-btn) {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-muted);
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
		transition: color var(--duration-fast) var(--ease-standard);
	}

	:global(.act-expand-btn:hover) {
		color: var(--color-text-secondary);
	}

	:global(.act-expand-btn:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.act-chevron {
		font-size: var(--text-xs);
	}

	:global(.act-select-btn) {
		flex: 1;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		transition: background var(--duration-fast) var(--ease-standard);
	}

	:global(.act-select-btn:hover) {
		background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
	}

	:global(.act-select-btn:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.act-title {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.act-badge {
		font-size: var(--text-xs);
		font-variant-numeric: tabular-nums;
		color: var(--color-text-muted);
		background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
		border-radius: var(--radius-full, 9999px);
		padding: 0 var(--space-2);
	}

	.act-chapters {
		padding-left: var(--space-4);
	}

	.act-add-chapter {
		margin-top: var(--space-2);
	}
</style>
