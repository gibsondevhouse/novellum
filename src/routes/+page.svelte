<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getProjects,
		getLoading,
		loadProjects,
	} from '../modules/project/stores/project-hub.svelte.ts';
	import LibraryHeroCard from '../modules/project/components/LibraryHeroCard.svelte';
	import LibraryHeroCardSkeleton from '../modules/project/components/LibraryHeroCardSkeleton.svelte';

	onMount(async () => {
		await loadProjects();
	});

	const novels = $derived(getProjects().filter(p => p.projectType === 'novel' || !p.projectType));
</script>

<svelte:head>
	<title>Library — Novellum</title>
</svelte:head>

<div class="library-hub">
	<header class="library-header">
		<div class="library-heading">
			<h1 class="library-title">Literary Library</h1>
			<p class="library-subtitle">
				A living shelf of works-in-progress and completed manuscripts. Select a book to open the
				reader.
			</p>
		</div>
	</header>

	{#if getLoading()}
		<ul class="library-column" role="list" aria-label="Loading projects">
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
		</ul>
	{:else if novels.length === 0}
		<div class="empty-state">
			<div class="empty-text-block">
				<h2 class="empty-title">The shelf is empty.</h2>
				<p class="empty-subtitle">No books are currently available for reading.</p>
			</div>
		</div>
	{:else}
		<ul class="library-column" role="list" aria-label="Project library">
			{#each novels as project, i (project.id)}
				<LibraryHeroCard {project} cardIndex={i} />
			{/each}
		</ul>
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

	/* ── Empty state ── */
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
