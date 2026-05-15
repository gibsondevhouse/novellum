<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { Project } from '$lib/db/domain-types';
	import { getAllProjects } from '$modules/project/services/project-repository.js';

	let searchQuery = $state('');
	let loading = $state(true);
	let projects = $state<Project[]>([]);
	let loadFailed = $state(false);

	onMount(async () => {
		try {
			projects = await getAllProjects();
		} catch {
			loadFailed = true;
		} finally {
			loading = false;
		}
	});

	const normalizedQuery = $derived(searchQuery.trim().toLowerCase());
	const showResults = $derived(normalizedQuery.length > 0);

	const filteredProjects = $derived.by(() => {
		if (!normalizedQuery) return [];
		return projects
			.filter((project) => project.title.toLowerCase().includes(normalizedQuery))
			.slice(0, 6);
	});

	function openProject(projectId: string): void {
		void goto(`/projects/${projectId}`);
	}

	function handleInputKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Enter' || filteredProjects.length === 0) return;
		event.preventDefault();
		openProject(filteredProjects[0].id);
	}
</script>

<div class="sidebar-search" role="search">
	<svg
		class="sidebar-search__icon"
		xmlns="http://www.w3.org/2000/svg"
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<circle cx="11" cy="11" r="8"></circle>
		<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
	</svg>
	<input
		class="sidebar-search__input"
		type="search"
		placeholder="Search projects..."
		bind:value={searchQuery}
		onkeydown={handleInputKeydown}
		aria-label="Search projects"
		autocomplete="off"
	/>
</div>

{#if showResults}
	<div class="sidebar-search-results" aria-live="polite" aria-label="Project search results">
		{#if loading}
			<p class="sidebar-search-results__state">Loading projects...</p>
		{:else if loadFailed}
			<p class="sidebar-search-results__state">Search is unavailable right now.</p>
		{:else if projects.length === 0}
			<p class="sidebar-search-results__state">No projects yet.</p>
		{:else if filteredProjects.length === 0}
			<p class="sidebar-search-results__state">No matches.</p>
		{:else}
			<ul class="sidebar-search-results__list" role="list">
				{#each filteredProjects as project (project.id)}
					<li>
						<button
							type="button"
							class="sidebar-search-results__item"
							onclick={() => openProject(project.id)}
							aria-label={`Open ${project.title}`}
						>
							<span class="sidebar-search-results__title">{project.title}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.sidebar-search {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		margin: var(--space-1) var(--space-2);
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
	}

	.sidebar-search__icon {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.sidebar-search__input {
		background: none;
		border: none;
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		width: 100%;
		outline: none;
	}

	.sidebar-search__input::placeholder {
		color: var(--color-text-muted);
	}

	.sidebar-search__input:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.sidebar-search-results {
		margin: 0 var(--space-2) var(--space-2);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-ground);
	}

	.sidebar-search-results__state {
		font: var(--font-body-xs);
		color: var(--color-text-muted);
		margin: 0;
		padding: var(--space-2) var(--space-3);
	}

	.sidebar-search-results__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.sidebar-search-results__item {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
		color: var(--color-text-primary);
		font: var(--font-body-sm);
	}

	.sidebar-search-results__item:hover {
		background: var(--color-surface-glass);
	}

	.sidebar-search-results__item:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: -2px;
		background: var(--color-surface-glass);
	}

	.sidebar-search-results__title {
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
