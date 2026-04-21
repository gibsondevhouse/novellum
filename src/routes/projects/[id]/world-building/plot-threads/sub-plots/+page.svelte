<script lang="ts">
	import type { PlotThread } from '$lib/db/types.js';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import IndividualsWorkspaceShell from '$modules/bible/components/IndividualsWorkspaceShell.svelte';
	import ThreadSystemForm from '$modules/bible/components/ThreadSystemForm.svelte';
	import {
		isThreadKind,
		optionMeta,
		optionSubtitle,
	} from '$modules/bible/thread-systems.js';
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
	const majorArcs = $derived(getPlotThreads().filter((thread) => isThreadKind(thread, 'major-arc')));

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
	<title>Sub-plots — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav
		projectId={data.projectId}
		topSection="plot-threads"
		activeId="sub-plots"
		ariaLabel="Threads sections"
	/>
	<IndividualsWorkspaceShell
		characterOptions={options}
		selectedCharacterId={selectedId}
		onSelectCharacter={selectThread}
		onCreateCharacter={() => {
			creating = true;
			selectedId = null;
		}}
		hasSelection={creating || selectedId !== null}
		listAriaLabel="Sub-plots"
		createLabel="new +"
	>
		{#snippet dossier()}
			{#if creating}
				<section class="character-dossier">
					<div class="dossier-header">
						<h2 class="dossier-title">New Sub-plot</h2>
						<p class="dossier-copy">Secondary causal chain that reinforces, contrasts, or complicates a major arc.</p>
					</div>
					<div class="dossier-flow" aria-label="Sub-plot system form">
						<ThreadSystemForm
							kind="sub-plot"
							arcOptions={arcOptions}
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
						<p class="dossier-copy">Sub-plots should converge into major arcs and increase unavoidable pressure.</p>
					</div>
					<div class="dossier-flow" aria-label="Sub-plot system form">
						<ThreadSystemForm
							thread={selectedThread}
							kind="sub-plot"
							arcOptions={arcOptions}
							saving={getPlotThreadSaving()}
							onSave={handleUpdate}
							onCancel={() => (selectedId = null)}
						/>
					</div>
					<div class="dossier-footer-actions">
						{#if confirmDeleteId === selectedThread.id}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => handleDelete(selectedThread.id)}>Confirm</button>
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = null)}>Cancel</button>
						{:else}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => (confirmDeleteId = selectedThread.id)}>Delete</button>
						{/if}
					</div>
				</section>
			{/if}
		{/snippet}
		{#snippet empty()}
			<div class="entity-empty">
				<p>No sub-plots yet. Add 2-5 that reinforce or challenge your main arcs.</p>
				<button class="bible-btn-sm" onclick={() => (creating = true)}>+ Add first sub-plot</button>
			</div>
		{/snippet}
	</IndividualsWorkspaceShell>
</div>

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

	.entity-empty {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		color: var(--color-text-muted);
		text-align: center;
	}
</style>
