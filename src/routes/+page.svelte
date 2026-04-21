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
	import { EmptyStatePanel, Button } from '$lib/components/ui/index.js';

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
	<header class="library-spotlight" aria-labelledby="library-title">
		<div class="library-spotlight__glow" aria-hidden="true"></div>
		<div class="library-spotlight__content">
			<p class="library-spotlight__eyebrow">Editorial Library</p>
			<h1 id="library-title" class="library-spotlight__title">Home Library</h1>
			<p class="library-spotlight__description">
				A cinematic shelf of active drafts and completed manuscripts. Continue where you left
				off or browse your full catalog.
			</p>
		</div>
	</header>

	{#if getLoading()}
		<ul class="collection-list" role="list" aria-label="Loading library">
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
			<LibraryHeroCardSkeleton />
		</ul>
	{:else if novels.length === 0}
		<EmptyStatePanel
			title="Your library is ready for its first manuscript"
			description="Create a project to seed your shelf, then return here to continue reading and track progress across drafts."
		/>
	{:else}
		<div class="library-collections">
			{#if mostRecent}
				<section class="hero-banner" aria-label="Continue reading">
					<div class="hero-content">
						<header>
							<h2 class="hero-label">Continue Reading</h2>
							<h3 class="hero-title">{mostRecent.title || 'Untitled'}</h3>
						</header>
						<p class="hero-synopsis">{mostRecent.synopsis || 'No synopsis available.'}</p>
						<div class="hero-actions">
							<Button onclick={() => openReader(mostRecent)}>Open Manuscript</Button>
							<a class="hero-link" href="/projects">Open Library</a>
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

	.library-spotlight {
		position: relative;
		overflow: hidden;
		padding: var(--space-8);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-xl);
		background:
			linear-gradient(155deg, var(--color-surface-raised) 0%, var(--color-surface-overlay) 100%),
			var(--gradient-spotlight);
		margin-bottom: var(--space-8);
	}

	.library-spotlight__glow {
		position: absolute;
		inset: -35% -20% auto;
		height: 420px;
		background:
			radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--color-nova-blue) 22%, transparent), transparent 44%),
			radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--color-teal) 14%, transparent), transparent 36%);
		pointer-events: none;
	}

	.library-spotlight__content {
		position: relative;
		max-width: 56ch;
		display: grid;
		gap: var(--space-3);
	}

	.library-spotlight__eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-teal);
	}

	.library-spotlight__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(var(--text-3xl), 4.2vw, var(--text-5xl));
		line-height: 1.05;
		color: var(--color-text-primary);
	}

	.library-spotlight__description {
		margin: 0;
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
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
		.library-spotlight {
			padding: var(--space-6);
		}

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
