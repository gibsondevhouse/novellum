<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getProjects,
		getLoading,
		loadProjects,
		submitCreate
	} from '$modules/project/stores/project-hub.svelte.js';
	import { SurfacePanel, SectionHeader, PrimaryButton, GhostButton, Input, PageHeader, EmptyStatePanel } from '$lib/components/ui/index.js';
	import LibraryHeroCard from '$modules/project/components/LibraryHeroCard.svelte';
	import LibraryHeroCardSkeleton from '$modules/project/components/LibraryHeroCardSkeleton.svelte';
	import type { Project } from '$lib/db/types.js';

	let showCreate = $state(false);
	let newStoryTitle = $state('');

	onMount(async () => {
		await loadProjects();
	});

	const stories = $derived(getProjects().filter((p: Project) => p.projectType === 'story'));

	async function handleCreateStory() {
		if (!newStoryTitle.trim()) return;
		await submitCreate({
			title: newStoryTitle.trim(),
			projectType: 'story',
			targetWordCount: 5000
		});
		newStoryTitle = '';
		showCreate = false;
	}
</script>

<svelte:head>
	<title>Stories — Novellum</title>
</svelte:head>

<div class="stories-hub">
	<PageHeader
		title="Stories"
		description="Short-form narratives and single-scene pieces. Managed as focused, independent projects."
	>
		{#snippet actions()}
			<PrimaryButton onclick={() => (showCreate = !showCreate)}>
				{showCreate ? 'Cancel' : 'New Story'}
			</PrimaryButton>
		{/snippet}
	</PageHeader>

	{#if showCreate}
		<div class="create-story-panel">
			<SurfacePanel>
				<SectionHeader title="Start a New Story" />
				<div class="create-story-form">
					<Input
						label="Story Title"
						placeholder="Enter the title of your short story..."
						bind:value={newStoryTitle}
						onkeydown={(e) => e.key === 'Enter' && handleCreateStory()}
					/>
					<div class="form-actions">
						<PrimaryButton onclick={handleCreateStory} disabled={!newStoryTitle.trim()}>
							Create Story
						</PrimaryButton>
						<GhostButton onclick={() => showCreate = false}>Cancel</GhostButton>
					</div>
				</div>
			</SurfacePanel>
		</div>
	{/if}

	{#if getLoading()}
		<ul class="stories-list" role="list" aria-label="Loading stories">
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
		</ul>
	{:else if stories.length === 0}
		<EmptyStatePanel
			title="No stories yet."
			description="Your short-form narratives will appear here."
		>
			{#snippet actions()}
				<PrimaryButton onclick={() => showCreate = true}>Create your first story</PrimaryButton>
			{/snippet}
		</EmptyStatePanel>
	{:else}
		<ul class="stories-list" role="list" aria-label="Stories collection">
			{#each stories as project, i (project.id)}
				<LibraryHeroCard {project} cardIndex={i} destination="hub" />
			{/each}
		</ul>
	{/if}
</div>

<style>
	.stories-hub {
		max-width: 1100px;
		margin: 0 auto;
		padding: var(--space-10) 0;
	}

	.stories-hub :global(.page-header) {
		margin-bottom: var(--space-8);
	}

	.create-story-panel {
		margin-bottom: var(--space-8);
		animation: slide-down var(--duration-enter) var(--ease-decelerate);
	}

	@keyframes slide-down {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.create-story-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-top: var(--space-4);
	}

	.form-actions {
		display: flex;
		gap: var(--space-3);
	}

	.stories-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		list-style: none;
		padding: 0;
		margin: 0;
	}
</style>
