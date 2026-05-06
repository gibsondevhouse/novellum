<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ClassicReaderView from '$modules/reader/components/ClassicReaderView.svelte';
	import BookReaderView from '$modules/reader/components/BookReaderView.svelte';
	import ReaderFullscreenShell from '$modules/reader/components/ReaderFullscreenShell.svelte';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/ui/SecondaryButton.svelte';
	import { mapSceneIdToReaderPageId } from '$modules/reader/reader-pages.js';
	import { getReaderMode, setReaderMode, setLastReadBookId } from '$lib/stores/reader-mode.svelte.js';
	import { defaults } from '$lib/stores/defaults.svelte.js';

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

	onMount(async () => {
		setLastReadBookId(data.project.id);
		// plan-023 stage-007: honor Default Reader View preference on first open.
		// If the user has never saved a reader mode (no localStorage entry),
		// apply their preferred default instead of the hardcoded 'classic' fallback.
		const hasSavedMode =
			typeof localStorage !== 'undefined' &&
			localStorage.getItem('novellum:reader') !== null;
		if (!hasSavedMode) {
			await defaults.hydrate();
			setReaderMode(defaults.readerView);
		}
	});

	/**
	 * The reader is "empty" when the bound book has no scenes whose
	 * `content` contains any non-whitespace text. Cover, title, and
	 * TOC pages alone don't justify mounting the pagination engine.
	 */
	const hasReadableContent = $derived(
		data.chapters.some((chapter) =>
			chapter.scenes.some((scene) => (scene.content ?? '').replace(/<[^>]*>/g, '').trim().length > 0),
		),
	);

	/**
	 * plan-023 stage-003: reserved query param `?scene=<sceneId>`.
	 * Read once per mount and forwarded to the active reader view as a
	 * deep-link hint. Unknown ids resolve to `null` and the readers fall
	 * back to their saved/initial position. Not mutated after consumption
	 * so browser back returns to the originating editor cleanly.
	 */
	const targetSceneId = $derived(page.url.searchParams.get('scene'));
	const targetPageId = $derived(
		targetSceneId
			? mapSceneIdToReaderPageId(targetSceneId, data.project, data.chapters)
			: null,
	);
</script>

<svelte:head>
	<title>{data.project.title} — Reader — Novellum</title>
</svelte:head>

{#if !hasReadableContent}
	<div class="reader-empty-wrap">
		<EmptyStatePanel
			title="No story to read yet"
			description="This book doesn’t have any written scenes yet. Open the outline to plan it, or pick another book from your library."
		>
			{#snippet actions()}
				<PrimaryButton onclick={() => goto(`/projects/${data.project.id}`)}>
					Open project hub
				</PrimaryButton>
				<SecondaryButton onclick={() => goto('/books')}>Pick another book</SecondaryButton>
			{/snippet}
		</EmptyStatePanel>
	</div>
{:else if getReaderMode() === 'classic'}
	<ClassicReaderView project={data.project} chapters={data.chapters} {targetSceneId} />
{:else if getReaderMode() === 'book'}
	<BookReaderView project={data.project} chapters={data.chapters} {targetPageId} />
{:else}
	<ReaderFullscreenShell
		project={data.project}
		chapters={data.chapters}
		{targetPageId}
		onExit={() => setReaderMode('book')}
	/>
{/if}

<style>
	.reader-empty-wrap {
		max-width: 720px;
		margin: 0 auto;
		padding: var(--space-10) var(--space-5);
	}
</style>
