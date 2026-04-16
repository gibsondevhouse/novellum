<script lang="ts">
        import { onMount } from 'svelte';
        import {
                getProjects,
                getLoading,
                loadProjects,
                submitCreate
        } from '$modules/project/stores/project-hub.svelte.js';
        import LibraryHeroCard from '$modules/project/components/LibraryHeroCard.svelte';
        import LibraryHeroCardSkeleton from '$modules/project/components/LibraryHeroCardSkeleton.svelte';
        import ProjectCreateCard from '$modules/project/components/ProjectCreateCard.svelte';
        import { SurfacePanel, SectionHeader, PrimaryButton, GhostButton, Input, EmptyStatePanel } from '$lib/components/ui/index.js';
        import type { Project } from '$lib/db/types.js';

        let showCreateBook = $state(false);
        let showCreateStory = $state(false);
        let newStoryTitle = $state('');

        onMount(async () => {
                await loadProjects();
        });

        const books = $derived(getProjects().filter((p: Project) => p.projectType === 'novel' || !p.projectType));
        const stories = $derived(getProjects().filter((p: Project) => p.projectType === 'story'));

        function openCreateBook(): void {
                showCreateBook = true;
        }

        function closeCreateBook(): void {
                showCreateBook = false;
        }

        async function handleCreateStory() {
                if (!newStoryTitle.trim()) return;
                await submitCreate({
                        title: newStoryTitle.trim(),
                        projectType: 'story',
                        targetWordCount: 5000
                });
                newStoryTitle = '';
                showCreateStory = false;
        }
</script>

<svelte:head>
        <title>Projects — Novellum</title>
</svelte:head>

<div class="projects-hub">
        <header class="projects-header">
                <div class="projects-heading">
                        <h1 class="projects-title">Projects</h1>
                        <p class="projects-subtitle">
                                Your active workspace for books and short stories. Select a project to open it.
                        </p>
                </div>
        </header>

        <div class="projects-grid">
                <!-- Stories Column -->
                <div class="projects-column">
                        <SectionHeader
                                title="Stories"
                                description="Short-form narratives and single-scene pieces."
                        >
                                {#snippet actions()}
                                        <PrimaryButton onclick={() => showCreateStory = !showCreateStory}>
                                                {showCreateStory ? 'Cancel' : 'New Story'}
                                        </PrimaryButton>
                                {/snippet}
                        </SectionHeader>

                        {#if showCreateStory}
                                <div class="create-story-panel">
                                        <SurfacePanel>
                                                <SectionHeader title="Start a New Story" />
                                                <div class="create-story-form">
                                                        <Input
                                                                id="new-story-title"
                                                                label="Story Title"
                                                                placeholder="Enter the title of your short story..."
                                                                bind:value={newStoryTitle}
                                                                onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleCreateStory()}
                                                        />
                                                        <div class="form-actions">
                                                                <PrimaryButton onclick={handleCreateStory} disabled={!newStoryTitle.trim()}>
                                                                        Create Story
                                                                </PrimaryButton>
                                                                <GhostButton onclick={() => showCreateStory = false}>Cancel</GhostButton>
                                                        </div>
                                                </div>
                                        </SurfacePanel>
                                </div>
                        {/if}

                        {#if getLoading()}
                                <SurfacePanel>
                                        <ul class="project-list" role="list" aria-label="Loading stories">
                                                <LibraryHeroCardSkeleton />
                                                <LibraryHeroCardSkeleton />
                                        </ul>
                                </SurfacePanel>
                        {:else if stories.length === 0}
                                <EmptyStatePanel
                                        title="No stories yet."
                                        description="Your short-form narratives will appear here."
                                >
                                        {#snippet actions()}
                                                <PrimaryButton onclick={() => showCreateStory = true}>Create your first story</PrimaryButton>
                                        {/snippet}
                                </EmptyStatePanel>
                        {:else}
                                <SurfacePanel>
                                        <ul class="project-list" role="list" aria-label="Stories collection">
                                                {#each stories as project, i (project.id)}
                                                        <LibraryHeroCard {project} cardIndex={i} />
                                                {/each}
                                        </ul>
                                </SurfacePanel>
                        {/if}
                </div>

                <!-- Books Column -->
                <div class="projects-column">
                        <SectionHeader
                                title="Books"
                                description="Long-form narratives and novels."
                        >
                                {#snippet actions()}
                                        <PrimaryButton onclick={openCreateBook}>New Book</PrimaryButton>
                                {/snippet}
                        </SectionHeader>

                        {#if showCreateBook}
                                <div class="create-card-wrapper">
                                        <ProjectCreateCard oncancel={closeCreateBook} />
                                </div>
                        {/if}

                        {#if getLoading()}
                                <SurfacePanel>
                                        <ul class="project-list" role="list" aria-label="Loading books">
                                                <LibraryHeroCardSkeleton />
                                                <LibraryHeroCardSkeleton />
                                        </ul>
                                </SurfacePanel>
                        {:else if books.length === 0}
                                <EmptyStatePanel
                                        title="No active book projects yet."
                                        description="Novels you are working on will appear here."
                                >
                                        {#snippet actions()}
                                                <PrimaryButton onclick={openCreateBook}>Start New Book</PrimaryButton>
                                        {/snippet}
                                </EmptyStatePanel>
                        {:else}
                                <SurfacePanel>
                                        <ul class="project-list" role="list" aria-label="Book projects">
                                                {#each books as project, i (project.id)}
                                                        <LibraryHeroCard {project} cardIndex={i} />
                                                {/each}
                                        </ul>
                                </SurfacePanel>
                        {/if}
                </div>
        </div>
</div>

<style>
        .projects-hub {
                max-width: 1400px;
                margin: 0 auto;
                padding: var(--space-10) var(--panel-padding);
        }

        .projects-header {
                margin-bottom: var(--space-8);
        }

        .projects-heading {
                display: flex;
                flex-direction: column;
                gap: var(--space-2);
                max-width: 560px;
        }

        .projects-title {
                font-family: var(--font-display);
                font-size: var(--text-5xl);
                font-weight: var(--font-weight-normal);
                letter-spacing: var(--tracking-tight);
                color: var(--color-text-primary);
                line-height: 1.1;
                margin: 0;
        }

        .projects-subtitle {
                font-family: var(--font-sans);
                font-size: var(--text-base);
                color: var(--color-text-muted);
                line-height: var(--leading-relaxed);
                margin: 0;
        }

        .projects-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: var(--space-8);
        }

        @media (min-width: 900px) {
                .projects-grid {
                        grid-template-columns: 1fr 1fr;
                }
        }

        .projects-column {
                display: flex;
                flex-direction: column;
                gap: var(--space-4);
        }

        .create-card-wrapper {
                margin-bottom: var(--space-6);
        }

        .create-story-panel {
                margin-bottom: var(--space-6);
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

        .project-list {
                display: flex;
                flex-direction: column;
                gap: var(--space-5);
                list-style: none;
                padding: 0;
                margin: 0;
        }
</style>