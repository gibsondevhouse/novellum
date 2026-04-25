<script lang="ts">
	import type { ReaderPage } from '$modules/reader/reader-pages.js';
	import BookPage from './BookPage.svelte';

	interface Props {
		pages: Array<ReaderPage | null>;
		single?: boolean;
	}

	let { pages, single = false }: Props = $props();
</script>

<div class="book-spread" class:book-spread--single={single} role="presentation">
	{#each pages as page, index (page?.id ?? `blank-${index}`)}
		<BookPage {page} />
		{#if !single && index === 0 && pages.length > 1}
			<div class="book-gutter" aria-hidden="true"></div>
		{/if}
	{/each}
</div>

<style>
	.book-spread {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 0;
		width: min(100%, 1000px);
		aspect-ratio: 3 / 2;
		max-height: 80vh;
		min-height: 480px;
		box-shadow: var(--shadow-lg);
	}

	.book-spread--single {
		grid-template-columns: 1fr;
		width: min(100%, 540px);
		aspect-ratio: 3 / 4;
		max-height: 86vh;
	}

	.book-gutter {
		width: 1px;
		background: linear-gradient(
			to right,
			transparent,
			var(--color-border-default) 20%,
			var(--color-border-default) 80%,
			transparent
		);
		opacity: 0.6;
	}
</style>
