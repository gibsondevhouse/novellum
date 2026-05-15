<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ClassicReaderView from './ClassicReaderView.svelte';
	import BookReaderView from './BookReaderView.svelte';
	import ReaderFullscreenShell from './ReaderFullscreenShell.svelte';
	import ReaderModeToolbar from './ReaderModeToolbar.svelte';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/ui/SecondaryButton.svelte';
	import { hasReadableContent, resolveDeepLink } from '../reader-controller.js';
	import { getReaderMode, setReaderMode, setLastReadBookId } from '$lib/stores/reader-mode.svelte.js';
	import { defaults } from '$lib/stores/defaults.svelte.js';
	import type { ReaderInputChapter, ReaderInputProject } from '../reader-pages.js';

	let {
		project,
		chapters,
	}: {
		project: ReaderInputProject;
		chapters: ReaderInputChapter[];
	} = $props();

	onMount(async () => {
		setLastReadBookId(project.id);
		// honor Default Reader View preference on first open.
		const hasSavedMode =
			typeof localStorage !== 'undefined' &&
			localStorage.getItem('novellum:reader') !== null;
		if (!hasSavedMode) {
			await defaults.hydrate();
			setReaderMode(defaults.readerView);
		}
	});

	const isReadable = $derived(hasReadableContent(chapters));

	const sceneIdFromUrl = $derived(page.url.searchParams.get('scene'));
	const { targetSceneId, targetPageId } = $derived(
		resolveDeepLink(project, chapters, sceneIdFromUrl)
	);
</script>

{#if !isReadable}
	<div class="reader-empty-wrap">
			<EmptyStatePanel
				title="No story to read yet"
				description="This book doesn’t have any written scenes yet. Open the outline to plan it, or pick another book from your library."
			>
				{#snippet actions()}
					<PrimaryButton onclick={() => goto(`/projects/${project.id}`)}>
						Open project hub
					</PrimaryButton>
					<SecondaryButton onclick={() => goto('/projects')}>Pick another project</SecondaryButton>
				{/snippet}
			</EmptyStatePanel>
	</div>
{:else}
	<div class="reader-experience">
		{#if getReaderMode() !== 'fullscreen'}
			<ReaderModeToolbar />
		{/if}

		{#if getReaderMode() === 'classic'}
			<ClassicReaderView {project} {chapters} {targetSceneId} />
		{:else if getReaderMode() === 'book'}
			<BookReaderView {project} {chapters} {targetPageId} />
		{:else}
			<ReaderFullscreenShell
				{project}
				{chapters}
				{targetPageId}
				onExit={() => setReaderMode('book')}
			/>
		{/if}
	</div>
{/if}

<style>
	.reader-empty-wrap {
		max-width: 720px;
		margin: 0 auto;
		padding: var(--space-10) var(--space-5);
	}

	.reader-experience {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
