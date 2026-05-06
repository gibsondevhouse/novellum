<script lang="ts">
	import { onMount } from 'svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import {
		defaults,
		type HomePage,
		type DefaultReaderView,
		type ProjectType,
	} from '$lib/stores/defaults.svelte.js';
	import {
		AVAILABLE_MODELS,
		getSelectedModel,
		setSelectedModel,
	} from '$lib/stores/model-selection.svelte.js';

	const HOME_PAGE_OPTIONS: { value: HomePage; label: string; hint: string }[] = [
		{ value: 'library', label: 'Library', hint: 'All projects' },
		{ value: 'last-read', label: 'Last Read Book', hint: 'Resume reading' },
		{ value: 'last-project', label: 'Last Opened Project', hint: 'Resume writing' },
	];

	const READER_VIEW_OPTIONS: { value: DefaultReaderView; label: string; hint: string }[] = [
		{ value: 'classic', label: 'Classic', hint: 'Scroll' },
		{ value: 'book', label: 'Book', hint: 'Two-page' },
		{ value: 'fullscreen', label: 'Fullscreen', hint: 'Immersive' },
	];

	const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string; hint: string }[] = [
		{ value: 'novel', label: 'Novel', hint: 'Long-form' },
		{ value: 'story', label: 'Story', hint: 'Short-form' },
		{ value: 'collection', label: 'Collection', hint: 'Anthology' },
	];

	let selectedModel = $state(getSelectedModel());
	const onlyOneModel = AVAILABLE_MODELS.length === 1;

	onMount(() => {
		void defaults.hydrate();
		selectedModel = getSelectedModel();
	});

	function pickModel(id: string) {
		setSelectedModel(id);
		selectedModel = getSelectedModel();
	}
</script>

<svelte:head>
	<title>Defaults — Novellum</title>
</svelte:head>

<div class="defaults">
	<h1 class="defaults__title">Defaults</h1>

	<section class="defaults__section" aria-labelledby="defaults-home-page-heading">
		<h2 id="defaults-home-page-heading" class="defaults__heading">Default Home Page</h2>
		<SurfaceCard variant="flat">
			<div class="picker">
				<p class="picker__description">
					Where Novellum opens when you launch the app.
				</p>
				<div
					class="picker__group"
					role="radiogroup"
					aria-labelledby="defaults-home-page-heading"
				>
					{#each HOME_PAGE_OPTIONS as option (option.value)}
						{@const checked = defaults.homePage === option.value}
						<button
							type="button"
							role="radio"
							aria-checked={checked}
							class="picker__pill"
							class:picker__pill--active={checked}
							onclick={() => void defaults.setDefaultHomePage(option.value)}
						>
							<span class="picker__pill-label">{option.label}</span>
							<span class="picker__pill-hint" aria-hidden="true">{option.hint}</span>
						</button>
					{/each}
				</div>
			</div>
		</SurfaceCard>
	</section>

	<section class="defaults__section" aria-labelledby="defaults-reader-view-heading">
		<h2 id="defaults-reader-view-heading" class="defaults__heading">Default Reader View</h2>
		<SurfaceCard variant="flat">
			<div class="picker">
				<p class="picker__description">
					The layout used when first opening a book.
				</p>
				<div
					class="picker__group"
					role="radiogroup"
					aria-labelledby="defaults-reader-view-heading"
				>
					{#each READER_VIEW_OPTIONS as option (option.value)}
						{@const checked = defaults.readerView === option.value}
						<button
							type="button"
							role="radio"
							aria-checked={checked}
							class="picker__pill"
							class:picker__pill--active={checked}
							onclick={() => void defaults.setDefaultReaderView(option.value)}
						>
							<span class="picker__pill-label">{option.label}</span>
							<span class="picker__pill-hint" aria-hidden="true">{option.hint}</span>
						</button>
					{/each}
				</div>
			</div>
		</SurfaceCard>
	</section>

	<section class="defaults__section" aria-labelledby="defaults-project-type-heading">
		<h2 id="defaults-project-type-heading" class="defaults__heading">Default Project Type</h2>
		<SurfaceCard variant="flat">
			<div class="picker">
				<p class="picker__description">
					The project type pre-selected when creating a new project.
				</p>
				<div
					class="picker__group"
					role="radiogroup"
					aria-labelledby="defaults-project-type-heading"
				>
					{#each PROJECT_TYPE_OPTIONS as option (option.value)}
						{@const checked = defaults.projectType === option.value}
						<button
							type="button"
							role="radio"
							aria-checked={checked}
							class="picker__pill"
							class:picker__pill--active={checked}
							onclick={() => void defaults.setDefaultProjectType(option.value)}
						>
							<span class="picker__pill-label">{option.label}</span>
							<span class="picker__pill-hint" aria-hidden="true">{option.hint}</span>
						</button>
					{/each}
				</div>
			</div>
		</SurfaceCard>
	</section>

	<section class="defaults__section" aria-labelledby="defaults-ai-model-heading">
		<h2 id="defaults-ai-model-heading" class="defaults__heading">Default AI Model</h2>
		<SurfaceCard variant="flat">
			<div class="picker">
				<p class="picker__description">
					The model used by Nova and other AI features.
				</p>
				<div
					class="picker__group"
					role="radiogroup"
					aria-labelledby="defaults-ai-model-heading"
				>
					{#each AVAILABLE_MODELS as model (model.id)}
						{@const checked = selectedModel === model.id}
						<button
							type="button"
							role="radio"
							aria-checked={checked}
							class="picker__pill"
							class:picker__pill--active={checked}
							disabled={onlyOneModel}
							onclick={() => pickModel(model.id)}
						>
							<span class="picker__pill-label">{model.label}</span>
							<span class="picker__pill-hint" aria-hidden="true">{model.provider}</span>
						</button>
					{/each}
				</div>
				{#if onlyOneModel}
					<p class="picker__caption">More models coming soon.</p>
				{/if}
			</div>
		</SurfaceCard>
	</section>
</div>

<style>
	.defaults {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.defaults__title {
		margin: 0;
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		letter-spacing: var(--tracking-tight);
	}

	.defaults__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.defaults__heading {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-secondary);
	}

	.picker {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.picker__description {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.picker__caption {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.picker__group {
		display: inline-flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.picker__pill {
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-4);
		min-width: 7rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-subtle);
		background-color: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.picker__pill:hover:not(:disabled) {
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.picker__pill:focus-visible {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: 2px;
	}

	.picker__pill--active {
		background-color: var(--color-surface-overlay);
		border-color: var(--color-border-default);
		color: var(--color-text-primary);
	}

	.picker__pill:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.picker__pill-label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
	}

	.picker__pill-hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-family: var(--font-mono);
	}
</style>
