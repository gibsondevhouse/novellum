<script lang="ts">
	import type { Arc } from '$lib/db/domain-types';
	import { GhostButton, SurfaceCard } from '$lib/components/ui/index.js';

	interface Props {
		arc: Arc;
		actCount: number;
		canMoveUp: boolean;
		canMoveDown: boolean;
		onOpen: (arc: Arc) => void;
		onEdit: (arc: Arc) => void;
		onDelete: (arc: Arc) => void;
		onMoveUp: (arc: Arc) => void;
		onMoveDown: (arc: Arc) => void;
	}

	let {
		arc,
		actCount,
		canMoveUp,
		canMoveDown,
		onOpen,
		onEdit,
		onDelete,
		onMoveUp,
		onMoveDown,
	}: Props = $props();
</script>

<SurfaceCard class="arc-card">
	<div class="arc-card__body">
		<button
			class="arc-card__open"
			type="button"
			onclick={() => onOpen(arc)}
			aria-label="Open arc {arc.title}"
		>
			{#if arc.arcType}
				<p class="arc-card__type">{arc.arcType.replace(/^custom:/, '')}</p>
			{/if}
			<h3 class="arc-card__title">{arc.title || 'Untitled arc'}</h3>
			{#if arc.purpose}
				<p class="arc-card__purpose">{arc.purpose}</p>
			{/if}
			{#if arc.description}
				<p class="arc-card__description">{arc.description}</p>
			{/if}
			<p class="arc-card__meta">
				{actCount} {actCount === 1 ? 'act' : 'acts'}
				{#if arc.status}· <span>{arc.status.replace(/_/g, ' ')}</span>{/if}
			</p>
		</button>

		<div class="arc-card__actions" role="group" aria-label="Arc actions">
			<GhostButton
				type="button"
				disabled={!canMoveUp}
				onclick={() => onMoveUp(arc)}
				aria-label="Move {arc.title} up"
			>
				↑
			</GhostButton>
			<GhostButton
				type="button"
				disabled={!canMoveDown}
				onclick={() => onMoveDown(arc)}
				aria-label="Move {arc.title} down"
			>
				↓
			</GhostButton>
			<GhostButton type="button" onclick={() => onEdit(arc)}>Edit</GhostButton>
			<GhostButton type="button" onclick={() => onDelete(arc)}>Delete</GhostButton>
		</div>
	</div>
</SurfaceCard>

<style>
	:global(.arc-card) {
		display: block;
	}

	.arc-card__body {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
	}

	.arc-card__open {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
		padding: 0;
	}

	.arc-card__open:focus-visible {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: 4px;
		border-radius: var(--radius-sm);
	}

	.arc-card__type {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-teal);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		margin: 0 0 var(--space-2) 0;
	}

	.arc-card__title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-tight);
		line-height: 1.2;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2) 0;
	}

	.arc-card__purpose {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-2) 0;
	}

	.arc-card__description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-2) 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.arc-card__meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.arc-card__actions {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		justify-content: flex-end;
	}
</style>
