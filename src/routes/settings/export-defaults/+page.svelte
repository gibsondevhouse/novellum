<script lang="ts">
	import { onMount } from 'svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { exportDefaults } from '$lib/stores/export-defaults.svelte.js';
	import type { ManuscriptProfileId, ExportFormatDefault } from '$lib/stores/export-defaults.svelte.js';
	import { MANUSCRIPT_PROFILES } from '$modules/export/services/manuscript-profiles.js';

	const PROFILE_IDS: ManuscriptProfileId[] = [
		'standard_manuscript',
		'reader_copy',
		'ebook_draft',
		'plain_text_archive',
	];

	const FORMAT_OPTIONS: { value: ExportFormatDefault; label: string }[] = [
		{ value: 'markdown', label: 'Markdown' },
		{ value: 'docx', label: 'Word' },
		{ value: 'epub', label: 'EPUB' },
	];

	onMount(() => {
		void exportDefaults.hydrate();
	});
</script>

<svelte:head>
	<title>Export Defaults — Novellum</title>
</svelte:head>

<div class="export-defaults">
	<h1 class="export-defaults__title">Export Defaults</h1>

	<section class="export-defaults__section" aria-labelledby="export-profile-heading">
		<h2 id="export-profile-heading" class="export-defaults__heading">Default Profile</h2>
		<SurfaceCard variant="flat">
			<p class="export-defaults__description">
				Choose the manuscript profile used when you start a new export.
			</p>
			<div class="export-defaults__options" role="radiogroup" aria-labelledby="export-profile-heading">
				{#each PROFILE_IDS as id (id)}
					{@const profile = MANUSCRIPT_PROFILES[id]}
					{@const checked = exportDefaults.profileId === id}
					<label class="export-defaults__option" class:export-defaults__option--active={checked}>
						<input
							type="radio"
							name="export-profile"
							value={id}
							checked={checked}
							onchange={() => void exportDefaults.setProfile(id)}
						/>
						<span class="export-defaults__option-label">{profile.label}</span>
						<span class="export-defaults__option-hint">{profile.description}</span>
					</label>
				{/each}
			</div>
		</SurfaceCard>
	</section>

	<section class="export-defaults__section" aria-labelledby="export-format-heading">
		<h2 id="export-format-heading" class="export-defaults__heading">Default Format</h2>
		<SurfaceCard variant="flat">
			<p class="export-defaults__description">
				Choose the file format used when you start a new export.
			</p>
			<div class="export-defaults__options" role="radiogroup" aria-labelledby="export-format-heading">
				{#each FORMAT_OPTIONS as option (option.value)}
					{@const checked = exportDefaults.format === option.value}
					<label class="export-defaults__option" class:export-defaults__option--active={checked}>
						<input
							type="radio"
							name="export-format"
							value={option.value}
							checked={checked}
							onchange={() => void exportDefaults.setFormat(option.value)}
						/>
						<span class="export-defaults__option-label">{option.label}</span>
					</label>
				{/each}
			</div>
		</SurfaceCard>
	</section>
</div>

<style>
	.export-defaults {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.export-defaults__title {
		font: var(--font-heading-lg);
		color: var(--color-text-primary);
		margin: 0;
	}

	.export-defaults__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.export-defaults__heading {
		font: var(--font-label-md);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.export-defaults__description {
		margin: 0 0 var(--space-4);
		color: var(--color-text-primary);
	}

	.export-defaults__options {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.export-defaults__option {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		cursor: pointer;
		padding: var(--space-2) 0;
	}

	.export-defaults__option-label {
		font: var(--font-label-md);
		color: var(--color-text-primary);
	}

	.export-defaults__option-hint {
		font: var(--font-body-sm);
		color: var(--color-text-secondary);
	}
</style>
