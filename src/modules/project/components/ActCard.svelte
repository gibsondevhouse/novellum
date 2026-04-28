<script lang="ts">
	import type { Act } from '$lib/db/types.js';
	import { GhostButton, SurfaceCard } from '$lib/components/ui/index.js';

	interface Props {
		act: Act;
		chapterCount: number;
		canMoveUp: boolean;
		canMoveDown: boolean;
		showMoveToArc?: boolean;
		onOpen: (act: Act) => void;
		onEdit: (act: Act) => void;
		onDelete: (act: Act) => void;
		onMoveUp: (act: Act) => void;
		onMoveDown: (act: Act) => void;
		onMoveToArc?: (act: Act) => void;
	}

	let {
		act,
		chapterCount,
		canMoveUp,
		canMoveDown,
		showMoveToArc = false,
		onOpen,
		onEdit,
		onDelete,
		onMoveUp,
		onMoveDown,
		onMoveToArc,
	}: Props = $props();
</script>

<SurfaceCard class="act-card">
	<div class="act-card__body">
		<button
			class="act-card__open"
			type="button"
			onclick={() => onOpen(act)}
			aria-label="Open act {act.title}"
		>
			<h3 class="act-card__title">{act.title || 'Untitled act'}</h3>
			{#if act.planningNotes}
				<p class="act-card__notes">{act.planningNotes}</p>
			{/if}
			<p class="act-card__meta">
				{chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
			</p>
		</button>

		<div class="act-card__actions" role="group" aria-label="Act actions">
			{#if showMoveToArc && onMoveToArc}
				<GhostButton type="button" onclick={() => onMoveToArc(act)}>Move to this arc</GhostButton>
			{/if}
			<GhostButton
				type="button"
				disabled={!canMoveUp}
				onclick={() => onMoveUp(act)}
				aria-label="Move {act.title} up"
			>
				↑
			</GhostButton>
			<GhostButton
				type="button"
				disabled={!canMoveDown}
				onclick={() => onMoveDown(act)}
				aria-label="Move {act.title} down"
			>
				↓
			</GhostButton>
			<GhostButton type="button" onclick={() => onEdit(act)}>Edit</GhostButton>
			<GhostButton type="button" onclick={() => onDelete(act)}>Delete</GhostButton>
		</div>
	</div>
</SurfaceCard>

<style>
	:global(.act-card) {
		display: block;
	}

	.act-card__body {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
	}

	.act-card__open {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
		padding: 0;
	}

	.act-card__open:focus-visible {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: 4px;
		border-radius: var(--radius-sm);
	}

	.act-card__title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2) 0;
	}

	.act-card__notes {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-2) 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.act-card__meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.act-card__actions {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		justify-content: flex-end;
	}
</style>
