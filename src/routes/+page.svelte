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
	<header class="library-header">
		<div class="library-heading">
			<h1 class="library-title">Home Library</h1>
			<p class="library-subtitle">
				A living shelf of works-in-progress and completed manuscripts. Select a book to open the
				reader.
			</p>
		</div>
	</header>

	{#if getLoading()}
		<div class="loading-state">
			<p>Loading your library...</p>
		</div>
	{:else if novels.length === 0}
		<div class="empty-state">
			<div class="empty-text-block">
				<h2 class="empty-title">The shelf is empty.</h2>
				<p class="empty-subtitle">No books are currently available for reading.</p>
			</div>
		</div>
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
							<button class="hero-button" onclick={() => openReader(mostRecent)}>
								Open Manuscript
							</button>
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

	.loading-state {
		display: flex;
		justify-content: center;
		padding: var(--space-10);
		color: var(--color-text-muted);
	}

	.library-collections {
		display: flex;
		flex-direction: column;
		gap: var(--space-10);
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
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.hero-actions {
		margin-top: var(--space-2);
	}

	.hero-button {
		background-color: var(--color-brand);
		color: #fff;
		border: none;
		padding: var(--space-2) var(--space-6);
		border-radius: var(--radius-full);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.hero-button:hover {
		background-color: var(--color-brand-hover);
	}

	.hero-cover {
		flex-shrink: 0;
		width: 160px; /* Force a consistent cover size for the hero */
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
