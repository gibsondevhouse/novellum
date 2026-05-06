<script lang="ts">
	import { onMount } from 'svelte';
	import { ThemeSelector } from '$modules/settings';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import {
		appearance,
		type EditorFontSize,
		type EditorLineSpacing,
	} from '$lib/stores/appearance.svelte.js';

	const FONT_SIZE_OPTIONS: { value: EditorFontSize; label: string; hint: string }[] = [
		{ value: 'small', label: 'Small', hint: '15px' },
		{ value: 'default', label: 'Default', hint: '16px' },
		{ value: 'large', label: 'Large', hint: '18px' },
	];

	const LINE_SPACING_OPTIONS: { value: EditorLineSpacing; label: string; hint: string }[] = [
		{ value: 'tight', label: 'Tight', hint: '1.25' },
		{ value: 'normal', label: 'Normal', hint: '1.5' },
		{ value: 'relaxed', label: 'Relaxed', hint: '1.75' },
	];

	onMount(() => {
		void appearance.hydrate();
	});
</script>

<svelte:head>
	<title>Appearance — Novellum</title>
</svelte:head>

<div class="appearance">
	<h1 class="appearance__title">Appearance</h1>

	<section class="appearance__section" aria-labelledby="appearance-theme-heading">
		<h2 id="appearance-theme-heading" class="appearance__heading">Theme</h2>
		<ThemeSelector />
	</section>

	<section class="appearance__section" aria-labelledby="appearance-font-size-heading">
		<h2 id="appearance-font-size-heading" class="appearance__heading">Editor Text Size</h2>
		<SurfaceCard variant="flat">
			<div class="picker">
				<p class="picker__description">
					Controls the manuscript editor's body text size. Reader prose is
					unaffected.
				</p>
				<div
					class="picker__group"
					role="radiogroup"
					aria-labelledby="appearance-font-size-heading"
				>
					{#each FONT_SIZE_OPTIONS as option (option.value)}
						{@const checked = appearance.fontSize === option.value}
						<button
							type="button"
							role="radio"
							aria-checked={checked}
							class="picker__pill"
							class:picker__pill--active={checked}
							onclick={() => appearance.setFontSize(option.value)}
						>
							<span class="picker__pill-label">{option.label}</span>
							<span class="picker__pill-hint" aria-hidden="true">{option.hint}</span>
						</button>
					{/each}
				</div>
			</div>
		</SurfaceCard>
	</section>

	<section class="appearance__section" aria-labelledby="appearance-line-spacing-heading">
		<h2 id="appearance-line-spacing-heading" class="appearance__heading">
			Editor Line Spacing
		</h2>
		<SurfaceCard variant="flat">
			<div class="picker">
				<p class="picker__description">
					Controls the vertical rhythm between lines in the manuscript editor.
				</p>
				<div
					class="picker__group"
					role="radiogroup"
					aria-labelledby="appearance-line-spacing-heading"
				>
					{#each LINE_SPACING_OPTIONS as option (option.value)}
						{@const checked = appearance.lineSpacing === option.value}
						<button
							type="button"
							role="radio"
							aria-checked={checked}
							class="picker__pill"
							class:picker__pill--active={checked}
							onclick={() => appearance.setLineSpacing(option.value)}
						>
							<span class="picker__pill-label">{option.label}</span>
							<span class="picker__pill-hint" aria-hidden="true">{option.hint}</span>
						</button>
					{/each}
				</div>
			</div>
		</SurfaceCard>
	</section>
</div>

<style>
	.appearance {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.appearance__title {
		margin: 0;
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		letter-spacing: var(--tracking-tight);
	}

	.appearance__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.appearance__heading {
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

	.picker__pill:hover {
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
