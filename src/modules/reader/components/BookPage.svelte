<script lang="ts">
	import type { ReaderPage } from '$modules/reader/reader-pages.js';

	interface Props {
		page: ReaderPage | null;
	}

	let { page }: Props = $props();

	const tocLines = $derived(
		page?.type === 'toc' && page.content ? page.content.split('\n').filter(Boolean) : [],
	);
</script>

<article
	class="book-page book-page--{page?.type ?? 'blank'}"
	aria-label={page ? page.title ?? page.chapterTitle ?? page.sceneTitle ?? 'Page' : 'Blank page'}
>
	{#if !page}
		<div class="book-page__blank" aria-hidden="true"></div>
	{:else if page.type === 'cover'}
		{#if page.imageUrl}
			<img class="book-page__cover-image" src={page.imageUrl} alt={page.title ? `Cover for ${page.title}` : 'Book cover'} />
		{:else}
			<div class="book-page__cover-fallback">
				<h1 class="book-page__cover-title">{page.title ?? ''}</h1>
			</div>
		{/if}
	{:else if page.type === 'title'}
		<div class="book-page__title-block">
			<h1 class="book-page__title">{page.title ?? ''}</h1>
			{#if page.subtitle}
				<p class="book-page__subtitle">{page.subtitle}</p>
			{/if}
			{#if page.content}
				<p class="book-page__meta">{page.content}</p>
			{/if}
		</div>
	{:else if page.type === 'toc'}
		<div class="book-page__toc">
			<h2 class="book-page__heading">{page.title ?? 'Contents'}</h2>
			<ol class="book-page__toc-list">
				{#each tocLines as line, index (index)}
					<li class="book-page__toc-item">{line}</li>
				{/each}
			</ol>
		</div>
	{:else if page.type === 'chapter-title'}
		<div class="book-page__chapter-title-block">
			{#if page.subtitle}
				<p class="book-page__eyebrow">{page.subtitle}</p>
			{/if}
			<h2 class="book-page__chapter-title">{page.title ?? ''}</h2>
		</div>
	{:else if page.type === 'scene'}
		<div class="book-page__scene">
			{#if page.sceneTitle}
				<p class="book-page__scene-title" aria-hidden="true">{page.sceneTitle}</p>
			{/if}
			<div class="book-page__scene-body">{page.content ?? ''}</div>
		</div>
	{:else if page.type === 'empty-scene' || page.type === 'empty-chapter'}
		<div class="book-page__empty">
			{#if page.sceneTitle || page.chapterTitle}
				<p class="book-page__empty-eyebrow">
					{page.sceneTitle ?? page.chapterTitle ?? ''}
				</p>
			{/if}
			<p class="book-page__empty-text">{page.content ?? ''}</p>
		</div>
	{:else if page.type === 'end'}
		<div class="book-page__end">
			<p class="book-page__end-eyebrow">{page.subtitle ?? ''}</p>
			<h2 class="book-page__end-title">{page.title ?? 'End'}</h2>
		</div>
	{/if}

	{#if page?.pageNumber !== undefined && page.type !== 'cover'}
		<footer class="book-page__footer" aria-hidden="true">{page.pageNumber}</footer>
	{/if}
</article>

<style>
	.book-page {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 100%;
                padding:
                        var(--reader-page-padding-block-start)
                        var(--reader-page-padding-inline)
                        var(--reader-page-padding-block-end);
                background: var(--color-surface-base);
                color: var(--color-text-primary);
                border: 1px solid var(--color-border-subtle);
                border-radius: var(--radius-lg);
		flex: 1;
	}

	.book-page__cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.book-page__cover-fallback {
		flex: 1;
		display: grid;
		place-items: center;
		padding: var(--space-8);
		background: var(--color-surface-overlay);
	}

	.book-page__cover-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		text-align: center;
		color: var(--color-text-primary);
		margin: 0;
	}

	.book-page__title-block {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--space-3);
		text-align: center;
	}

	.book-page__title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: var(--font-weight-normal);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		margin: 0;
	}

	.book-page__subtitle {
		font-family: var(--font-display);
		font-style: italic;
		font-size: var(--text-base);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.book-page__meta {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
	}

	.book-page__toc {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.book-page__heading {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		margin: 0;
	}

	.book-page__toc-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.book-page__toc-item {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.book-page__chapter-title-block {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: var(--space-2);
	}

	.book-page__eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
	}

	.book-page__chapter-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-normal);
		margin: 0;
	}

	.book-page__scene {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: 100%;
		max-width: var(--reader-measure-max);
		margin: 0 auto;
	}

	.book-page__scene-title {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
	}

	.book-page__scene-body {
		font-family: var(--reader-prose-font);
		font-size: var(--reader-prose-size);
		line-height: var(--reader-prose-leading);
		letter-spacing: var(--reader-prose-tracking);
		color: var(--color-text-primary);
		white-space: pre-wrap;
		hyphens: auto;
		overflow-wrap: anywhere;
	}

	.book-page__empty {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: var(--space-2);
	}

	.book-page__empty-eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
	}

	.book-page__empty-text {
		font-style: italic;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.book-page__end {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: var(--space-2);
	}

	.book-page__end-eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
	}

	.book-page__end-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		margin: 0;
	}

	.book-page__footer {
		position: absolute;
		bottom: var(--space-3);
		left: 0;
		right: 0;
		text-align: center;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>
