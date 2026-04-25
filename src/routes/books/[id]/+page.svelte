<script lang="ts">
	import { onMount } from 'svelte';
	import ClassicReaderView from '$modules/reader/components/ClassicReaderView.svelte';
	import BookReaderView from '$modules/reader/components/BookReaderView.svelte';
	import ReaderFullscreenShell from '$modules/reader/components/ReaderFullscreenShell.svelte';
	import { getReaderMode, setReaderMode, setLastReadBookId } from '$lib/stores/reader-mode.svelte.js';

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

	onMount(() => {
		setLastReadBookId(data.project.id);
	});

</script>

<svelte:head>
	<title>{data.project.title} — Reader — Novellum</title>
</svelte:head>

{#if getReaderMode() === 'classic'}
	<ClassicReaderView project={data.project} chapters={data.chapters} />
{:else if getReaderMode() === 'book'}
	<BookReaderView project={data.project} chapters={data.chapters} />
{:else}
	<ReaderFullscreenShell
		project={data.project}
		chapters={data.chapters}
		onExit={() => setReaderMode('book')}
	/>
{/if}
