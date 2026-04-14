<script lang="ts">
	import type { Project } from '$lib/db/types.js';
	import { selectProject } from '../stores/project-hub.svelte.ts';

	let { project, cardIndex = 0 } = $props<{ project: Project; cardIndex?: number }>();

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}
</script>

<li class="project-card" style="--card-index: {cardIndex}">
	<div class="card-cover" aria-hidden="true"></div>
	<button class="card-btn" onclick={() => selectProject(project)}>
		{#if project.genre}
			<p class="card-genre">{project.genre}</p>
		{/if}
		<h2 class="card-title">{project.title || 'Untitled'}</h2>
		{#if project.logline}
			<p class="card-logline">{project.logline}</p>
		{/if}
		<p class="card-meta">Updated {formatDate(project.updatedAt)}</p>
	</button>
</li>

<style>
	.project-card {
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
		list-style: none;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard);
		animation: novellum-enter var(--duration-enter) var(--ease-editorial) both;
		animation-delay: min(calc(var(--card-index, 0) * 40ms), 280ms);
	}

	.project-card:hover {
		border-color: var(--color-border-strong);
		box-shadow: var(--shadow-md);
	}

	@media (prefers-reduced-motion: reduce) {
		.project-card {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}

	.card-cover {
		aspect-ratio: 2 / 3;
		width: 100%;
		background-color: var(--color-surface-elevated);
		box-shadow: inset 0 0 0 1px var(--color-border-subtle);
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
		flex-shrink: 0;
	}

	.card-btn {
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
