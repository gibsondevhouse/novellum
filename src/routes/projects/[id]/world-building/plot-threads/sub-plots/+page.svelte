<script lang="ts">
	import type { PlotThread } from '$lib/db/domain-types';
	import { translator } from '$lib/i18n';
	import { DestructiveButton, GhostButton } from '$lib/components/ui/index.js';
	import ThreadSystemForm from '$modules/bible/components/ThreadSystemForm.svelte';
	import WorldBuildingWorkspaceEmptyState from '$modules/bible/components/WorldBuildingWorkspaceEmptyState.svelte';
	import WorldBuildingWorkspacePage from '$modules/bible/components/WorldBuildingWorkspacePage.svelte';
	import { isThreadKind, optionMeta, optionSubtitle } from '$modules/bible/thread-systems.js';
	import {
		getPlotThreads,
		getPlotThreadSaving,
		initPlotThreads,
		submitCreatePlotThread,
		submitDeletePlotThread,
		submitUpdatePlotThread,
	} from '$modules/bible/stores/bible-crud.svelte.js';

	let { data }: { data: { projectId: string; plotThreads: PlotThread[] } } = $props();

	$effect(() => {
		initPlotThreads(data.plotThreads);
	});

	let creating = $state(false);
	let selectedId = $state<string | null>(null);
	let confirmDeleteId = $state<string | null>(null);

	const subPlots = $derived(getPlotThreads().filter((thread) => isThreadKind(thread, 'sub-plot')));
	const majorArcs = $derived(
		getPlotThreads().filter((thread) => isThreadKind(thread, 'major-arc')),
	);

	$effect(() => {
		if (selectedId && subPlots.some((thread) => thread.id === selectedId)) return;
		selectedId = subPlots[0]?.id ?? null;
	});

	const selectedThread = $derived(
		selectedId ? (subPlots.find((thread) => thread.id === selectedId) ?? null) : null,
	);

	const options = $derived(
		subPlots.map((thread) => ({
			id: thread.id,
			name: thread.title,
			subtitle: optionSubtitle(thread, 'sub-plot'),
			meta: optionMeta(thread, 'sub-plot'),
		})),
	);

	const arcOptions = $derived(
		majorArcs.map((thread) => ({
			id: thread.id,
			name: thread.title,
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
	<title>{$translator('worldbuilding.page.sub-plots.title')}</title>
</svelte:head>

<WorldBuildingWorkspacePage
	projectId={data.projectId}
	topSection="plot-threads"
	activeId="sub-plots"
	ariaLabel={$translator('worldbuilding.aria.threadsSections')}
	{options}
	{selectedId}
	onSelect={selectThread}
	onCreate={() => {
		creating = true;
		selectedId = null;
	}}
	hasSelection={creating || selectedId !== null}
	listAriaLabel={$translator('worldbuilding.list.subPlots')}
	createLabel={$translator('worldbuilding.workspace.common.createLabel')}
>
	{#snippet dossier()}
		{#if creating}
			<section class="character-dossier">
				<div class="dossier-header">
					<h2 class="dossier-title">New Sub-plot</h2>
					<p class="dossier-copy">
						Secondary causal chain that reinforces, contrasts, or complicates a major arc.
					</p>
				</div>
				<div class="dossier-flow" aria-label="Sub-plot system form">
					<ThreadSystemForm
						kind="sub-plot"
						{arcOptions}
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
						Sub-plots should converge into major arcs and increase unavoidable pressure.
					</p>
				</div>
				<div class="dossier-flow" aria-label="Sub-plot system form">
					<ThreadSystemForm
						thread={selectedThread}
						kind="sub-plot"
						{arcOptions}
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
			title={$translator('worldbuilding.workspace.subPlots.emptyTitle')}
			description={$translator('worldbuilding.workspace.subPlots.emptyDescription')}
			actionLabel={$translator('worldbuilding.workspace.common.firstSubPlot')}
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
