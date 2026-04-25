<script lang="ts">
	import ReaderModePills from '$modules/reader/components/ReaderModePills.svelte';
	import ClassicReaderView from '$modules/reader/components/ClassicReaderView.svelte';
	import BookReaderView from '$modules/reader/components/BookReaderView.svelte';
	import ReaderFullscreenShell from '$modules/reader/components/ReaderFullscreenShell.svelte';
	import type { ReaderMode } from '$modules/reader/components/ReaderModePills.svelte';

	let {
		data,
	}: {
		data: {
			project: {
				id: string;
				title: string;
				coverUrl?: string;
				genre: string;
				logline: string;
			};
			chapters: {
				id: string;
				title: string;
				order: number;
				scenes: {
					id: string;
					title: string;
					order: number;
					content: string;
				}[];
			}[];
		};
	} = $props();

	let readerMode = $state<ReaderMode>('classic');

	function handleModeChange(next: ReaderMode) {
		readerMode = next;
	}
</script>

<svelte:head>
	<title>{data.project.title} — Reader — Novellum</title>
</svelte:head>

<section class="reader-route">
	<header class="reader-route__header">
		<a class="reader-route__back" href="/">Back to Library</a>
		<div class="reader-route__modes">
			<ReaderModePills mode={readerMode} onModeChange={handleModeChange} />
		</div>
	</header>

	{#if readerMode === 'classic'}
		<ClassicReaderView project={data.project} chapters={data.chapters} />
	{:else if readerMode === 'book'}
		<div class="reader-route__book">
			<BookReaderView project={data.project} chapters={data.chapters} />
		</div>
	{:else}
		<ReaderFullscreenShell
			project={data.project}
			chapters={data.chapters}
			onExit={() => handleModeChange('book')}
		/>
	{/if}
</section>

<style>
	.reader-route {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.reader-route__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		max-width: 1100px;
		width: 100%;
		margin: 0 auto;
		padding: var(--space-5) var(--space-4) 0;
	}

	.reader-route__back {
		text-decoration: none;
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		padding: var(--space-1) 0;
		border-bottom: 1px solid transparent;
		transition:
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.reader-route__back:hover {
		color: var(--color-text-secondary);
		border-color: var(--color-border-default);
	}

	.reader-route__back:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-xs);
	}

	.reader-route__modes {
		display: flex;
		justify-content: flex-end;
	}

	.reader-route__book {
		display: flex;
		justify-content: center;
		padding: var(--space-2) var(--space-4) var(--space-10);
	}
</style>
