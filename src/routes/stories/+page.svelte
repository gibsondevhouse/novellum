<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getProjects,
		getLoading,
		loadProjects,
		submitCreate
	} from '$modules/project/stores/project-hub.svelte.js';
	import { SurfacePanel, SectionHeader, PrimaryButton, GhostButton, Input } from '$lib/components/ui/index.js';
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
	<header class="stories-header">
		<div class="stories-heading">
			<h1 class="stories-title">Stories</h1>
			<p class="stories-subtitle">
				Short-form narratives and single-scene pieces. Managed as focused, independent projects.
			</p>
		</div>
		<PrimaryButton onclick={() => showCreate = !showCreate}>
			{showCreate ? 'Cancel' : 'New Story'}
		</PrimaryButton>
	</header>

	{#if showCreate}
		<SurfacePanel class="create-story-panel">
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
	{/if}

	{#if getLoading()}
		<ul class="stories-list" role="list" aria-label="Loading stories">
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
		</ul>
	{:else if stories.length === 0}
		<div class="empty-state">
			<div class="empty-text-block">
				<h2 class="empty-title">No stories yet.</h2>
				<p class="empty-subtitle">Your short-form narratives will appear here.</p>
			</div>
			<PrimaryButton onclick={() => showCreate = true}>Create your first story</PrimaryButton>
		</div>
	{:else}
		<ul class="stories-list" role="list" aria-label="Stories collection">
			{#each stories as project, i (project.id)}
				<LibraryHeroCard {project} cardIndex={i} />
			{/each}
		</ul>
	{/if}
</div>

<style>
	.stories-hub {
		max-width: 1100px;
		margin: 0 auto;
		padding: var(--space-10) var(--panel-padding);
	}

	.stories-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.stories-heading {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: 560px;
	}

	.stories-title {
		font-family: var(--font-display);
		font-size: var(--text-5xl);
		font-weight: var(--font-weight-normal);
		letter-spacing: var(--tracking-tight);
		color: var(--color-text-primary);
		line-height: 1.1;
		margin: 0;
	}

	.stories-subtitle {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
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

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 40vh;
		text-align: center;
		padding: var(--space-8) var(--panel-padding);
		background: var(--color-surface-ground);
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-lg);
	}

	.empty-text-block {
		margin-bottom: var(--space-6);
	}

	.empty-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2);
	}

	.empty-subtitle {
		color: var(--color-text-muted);
	}
</style>
