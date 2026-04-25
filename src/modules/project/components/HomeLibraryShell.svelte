<script lang="ts">
	import type { Project } from '$lib/db/types.js';
	import CollectionRow from './CollectionRow.svelte';
	import BookCoverCard from './BookCoverCard.svelte';
	import LibraryHeroCardSkeleton from './LibraryHeroCardSkeleton.svelte';
	import { EmptyStatePanel, Button } from '$lib/components/ui/index.js';

	type LibraryCollectionRow = {
		title: string;
		projects: Project[];
	};

	type LibraryCollectionGroup = {
		title: string;
		rows: LibraryCollectionRow[];
	};

	let {
		loading,
		totalCount,
		mostRecent = null,
		recentlyRead = [],
		worksInProgress = [],
		completedWorks = [],
		onOpenMostRecent = () => {},
		showHero = true,
		groupedCollections = [],
		cardDestination = 'reader'
	} = $props<{
		loading: boolean;
		totalCount: number;
		mostRecent?: Project | null;
		recentlyRead?: Project[];
		worksInProgress?: Project[];
		completedWorks?: Project[];
		onOpenMostRecent?: () => void;
		showHero?: boolean;
		groupedCollections?: LibraryCollectionGroup[];
		cardDestination?: 'reader' | 'hub';
	}>();
</script>

<div class="library-hub">
	{#if loading}
		<ul class="collection-list" role="list" aria-label="Loading library">
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
		</ul>
	{:else if totalCount === 0}
		<EmptyStatePanel
			title="Your library is ready for its first manuscript"
			description="Create a project to seed your shelf, then return here to continue reading and track progress across drafts."
		/>
	{:else}
		<div class="library-collections">
			{#if showHero && mostRecent}
				<section class="hero-banner" aria-label="Continue reading">
					<div class="hero-content">
						<header>
							<h2 class="hero-label">Continue Reading</h2>
							<h3 class="hero-title">{mostRecent.title || 'Untitled'}</h3>
						</header>
						<p class="hero-synopsis">{mostRecent.synopsis || 'No synopsis available.'}</p>
						<div class="hero-actions">
							<Button onclick={onOpenMostRecent}>Open Manuscript</Button>
							<a class="hero-link" href="/projects">Open Library</a>
						</div>
					</div>
					<div class="hero-cover">
						<BookCoverCard project={mostRecent} />
					</div>
				</section>
			{/if}

			{#if groupedCollections.length > 0}
				<div class="library-groups">
					{#each groupedCollections as group (group.title)}
						<section class="library-group" aria-label={group.title}>
							<header class="group-header">
								<h2 class="group-title">{group.title}</h2>
							</header>
							<div class="group-rows">
								{#each group.rows as row (row.title)}
									<CollectionRow title={row.title} projects={row.projects} {cardDestination} />
								{/each}
							</div>
						</section>
					{/each}
				</div>
			{:else}
				{#if recentlyRead.length > 0}
					<CollectionRow title="Recently Read" projects={recentlyRead} {cardDestination} />
				{/if}

				{#if worksInProgress.length > 0}
					<CollectionRow title="Works in Progress" projects={worksInProgress} {cardDestination} />
				{/if}

				{#if completedWorks.length > 0}
					<CollectionRow title="Completed Works" projects={completedWorks} {cardDestination} />
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.library-hub {
		max-width: 1100px;
		margin: 0 auto;
		padding: var(--space-10) 0;
	}

	.library-collections {
		display: flex;
		flex-direction: column;
		gap: var(--space-10);
	}

	.library-groups {
		display: flex;
		flex-direction: column;
		gap: var(--space-10);
	}

	.library-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.group-header {
		padding-inline: var(--space-6);
	}

	.group-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		line-height: var(--leading-tight);
		color: var(--color-text-primary);
	}

	.group-rows {
		display: flex;
		flex-direction: column;
	}

	.collection-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.hero-banner {
		display: flex;
		gap: var(--space-8);
		background-color: var(--color-surface-raised);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		border: 1px solid var(--color-border);
		align-items: center;
		box-shadow: var(--shadow-sm);
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
		color: var(--color-nova-blue);
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
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}

	.hero-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: var(--text-sm);
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			background-color var(--duration-fast) var(--ease-standard);
	}

	.hero-link:hover,
	.hero-link:focus-visible {
		border-color: var(--color-border-strong);
		color: var(--color-text-primary);
		background-color: var(--color-surface-glass);
		outline: none;
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

		.hero-actions {
			justify-content: center;
			flex-wrap: wrap;
		}
	}
</style>