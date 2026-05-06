<script lang="ts">
	import type { PlotThread } from '$lib/db/domain-types';
	import { translator } from '$lib/i18n';
	import { DestructiveButton, GhostButton } from '$lib/components/ui/index.js';
	import ThreadSystemForm from '$modules/world-building/components/ThreadSystemForm.svelte';
	import WorldBuildingWorkspaceEmptyState from '$modules/world-building/components/WorldBuildingWorkspaceEmptyState.svelte';
	import WorldBuildingWorkspacePage from '$modules/world-building/components/WorldBuildingWorkspacePage.svelte';
	import { isThreadKind, optionMeta, optionSubtitle } from '$modules/world-building/thread-systems.js';
	import {
		getPlotThreads,
		getPlotThreadSaving,
		initPlotThreads,
		submitCreatePlotThread,
		submitUpdatePlotThread,
		submitDeletePlotThread,
	} from '$modules/world-building/stores/world-building-crud.svelte.js';

	let { data }: { data: { projectId: string; plotThreads: PlotThread[] } } = $props();

	$effect(() => {
		initPlotThreads(data.plotThreads);
	});

	let creating = $state(false);
	let selectedId: string | null = $state(null);
	let confirmDeleteId: string | null = $state(null);

	const majorArcs = $derived(
		getPlotThreads().filter((thread) => isThreadKind(thread, 'major-arc')),
	);

	$effect(() => {
		if (selectedId && majorArcs.some((thread) => thread.id === selectedId)) return;
		selectedId = majorArcs[0]?.id ?? null;
	});

	const selectedThread = $derived(
		selectedId ? (majorArcs.find((thread) => thread.id === selectedId) ?? null) : null,
	);
	const options = $derived(
		majorArcs.map((thread) => ({
			id: thread.id,
			name: thread.title,
			subtitle: optionSubtitle(thread, 'major-arc'),
			meta: optionMeta(thread, 'major-arc'),
		})),
	);

	function selectThread(id: string) {
		selectedId = id;
		creating = false;
	}

	async function handleCreate(
		formData: Omit<PlotThread, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		const created = await submitCreatePlotThread(data.projectId, formData);
		selectedId = created.id;
		creating = false;
	}

	async function handleUpdate(
		formData: Omit<PlotThread, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!selectedThread) return;
		await submitUpdatePlotThread(selectedThread.id, formData);
	}

	async function handleDelete(id: string) {
		await submitDeletePlotThread(id);
		confirmDeleteId = null;
		selectedId = null;
	}
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.major-arcs.title')}</title>
</svelte:head>

<WorldBuildingWorkspacePage
	projectId={data.projectId}
	topSection="plot-threads"
	activeId="major-arcs"
	ariaLabel={$translator('worldbuilding.aria.threadsSections')}
	{options}
	{selectedId}
	onSelect={selectThread}
	onCreate={() => {
		creating = true;
		selectedId = null;
	}}
	hasSelection={creating || selectedId !== null}
	listAriaLabel={$translator('worldbuilding.list.majorArcs')}
	createLabel={$translator('worldbuilding.workspace.common.createLabel')}
>
	{#snippet dossier()}
		{#if creating}
			<section class="character-dossier">
				<div class="dossier-header">
					<h2 class="dossier-title">New Major Arc</h2>
					<p class="dossier-copy">
						Primary causal chain that drives the story from setup to resolution.
					</p>
				</div>
				<div class="dossier-flow" aria-label="Major arc system form">
					<ThreadSystemForm
						kind="major-arc"
						saving={getPlotThreadSaving()}
						onSave={handleCreate}
						onCancel={() => (creating = false)}
					/>
				</div>
			</section>
		{:else if selectedThread}
			<section class="character-dossier">
				<div class="dossier-header">
					<h2 class="dossier-title">{selectedThread.title}</h2>
					<p class="dossier-copy">
						Causality spine: pressure compounds until continuation becomes impossible.
					</p>
				</div>
				<div class="dossier-flow" aria-label="Major arc system form">
					<ThreadSystemForm
						thread={selectedThread}
						kind="major-arc"
						saving={getPlotThreadSaving()}
						onSave={handleUpdate}
						onCancel={() => (selectedId = null)}
					/>
				</div>
				<div class="dossier-footer-actions">
					{#if confirmDeleteId === selectedThread.id}
						<DestructiveButton size="sm" onclick={() => handleDelete(selectedThread.id)}
							>Confirm</DestructiveButton
						>
						<GhostButton size="sm" onclick={() => (confirmDeleteId = null)}>Cancel</GhostButton>
					{:else}
						<DestructiveButton size="sm" onclick={() => (confirmDeleteId = selectedThread.id)}
							>Delete</DestructiveButton
						>
					{/if}
				</div>
			</section>
		{/if}
	{/snippet}
	{#snippet empty()}
		<WorldBuildingWorkspaceEmptyState
			title={$translator('worldbuilding.workspace.majorArcs.emptyTitle')}
			description={$translator('worldbuilding.workspace.majorArcs.emptyDescription')}
			actionLabel={$translator('worldbuilding.workspace.common.firstArc')}
			onAction={() => {
				creating = true;
			}}
		/>
	{/snippet}
</WorldBuildingWorkspacePage>

<style>
	.dossier-header {
		display: grid;
		gap: var(--space-2);
	}

	.dossier-title {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
	}

	.dossier-copy {
		margin: 0;
		color: var(--color-text-secondary);
		max-width: 72ch;
	}
</style>
