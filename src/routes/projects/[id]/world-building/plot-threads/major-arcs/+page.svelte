<script lang="ts">
	import type { PlotThread } from '$lib/db/types.js';
	import ThreadSystemForm from '$modules/bible/components/ThreadSystemForm.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import IndividualsWorkspaceShell from '$modules/bible/components/IndividualsWorkspaceShell.svelte';
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
		submitUpdatePlotThread,
		submitDeletePlotThread,
	} from '$modules/bible/stores/bible-crud.svelte.js';

	let { data }: { data: { projectId: string; plotThreads: PlotThread[] } } =
		$props();

	$effect(() => {
		initPlotThreads(data.plotThreads);
	});

	let creating = $state(false);
	let selectedId: string | null = $state(null);
	let confirmDeleteId: string | null = $state(null);

	const majorArcs = $derived(getPlotThreads().filter((thread) => isThreadKind(thread, 'major-arc')));

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
	<title>Major Arcs — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav
		projectId={data.projectId}
		topSection="plot-threads"
		activeId="major-arcs"
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
		listAriaLabel="Major Arcs"
		createLabel="new +"
	>
		{#snippet dossier()}
			{#if creating}
				<section class="character-dossier">
					<div class="dossier-header">
						<h2 class="dossier-title">New Major Arc</h2>
						<p class="dossier-copy">Primary causal chain that drives the story from setup to resolution.</p>
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
						<p class="dossier-copy">Causality spine: pressure compounds until continuation becomes impossible.</p>
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
				<p>No major arcs yet. Start with 1-3 primary causal chains.</p>
				<button class="bible-btn-sm" onclick={() => (creating = true)}>+ Add your first arc</button>
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
	}
</style>
