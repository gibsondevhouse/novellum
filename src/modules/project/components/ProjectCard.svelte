<script lang="ts">
	import type { Project } from '$lib/db/types.js';
	import { selectProject } from '../stores/project-hub.svelte.ts';

	let { project } = $props<{ project: Project }>();

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}
</script>

<li class="project-card">
	<button class="card-btn" onclick={() => selectProject(project)}>
		<h2 class="card-title">{project.title || 'Untitled'}</h2>
		{#if project.genre}
			<p class="card-genre">{project.genre}</p>
		{/if}
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
		transition: var(--transition-border);
		list-style: none;
	}

	.project-card:hover {
		border-color: var(--color-teal);
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

	.card-title {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin-bottom: var(--space-1);
	}

	.card-genre {
		font-size: var(--text-xs);
		color: var(--color-teal);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
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
