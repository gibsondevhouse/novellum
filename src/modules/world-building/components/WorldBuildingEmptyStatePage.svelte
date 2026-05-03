<script lang="ts">
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import {
		getCharacterSaving,
		getLocationSaving,
		getLoreSaving,
		getPlotThreadSaving,
		getTimelineSaving,
		submitCreateCharacter,
		submitCreateLocation,
		submitCreateLoreEntry,
		submitCreatePlotThread,
		submitCreateTimelineEvent,
	} from '$modules/bible/stores/bible-crud.svelte.js';
	import type { WorldBuildingTopSectionId } from '$modules/bible/worldbuilding-navigation.js';

	let {
		projectId,
		topSection,
		activeId,
		breadcrumbHref,
		breadcrumbLabel,
		heading,
		emptyTitle,
		emptyDescription,
		subNavLabel,
	} = $props<{
		projectId: string;
		topSection: WorldBuildingTopSectionId;
		activeId: string;
		breadcrumbHref: string;
		breadcrumbLabel: string;
		heading: string;
		emptyTitle: string;
		emptyDescription: string;
		subNavLabel: string;
	}>();

	let showForm = $state(false);
	let draftTitle = $state('');
	let draftDetails = $state('');
	let createError = $state('');
	let createdMessage = $state('');

	const createButtonLabel = '+ Add Entry';
	const isSaving = $derived.by(() => {
		switch (topSection) {
			case 'characters':
				return getCharacterSaving();
			case 'locations':
				return getLocationSaving();
			case 'lore':
				return getLoreSaving();
			case 'plot-threads':
				return getPlotThreadSaving();
			case 'timeline':
				return getTimelineSaving();
			default:
				return false;
		}
	});

	async function handleCreate(event: SubmitEvent) {
		event.preventDefault();
		createError = '';
		createdMessage = '';

		const title = draftTitle.trim();
		const details = draftDetails.trim();
		if (!title) {
			createError = 'A title is required.';
			return;
		}

		try {
			switch (topSection) {
				case 'characters':
					await submitCreateCharacter(projectId, {
						name: title,
						role: heading,
						pronunciation: '',
						aliases: [],
						diasporaOrigin: '',
						photoUrl: '',
						bio: details,
						faction: '',
						anomalies: [],
						traits: [],
						goals: [],
						flaws: [],
						arcs: [],
						notes: details,
						tags: [activeId],
					});
					break;
				case 'locations':
					await submitCreateLocation(projectId, {
						name: title,
						description: details,
						tags: [activeId],
					});
					break;
				case 'lore':
					await submitCreateLoreEntry(projectId, {
						title,
						category: heading,
						content: details,
						tags: [activeId],
					});
					break;
				case 'plot-threads':
					await submitCreatePlotThread(projectId, {
						title,
						description: details,
						status: 'open',
						relatedSceneIds: [],
						relatedCharacterIds: [],
					});
					break;
				case 'timeline':
					await submitCreateTimelineEvent(projectId, {
						title,
						description: details,
						date: '',
						relatedCharacterIds: [],
						relatedSceneIds: [],
					});
					break;
			}

			showForm = false;
			draftTitle = '';
			draftDetails = '';
			createdMessage = `${heading} entry created.`;
		} catch (error) {
			createError = error instanceof Error ? error.message : 'Unable to create entry.';
		}
	}
</script>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav
		projectId={projectId}
		topSection={topSection}
		activeId={activeId}
		ariaLabel={subNavLabel}
	/>

	<div class="bible-page">
		<div class="bible-page-header">
			<div>
				<a class="bible-back-link" href={breadcrumbHref}>← {breadcrumbLabel}</a>
				<h1>{heading}</h1>
			</div>
			<PrimaryButton onclick={() => (showForm = !showForm)}>
				{showForm ? 'Cancel' : createButtonLabel}
			</PrimaryButton>
		</div>

		{#if showForm}
			<form class="quick-create-form" onsubmit={handleCreate}>
				<div class="quick-create-grid">
					<div class="field">
						<label for="quick-entry-title">Title</label>
						<input
							id="quick-entry-title"
							type="text"
							bind:value={draftTitle}
							placeholder={`New ${heading.toLowerCase()} entry`}
							required
						/>
					</div>
					<div class="field">
						<label for="quick-entry-details">Details</label>
						<textarea
							id="quick-entry-details"
							rows="4"
							bind:value={draftDetails}
							placeholder="Context, notes, and constraints"
						></textarea>
					</div>
				</div>

				{#if createError}
					<p class="create-error" role="alert">{createError}</p>
				{/if}

				<div class="quick-create-actions">
					<GhostButton onclick={() => (showForm = false)} type="button">Cancel</GhostButton>
					<PrimaryButton type="submit" disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Create Entry'}
					</PrimaryButton>
				</div>
			</form>
		{/if}

		{#if createdMessage}
			<p class="create-success" role="status">
				{createdMessage}
				<a href={breadcrumbHref}>Open {breadcrumbLabel}</a>
			</p>
		{/if}

		<EmptyStatePanel title={emptyTitle} description={emptyDescription} />
	</div>
</div>

<style>
	.quick-create-form {
		margin-bottom: var(--space-5);
		padding: var(--space-4);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		display: grid;
		gap: var(--space-4);
	}

	.quick-create-grid {
		display: grid;
		gap: var(--space-3);
	}

	.field {
		display: grid;
		gap: var(--space-2);
	}

	.field label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.field input,
	.field textarea {
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-base);
		color: var(--color-text-primary);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
	}

	.quick-create-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}

	.create-error {
		margin: 0;
		color: var(--color-error);
	}

	.create-success {
		margin: 0 0 var(--space-4);
		color: var(--color-success);
	}

	.create-success a {
		margin-left: var(--space-2);
		color: var(--color-nova-blue);
		text-decoration: none;
	}

	.create-success a:hover {
		text-decoration: underline;
	}
</style>
