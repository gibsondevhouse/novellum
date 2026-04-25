<script lang="ts">


	interface ClassicProject {
		id: string;
		title: string;
		coverUrl?: string;
		genre: string;
		logline: string;
	}

	interface ClassicScene {
		id: string;
		title: string;
		order: number;
		content: string;
	}

	interface ClassicChapter {
		id: string;
		title: string;
		order: number;
		scenes: ClassicScene[];
	}

	interface Props {
		project: ClassicProject;
		chapters: ClassicChapter[];
	}

	let { project, chapters }: Props = $props();

	function extractReadableText(html: string): string {
		if (!html.trim()) return '';
		const doc = new DOMParser().parseFromString(html, 'text/html');
		const paragraphNodes = Array.from(
			doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote'),
		);
		if (paragraphNodes.length > 0) {
			const chunks = paragraphNodes.map((node) => node.textContent?.trim() ?? '').filter(Boolean);
			return chunks.join('\n\n');
		}
		return (doc.body.textContent ?? '').trim();
	}

	const genres = $derived(
		(project.genre ?? '')
			.split(',')
			.map((genre: string) => genre.trim())
			.filter(Boolean),
	);

	const readableChapters = $derived(
		chapters.map((chapter) => ({
			...chapter,
			scenes: chapter.scenes.map((scene) => ({
				...scene,
				readable: extractReadableText(scene.content),
			})),
		})),
	);

	const coverUrl = $derived(project.coverUrl?.trim() ?? '');
	const hasCover = $derived(coverUrl.length > 0);
</script>

<div class="reader-shell">
	<div class="reader-header-shell">
		<div class="reader-hero">
			{#if hasCover}
				<div class="reader-cover">
					<img class="reader-cover-image" src={coverUrl} alt="Cover for {project.title}" />
				</div>
			{/if}
			<div class="reader-hero__info">
				<h1 class="reader-hero__title">{project.title}</h1>
				{#if project.logline?.trim()}
					<p class="reader-hero__logline">{project.logline}</p>
				{/if}
				{#if genres.length > 0}
					<div class="reader-genres" aria-label="Genres">
						{#each genres as genre (genre)}
							<span class="reader-genre-pill">{genre}</span>
						{/each}
					</div>
				{/if}
				<a class="reader-back" href="/books">Back to Library</a>
			</div>
		</div>
	</div>

	{#if readableChapters.length === 0}
		<div class="reader-empty">
			<p>This book has no chapters yet.</p>
		</div>
	{:else}
		<main class="reader-manuscript" aria-label="Book reader">
			{#each readableChapters as chapter, chapterIndex (chapter.id)}
				<section class="reader-chapter" aria-labelledby="chapter-{chapter.id}">
					<p class="reader-chapter-index">Chapter {chapterIndex + 1}</p>
					<h2 class="reader-chapter-title" id="chapter-{chapter.id}">
						{chapter.title || `Untitled Chapter ${chapterIndex + 1}`}
					</h2>

					{#if chapter.scenes.length === 0}
						<p class="reader-scene-empty">No scenes in this chapter yet.</p>
					{:else}
						{#each chapter.scenes as scene, sceneIndex (scene.id)}
							<article class="reader-scene" aria-labelledby="scene-{scene.id}">
								<h3 class="reader-scene-title" id="scene-{scene.id}">
									{scene.title || `Scene ${sceneIndex + 1}`}
								</h3>
								{#if scene.readable}
									<p class="reader-scene-content">{scene.readable}</p>
								{:else}
									<p class="reader-scene-empty">This scene has no written content yet.</p>
								{/if}
							</article>
						{/each}
					{/if}
				</section>
			{/each}
		</main>
	{/if}
</div>

<style>
	.reader-shell {
		max-width: 880px;
		margin: 0 auto;
		padding: var(--space-10) 0 var(--space-12);
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.reader-header-shell {
		padding-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.reader-hero {
		display: flex;
		gap: var(--space-6);
		align-items: flex-start;
	}

	.reader-cover {
		width: 120px;
		flex-shrink: 0;
		aspect-ratio: 2 / 3;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--color-surface-elevated);
		box-shadow: var(--shadow-sm);
	}

	.reader-cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.reader-hero__info {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		min-width: 0;
		padding-top: var(--space-1);
	}

	.reader-hero__title {
		font-family: var(--font-display);
		font-size: var(--text-4xl);
		font-weight: var(--font-weight-normal);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		color: var(--color-text-primary);
		margin: 0;
	}

	.reader-hero__logline {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-style: italic;
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.reader-back {
		width: fit-content;
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

	.reader-back:hover {
		color: var(--color-text-secondary);
		border-color: var(--color-border-default);
	}

	.reader-back:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-xs);
	}

	.reader-genres {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-self: center;
	}

	.reader-genre-pill {
		display: inline-flex;
		align-items: center;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		background: color-mix(in srgb, var(--color-teal) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-teal) 28%, transparent);
		color: color-mix(in srgb, var(--color-teal) 78%, white 22%);
	}

	.reader-manuscript {
		display: flex;
		flex-direction: column;
		gap: var(--space-10);
	}

	.reader-chapter {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.reader-chapter-index {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		margin: 0;
	}

	.reader-chapter-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: var(--font-weight-normal);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		color: var(--color-text-primary);
		margin: 0;
	}

	.reader-scene {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-5) var(--space-6);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
	}

	.reader-scene-title {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.reader-scene-content {
		font-family: var(--font-sans);
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		color: var(--color-text-primary);
		white-space: pre-wrap;
		margin: 0;
	}

	.reader-empty,
	.reader-scene-empty {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	@media (max-width: 640px) {
		.reader-shell {
			padding: var(--space-7) var(--space-4) var(--space-10);
		}

		.reader-hero {
			grid-template-columns: 1fr;
			gap: var(--space-4);
		}

		.reader-cover {
			max-width: 180px;
		}

		.reader-chapter-title {
			font-size: var(--text-2xl);
		}

		.reader-scene {
			padding: var(--space-4);
		}
	}
</style>
