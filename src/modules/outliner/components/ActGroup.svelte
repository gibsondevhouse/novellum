<script lang="ts">
	import type { Act, Chapter, Scene } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import ChapterGroup from './ChapterGroup.svelte';

	let {
		act,
		chapters,
		selectedId,
		onSelectChapter,
		onSelectScene,
		onSelectAct,
		onAddScene,
		onDeleteScene,
		onReorderScenes,
	} = $props<{
		act: Act;
		chapters: ChapterWithScenes[];
		selectedId: string | null;
		onSelectChapter: (chapter: Chapter) => void;
		onSelectScene: (scene: Scene) => void;
		onSelectAct: (act: Act) => void;
		onAddScene: (chapter: ChapterWithScenes, title: string) => void;
		onDeleteScene: (chapter: ChapterWithScenes, sceneId: string) => void;
		onReorderScenes: (chapter: ChapterWithScenes, ids: string[]) => void;
	}>();

	let expanded = $state(true);

	function handleHeaderKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			expanded = !expanded;
		}
	}
</script>

<div class="act-group" role="group" aria-label={act.title}>
	<div class="act-header">
		<button
			class="act-expand-btn"
			onclick={() => (expanded = !expanded)}
			onkeydown={handleHeaderKeydown}
			aria-label="{expanded ? 'Collapse' : 'Expand'} act"
		>
			<span class="act-chevron" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
		</button>
		<button
			class="act-select-btn"
			onclick={() => onSelectAct(act)}
			aria-label="Select act: {act.title}"
		>
			<span class="act-title">{act.title}</span>
			{#if chapters.length > 0}
				<span class="act-badge">{chapters.length}</span>
			{/if}
		</button>
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
				/>
			{/each}
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

	.act-expand-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-muted);
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
		transition: color 0.1s;
	}

	.act-expand-btn:hover {
		color: var(--color-text-secondary);
	}

	.act-expand-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.act-chevron {
		font-size: var(--text-xs);
	}

	.act-select-btn {
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
		transition: background 0.1s;
	}

	.act-select-btn:hover {
		background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
	}

	.act-select-btn:focus-visible {
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
</style>
