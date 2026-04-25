<script lang="ts">
	import type { Project } from '$lib/db/types.js';
	import { selectProject } from '../stores/project-hub.svelte.ts';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import { SurfaceCard } from '$lib/components/ui/index.js';

	let { project, cardIndex = 0 } = $props<{ project: Project; cardIndex?: number }>();

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}
</script>

<SurfaceCard class="project-card" style="--card-index: {cardIndex}">
	<div class="card-cover" aria-hidden="true"></div>
	<GhostButton class="card-btn" type="button" onclick={() => selectProject(project)}>
		{#if project.genre}
			<p class="card-genre">{project.genre}</p>
		{/if}
		<h2 class="card-title">{project.title || 'Untitled'}</h2>
		{#if project.logline}
			<p class="card-logline">{project.logline}</p>
		{/if}
		<p class="card-meta">Updated {formatDate(project.updatedAt)}</p>
	</GhostButton>
</SurfaceCard>

<style>
	:global(.project-card) {
		animation: novellum-enter var(--duration-enter) var(--ease-editorial) both;
		animation-delay: min(calc(var(--card-index, 0) * 40ms), 280ms);
	}

	:global(.project-card:hover) {
		--_shadow-override: var(--shadow-md);
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.project-card) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}

	.card-cover {
		aspect-ratio: 2 / 3;
		width: 100%;
		background-color: var(--color-surface-elevated);
		--_shadow: inset 0 0 0 1px var(--color-border-subtle);
		box-shadow: var(--_shadow);
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
		flex-shrink: 0;
	}

	:global(.card-btn) {
		display: block;
		width: 100%;
		padding: var(--space-4);
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
	}

	.card-genre {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-teal);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		margin-bottom: var(--space-2);
	}

	.card-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-tight);
		line-height: 1.2;
		color: var(--color-text-primary);
		margin-bottom: var(--space-2);
	}

	.card-logline {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-3);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>
