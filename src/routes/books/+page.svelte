<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		getProjects,
		getLoading,
		loadProjects,
	} from '../../modules/project/stores/project-hub.svelte.ts';
	import LibraryHeroCard from '../../modules/project/components/LibraryHeroCard.svelte';
	import LibraryHeroCardSkeleton from '../../modules/project/components/LibraryHeroCardSkeleton.svelte';
	import ProjectCreateCard from '../../modules/project/components/ProjectCreateCard.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import SurfacePanel from '$lib/components/ui/SurfacePanel.svelte';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import { getLastReadBookId } from '$lib/stores/reader-mode.svelte.js';

	let showLibrary = $state(false);
	let showCreateProject = $state(false);

	function openCreateProject(): void {
		showCreateProject = true;
	}

	function closeCreateProject(): void {
		showCreateProject = false;
	}

	onMount(async () => {
		// If the header's "+" button navigated here with ?create=1,
		// honour that immediately and skip the last-read redirect so
		// the user can actually reach the create modal.
		if (page.url.searchParams.has('create')) {
			showLibrary = true;
			showCreateProject = true;
			await loadProjects();
			return;
		}
		// If the user has a last-read book and didn't explicitly request the library, redirect.
		const lastId = getLastReadBookId();
		if (lastId && !page.url.searchParams.has('library')) {
			await goto(`/books/${lastId}`, { replaceState: true });
			return;
		}
		showLibrary = true;
		await loadProjects();
	});
</script>

<svelte:head>
	<title>Books — Novellum</title>
</svelte:head>

{#if showLibrary}
<div class="library-hub">
	<SectionHeader
		title="Books"
		description="Your active projects shelf. Select a book to open its outline."
	>
		{#snippet actions()}
			<PrimaryButton onclick={openCreateProject}>New Project</PrimaryButton>
		{/snippet}
	</SectionHeader>

	{#if getLoading()}
		<SurfacePanel>
			<ul class="library-column" role="list" aria-label="Loading projects">
				<LibraryHeroCardSkeleton />
				<LibraryHeroCardSkeleton />
				<LibraryHeroCardSkeleton />
			</ul>
		</SurfacePanel>
	{:else if getProjects().length === 0}
		<EmptyStatePanel
			title="No active book projects yet."
			description="Projects you are currently working on will appear here."
		>
			{#snippet actions()}
				<PrimaryButton onclick={openCreateProject}>Start New Project</PrimaryButton>
			{/snippet}
		</EmptyStatePanel>
	{:else}
		<SurfacePanel>
			<ul class="library-column" role="list" aria-label="Project library">
				{#each getProjects() as project, i (project.id)}
					<LibraryHeroCard {project} cardIndex={i} destination="outline" />
				{/each}
			</ul>
		</SurfacePanel>
	{/if}

	{#if showCreateProject}
		<ProjectCreateCard oncancel={closeCreateProject} />
	{/if}
</div>
{/if}

<style>
	.library-hub {
		max-width: 1100px;
		margin: 0 auto;
		padding: var(--space-10) 0;
	}

	.library-column {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		list-style: none;
		padding: 0;
		margin: 0;
	}
</style>
