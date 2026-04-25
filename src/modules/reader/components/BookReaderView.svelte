<script lang="ts">
	import { onMount } from 'svelte';
	import {
		buildReaderPages,
		type ReaderInputChapter,
		type ReaderInputProject,
		type ReaderPage,
	} from '$modules/reader/reader-pages.js';
	import BookSpread from './BookSpread.svelte';

	interface Props {
		project: ReaderInputProject;
		chapters: ReaderInputChapter[];
		fullscreen?: boolean;
	}

	let { project, chapters, fullscreen = false }: Props = $props();

	const pages: ReaderPage[] = $derived(buildReaderPages(project, chapters));

	let currentIndex = $state(0);
	let viewportWidth = $state<number | null>(null);

	const isSingle = $derived((viewportWidth ?? 1024) < 900);
	const pageStep = $derived(isSingle ? 1 : 2);

	const totalPages = $derived(pages.length);

	const visiblePages = $derived.by((): Array<ReaderPage | null> => {
		if (totalPages === 0) return [];
		if (isSingle) {
			return [pages[currentIndex] ?? null];
		}
		// Two-page spread, even pages on the left.
		const leftIndex = currentIndex - (currentIndex % 2);
		return [pages[leftIndex] ?? null, pages[leftIndex + 1] ?? null];
	});

	const displayPageNumber = $derived(currentIndex + 1);

	function clamp(next: number): number {
		if (next < 0) return 0;
		if (next > totalPages - 1) return Math.max(0, totalPages - 1);
		return next;
	}

	function goNext() {
		if (totalPages === 0) return;
		const baseIndex = isSingle ? currentIndex : currentIndex - (currentIndex % 2);
		currentIndex = clamp(baseIndex + pageStep);
	}

	function goPrev() {
		if (totalPages === 0) return;
		const baseIndex = isSingle ? currentIndex : currentIndex - (currentIndex % 2);
		currentIndex = clamp(baseIndex - pageStep);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.target instanceof HTMLElement) {
			const tag = event.target.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) return;
		}
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			goNext();
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			goPrev();
		}
	}

	onMount(() => {
		if (typeof window === 'undefined') return;
		const updateWidth = () => {
			viewportWidth = window.innerWidth;
		};
		updateWidth();
		window.addEventListener('resize', updateWidth);
		return () => {
			window.removeEventListener('resize', updateWidth);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="book-reader" class:book-reader--fullscreen={fullscreen}>
	<div class="book-reader__toolbar" aria-label="Reader controls">
		<span class="book-reader__counter" aria-live="polite">
			{#if totalPages === 0}
				No pages
			{:else}
				Page {displayPageNumber} of {totalPages}
			{/if}
		</span>
	</div>

	{#if totalPages === 0}
		<div class="book-reader__empty">
			<p>This book has no readable pages yet.</p>
		</div>
	{:else}
		<div class="book-reader__stage" aria-label="Book reader">
			<button
				type="button"
				class="book-reader__nav book-reader__nav--prev"
				onclick={goPrev}
				aria-label="Previous page"
				disabled={currentIndex === 0}
			>
				‹
			</button>

			<BookSpread pages={visiblePages} single={isSingle} />

			<button
				type="button"
				class="book-reader__nav book-reader__nav--next"
				onclick={goNext}
				aria-label="Next page"
				disabled={currentIndex >= totalPages - 1}
			>
				›
			</button>
		</div>
	{/if}
</div>

<style>
	.book-reader {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-6) var(--space-4);
		color: var(--color-text-primary);
	}

	.book-reader--fullscreen {
		flex: 1;
		justify-content: center;
		padding: var(--space-8);
	}

	.book-reader__toolbar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 1000px;
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.book-reader__counter {
		font-weight: var(--font-weight-semibold);
	}

	.book-reader__stage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		width: 100%;
	}

	.book-reader__nav {
		appearance: none;
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface-base);
		color: var(--color-text-secondary);
		font-size: var(--text-2xl);
		line-height: 1;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-full);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.book-reader__nav:hover:not(:disabled) {
		color: var(--color-text-primary);
		border-color: var(--color-border-default);
	}

	.book-reader__nav:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.book-reader__nav:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.book-reader__empty {
		padding: var(--space-8);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	@media (max-width: 720px) {
		.book-reader__nav {
			width: 32px;
			height: 32px;
			font-size: var(--text-xl);
		}
	}
</style>
