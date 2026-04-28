<script lang="ts">
	import type { Chapter } from '$lib/db/types.js';
	import { GhostButton, SurfaceCard } from '$lib/components/ui/index.js';

	interface Props {
		chapter: Chapter;
		sceneCount: number;
		canMoveUp: boolean;
		canMoveDown: boolean;
		onOpen: (chapter: Chapter) => void;
		onEdit: (chapter: Chapter) => void;
		onDelete: (chapter: Chapter) => void;
		onMoveUp: (chapter: Chapter) => void;
		onMoveDown: (chapter: Chapter) => void;
	}

	let {
		chapter,
		sceneCount,
		canMoveUp,
		canMoveDown,
		onOpen,
		onEdit,
		onDelete,
		onMoveUp,
		onMoveDown,
	}: Props = $props();
</script>

<SurfaceCard class="chapter-card">
	<div class="chapter-card__body">
		<button
			class="chapter-card__open"
			type="button"
			onclick={() => onOpen(chapter)}
			aria-label="Open chapter {chapter.title}"
		>
			<h3 class="chapter-card__title">{chapter.title || 'Untitled chapter'}</h3>
			{#if chapter.summary}
				<p class="chapter-card__summary">{chapter.summary}</p>
			{/if}
			<p class="chapter-card__meta">
				{sceneCount} {sceneCount === 1 ? 'scene' : 'scenes'} · {chapter.wordCount ?? 0} words
			</p>
		</button>

		<div class="chapter-card__actions" role="group" aria-label="Chapter actions">
			<GhostButton
				type="button"
				disabled={!canMoveUp}
				onclick={() => onMoveUp(chapter)}
				aria-label="Move {chapter.title} up"
			>
				↑
			</GhostButton>
			<GhostButton
				type="button"
				disabled={!canMoveDown}
				onclick={() => onMoveDown(chapter)}
				aria-label="Move {chapter.title} down"
			>
				↓
			</GhostButton>
			<GhostButton type="button" onclick={() => onEdit(chapter)}>Edit</GhostButton>
			<GhostButton type="button" onclick={() => onDelete(chapter)}>Delete</GhostButton>
		</div>
	</div>
</SurfaceCard>

<style>
	:global(.chapter-card) {
		display: block;
	}

	.chapter-card__body {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
	}

	.chapter-card__open {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
		padding: 0;
	}

	.chapter-card__open:focus-visible {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: 4px;
		border-radius: var(--radius-sm);
	}

	.chapter-card__title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2) 0;
	}

	.chapter-card__summary {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-2) 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.chapter-card__meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.chapter-card__actions {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		justify-content: flex-end;
	}
</style>
