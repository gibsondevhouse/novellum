<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getProjects,
		getLoading,
		loadProjects,
		openReader
	} from '../modules/project/stores/project-hub.svelte.js';
	import CollectionRow from '../modules/project/components/CollectionRow.svelte';
	import BookCoverCard from '../modules/project/components/BookCoverCard.svelte';
	import LibraryHeroCardSkeleton from '../modules/project/components/LibraryHeroCardSkeleton.svelte';
	import { SectionHeader, EmptyStatePanel, Button } from '$lib/components/ui/index.js';

	onMount(async () => {
		await loadProjects();
	});

	const novels = $derived(getProjects().filter(p => p.projectType === 'novel' || !p.projectType));

	const recentlyRead = $derived(
		[...novels].sort((a, b) => {
			const dateA = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
			const dateB = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
			return dateB - dateA;
		}).slice(0, 5)
	);

	const mostRecent = $derived(recentlyRead.length > 0 ? recentlyRead[0] : null);

	// Status can be drafting, planning, revising, completed, archived. We just do simpler filters:
	const completedWorks = $derived(novels.filter(p => p.status === 'completed'));
	const worksInProgress = $derived(novels.filter(p => p.status !== 'completed'));
</script>

<svelte:head>
	<title>Library — Novellum</title>
</svelte:head>

<div class="library-hub">
	<SectionHeader
		title="Home Library"
		description="A living shelf of works-in-progress and completed manuscripts. Select a book to open the reader."
	/>

	{#if getLoading()}
		<ul class="collection-list" role="list" aria-label="Loading library">
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
		</ul>
	{:else if novels.length === 0}
		<EmptyStatePanel
			title="The shelf is empty."
			description="No books are currently available for reading."
		/>
	{:else}
		<div class="library-collections">
			{#if mostRecent}
				<section class="hero-banner">
					<div class="hero-content">
						<header>
							<h2 class="hero-label">Continue Reading</h2>
							<h3 class="hero-title">{mostRecent.title || 'Untitled'}</h3>
						</header>
						<p class="hero-synopsis">{mostRecent.synopsis || 'No synopsis available.'}</p>
						<div class="hero-actions">
							<Button onclick={() => openReader(mostRecent)}>Open Manuscript</Button>
						</div>
					</div>
					<div class="hero-cover">
						<BookCoverCard project={mostRecent} />
					</div>
				</section>
			{/if}

			{#if recentlyRead.length > 0}
				<CollectionRow title="Recently Read" projects={recentlyRead} />
			{/if}

			{#if worksInProgress.length > 0}
				<CollectionRow title="Works in Progress" projects={worksInProgress} />
			{/if}

			{#if completedWorks.length > 0}
				<CollectionRow title="Completed Works" projects={completedWorks} />
			{/if}
		</div>
	{/if}
</div>

<style>
	.library-hub {
		max-width: 1100px;
		margin: 0 auto;
		padding: var(--space-10) var(--panel-padding) var(--space-10);
	}

	.library-collections {
		display: flex;
		flex-direction: column;
		gap: var(--space-10);
	}

	.collection-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		list-style: none;
		padding: 0;
		margin: 0;
	}

	/* ── Hero Banner ── */
	.hero-banner {
		display: flex;
		gap: var(--space-8);
		background-color: var(--color-surface-hover);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		border: 1px solid var(--color-border);
		align-items: center;
	}

	.hero-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.hero-label {
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-brand);
		margin: 0 0 var(--space-2) 0;
		font-weight: var(--font-weight-bold);
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		margin: 0;
		color: var(--color-text-primary);
		line-height: 1.1;
	}

	.hero-synopsis {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0;
		max-width: 500px;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.hero-actions {
		margin-top: var(--space-2);
	}

	.hero-cover {
		flex-shrink: 0;
		width: 160px;
	}

	@media (max-width: 768px) {
		.hero-banner {
			flex-direction: column-reverse;
			text-align: center;
			padding: var(--space-6);
		}

		.hero-synopsis {
			margin: 0 auto;
		}
	}
</style>
