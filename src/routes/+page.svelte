<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getProjects,
		getLoading,
		loadProjects,
	} from '../modules/project/stores/project-hub.svelte.ts';
	import ProjectCard from '../modules/project/components/ProjectCard.svelte';
	import ProjectCreateCard from '../modules/project/components/ProjectCreateCard.svelte';

	let showCreateForm = $state(false);

	onMount(async () => {
		await loadProjects();
	});
</script>

<svelte:head>
	<title>Projects — Novellum</title>
</svelte:head>

<div class="project-hub">
	<header class="hub-header">
		<h1>Projects</h1>
		<button class="btn-primary" onclick={() => (showCreateForm = true)}>New Project</button>
	</header>

	{#if getLoading()}
		<p class="loading-text">Loading projects…</p>
	{:else if getProjects().length === 0}
		<div class="empty-state">
			<p class="empty-title">No projects yet</p>
			<p class="empty-subtitle">Start writing your novel.</p>
			<button class="btn-primary" onclick={() => (showCreateForm = true)}>
				Create Your First Project
			</button>
		</div>
	{:else}
		<ul class="project-grid" role="list">
			{#each getProjects() as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</ul>
	{/if}

	{#if showCreateForm}
		<ProjectCreateCard oncancel={() => (showCreateForm = false)} />
	{/if}
</div>

<style>
	.project-hub {
		max-width: 960px;
		margin: 0 auto;
	}

	.hub-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-16) var(--space-8);
		color: var(--color-text-secondary);
	}

	.empty-title {
		font-size: var(--text-xl);
		color: var(--color-text-primary);
		margin-bottom: var(--space-2);
	}

	.empty-subtitle {
		margin-bottom: var(--space-6);
	}

	.loading-text {
		color: var(--color-text-muted);
		padding: var(--space-8);
		text-align: center;
	}

	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--space-4);
		list-style: none;
		padding: 0;
	}

</style>
