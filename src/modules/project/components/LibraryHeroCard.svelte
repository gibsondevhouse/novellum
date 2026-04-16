<script lang="ts">
	import type { Project } from '$lib/db/types.js';

	type LibraryCardDestination = 'reader' | 'workspace' | 'hub';

	let {
		project,
		cardIndex = 0,
		destination = 'reader',
	} = $props<{
		project: Project;
		cardIndex?: number;
		destination?: LibraryCardDestination;
	}>();

	import { COVER_PALETTES as coverPalettes } from '../constants.js';

	function hashSeed(value: string): number {
		let hash = 0;
		for (let i = 0; i < value.length; i++) {
			hash = (hash << 5) - hash + value.charCodeAt(i);
			hash |= 0;
		}
		return Math.abs(hash);
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	const palette = $derived(coverPalettes[hashSeed(project.id) % coverPalettes.length]);
	const title = $derived(project.title?.trim() || 'Untitled');
	const initial = $derived(title.charAt(0).toUpperCase());
	const uploadedCoverUrl = $derived(project.coverUrl?.trim() ?? '');
	const hasUploadedCover = $derived(uploadedCoverUrl.length > 0);
	const genres = $derived(
		(project.genre ?? '')
			.split(',')
			.map((g: string) => g.trim())
			.filter(Boolean),
	);
	const cardHref = $derived(
		destination === 'hub'
			? `/projects/${project.id}/hub`
			: destination === 'workspace'
				? `/projects/${project.id}/workspace`
				: `/books/${project.id}`,
	);
	const cardActionLabel = $derived(
		destination === 'hub'
			? 'Open project hub for'
			: destination === 'workspace'
				? 'Open workspace for'
				: 'Open reader for',
	);
</script>

<li class="library-card" style="--card-index: {cardIndex}">
	<a class="library-card__button" href={cardHref} aria-label="{cardActionLabel} {title}">
		<div
			class="library-card__cover"
			style="--cover-a: {palette.a}; --cover-b: {palette.b};"
			aria-hidden="true"
		>
			{#if hasUploadedCover}
				<img class="library-card__cover-image" src={uploadedCoverUrl} alt="" loading="lazy" />
				<div class="library-card__cover-shade"></div>
			{:else}
				<div class="library-card__foil"></div>
				<span class="library-card__initial">{initial}</span>
			{/if}
			<span class="library-card__spine">{title}</span>
		</div>

		<div class="library-card__content">
			<div class="library-card__genres" aria-label="Genres">
				{#if genres.length > 0}
					{#each genres as genre (genre)}
						<span class="genre-pill">{genre}</span>
					{/each}
				{:else}
					<span class="genre-pill genre-pill--muted">Unclassified</span>
				{/if}
			</div>

			<h2 class="library-card__title">{title}</h2>

			<p class="library-card__logline">
				{project.logline?.trim() || 'No logline provided for this work yet.'}
			</p>

			<p class="library-card__meta">Updated {formatDate(project.updatedAt)}</p>
		</div>
	</a>
</li>

<style>
	.library-card {
		list-style: none;
		animation: novellum-enter var(--duration-enter) var(--ease-editorial) both;
		animation-delay: min(calc(var(--card-index, 0) * 50ms), 280ms);
	}

	.library-card__button {
		width: 100%;
		display: grid;
		grid-template-columns: minmax(128px, 164px) 1fr;
		align-items: stretch;
		gap: var(--space-5);
		padding: var(--space-5);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: linear-gradient(
			145deg,
			var(--color-surface-raised) 0%,
			var(--color-surface-overlay) 100%
		);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		text-align: left;
		color: inherit;
		transition:
			border-color var(--duration-base) var(--ease-standard),
			transform var(--duration-base) var(--ease-standard),
			box-shadow var(--duration-base) var(--ease-standard);
	}

	.library-card__button:hover {
		border-color: var(--color-border-strong);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.library-card__button:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring-offset);
		border-color: var(--color-border-focus);
	}

	.library-card__cover {
		position: relative;
		min-height: 228px;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: linear-gradient(160deg, var(--cover-a), var(--cover-b));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.library-card__foil {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 22% 18%, color-mix(in srgb, white 26%, transparent) 0%, transparent 45%),
			linear-gradient(125deg, color-mix(in srgb, white 12%, transparent), transparent 55%);
		mix-blend-mode: screen;
		pointer-events: none;
	}

	.library-card__cover-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.library-card__cover-shade {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, color-mix(in srgb, black 10%, transparent) 35%, color-mix(in srgb, black 55%, transparent) 100%);
		pointer-events: none;
	}

	.library-card__initial {
		position: relative;
		font-family: var(--font-display);
		font-size: clamp(2.2rem, 4vw, 3rem);
		line-height: 1;
		color: color-mix(in srgb, white 88%, var(--color-text-primary));
		text-shadow: 0 2px 18px color-mix(in srgb, black 45%, transparent);
	}

	.library-card__spine {
		position: absolute;
		bottom: var(--space-3);
		left: var(--space-3);
		right: var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-wide);
		color: color-mix(in srgb, white 80%, var(--color-text-primary));
		text-transform: uppercase;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		opacity: 0.85;
	}

	.library-card__content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-3);
		min-width: 0;
	}

	.library-card__genres {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.genre-pill {
		display: inline-flex;
		align-items: center;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		background: color-mix(in srgb, var(--color-teal) 14%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-teal) 28%, transparent);
		color: color-mix(in srgb, var(--color-teal) 78%, white 22%);
	}

	.genre-pill--muted {
		background: color-mix(in srgb, var(--color-surface-elevated) 85%, transparent);
		border-color: var(--color-border-subtle);
		color: var(--color-text-muted);
	}

	.library-card__title {
		font-family: var(--font-display);
		font-size: clamp(1.55rem, 2.4vw, 2.1rem);
		line-height: var(--leading-tight);
		letter-spacing: var(--tracking-tight);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		margin: 0;
	}

	.library-card__logline {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-style: italic;
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.library-card__meta {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
	}

	@media (max-width: 800px) {
		.library-card__button {
			grid-template-columns: 120px 1fr;
			gap: var(--space-4);
			padding: var(--space-4);
		}

		.library-card__cover {
			min-height: 176px;
		}

		.library-card__logline {
			font-size: var(--text-base);
		}
	}

	@media (max-width: 580px) {
		.library-card__button {
			grid-template-columns: 1fr;
		}

		.library-card__cover {
			min-height: 220px;
			max-width: 180px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.library-card {
			animation: none;
		}
	}
</style>
