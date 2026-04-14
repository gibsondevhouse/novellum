<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getProjects,
		getLoading,
		loadProjects,
	} from '../../modules/project/stores/project-hub.svelte.ts';
	import LibraryHeroCard from '../../modules/project/components/LibraryHeroCard.svelte';
	import LibraryHeroCardSkeleton from '../../modules/project/components/LibraryHeroCardSkeleton.svelte';
	import ProjectCreateCard from '../../modules/project/components/ProjectCreateCard.svelte';

	let showCreateProject = $state(false);

	function openCreateProject(): void {
		showCreateProject = true;
	}

	function closeCreateProject(): void {
		showCreateProject = false;
	}

	onMount(async () => {
		await loadProjects();
	});
</script>

<svelte:head>
	<title>Books — Novellum</title>
</svelte:head>

<div class="library-hub">
	<header class="library-header">
		<div class="library-heading">
			<h1 class="library-title">Books</h1>
			<p class="library-subtitle">
				Your active projects shelf. Select a book to open its workspace.
			</p>
		</div>
		<button class="library-create-btn" onclick={openCreateProject}>New Project</button>
	</header>

	{#if getLoading()}
		<ul class="library-column" role="list" aria-label="Loading projects">
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
		</ul>
	{:else if getProjects().length === 0}
		<div class="empty-state">
			<div class="empty-text-block">
				<h2 class="empty-title">No active book projects yet.</h2>
				<p class="empty-subtitle">Projects you are currently working on will appear here.</p>
				<button class="library-empty-create-btn" onclick={openCreateProject}
					>Start New Project</button
				>
			</div>
		</div>
	{:else}
		<ul class="library-column" role="list" aria-label="Project library">
			{#each getProjects() as project, i (project.id)}
				<LibraryHeroCard {project} cardIndex={i} destination="workspace" />
			{/each}
		</ul>
	{/if}

	{#if showCreateProject}
		<ProjectCreateCard oncancel={closeCreateProject} />
	{/if}
</div>

<style>
	.library-hub {
		max-width: 1100px;
		margin: 0 auto;
		padding: var(--space-10) var(--panel-padding) var(--space-10);
	}

	.library-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.library-create-btn {
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-4);
		cursor: pointer;
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			background-color var(--duration-fast) var(--ease-standard);
	}

	.library-create-btn:hover {
		border-color: var(--color-border-strong);
		background: var(--color-surface-elevated);
	}

	.library-create-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.library-heading {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: 560px;
	}

	.library-title {
		font-family: var(--font-display);
		font-size: var(--text-5xl);
		font-weight: var(--font-weight-normal);
		letter-spacing: var(--tracking-tight);
		color: var(--color-text-primary);
		line-height: 1.1;
		margin: 0;
	}

	.library-subtitle {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
	}

	.library-column {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		text-align: center;
		padding: var(--space-8) var(--panel-padding);
	}

	.empty-text-block {
		max-width: 440px;
		margin-bottom: var(--space-6);
	}

	.empty-title {
		font-family: var(--font-display);
		font-size: var(--text-4xl);
		font-weight: var(--font-weight-normal);
		letter-spacing: var(--tracking-tight);
		color: var(--color-text-primary);
		line-height: 1.2;
		margin: 0 0 var(--space-3);
	}

	.empty-subtitle {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		margin: 0;
	}

	.library-empty-create-btn {
		margin-top: var(--space-5);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-5);
		cursor: pointer;
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			background-color var(--duration-fast) var(--ease-standard);
	}

	.library-empty-create-btn:hover {
		border-color: var(--color-border-strong);
		background: var(--color-surface-elevated);
	}

	.library-empty-create-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 640px) {
		.library-title {
			font-size: var(--text-4xl);
		}

		.library-subtitle {
			font-size: var(--text-sm);
		}

		.empty-state {
			min-height: 40vh;
		}
	}
</style>
