<script lang="ts">
	import type { PlotThread, Scene } from '$lib/db/types.js';
	import PlotThreadForm from '$modules/bible/components/PlotThreadForm.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import IndividualsWorkspaceShell from '$modules/bible/components/IndividualsWorkspaceShell.svelte';
	import {
		getPlotThreads,
		getPlotThreadSaving,
		initPlotThreads,
		submitCreatePlotThread,
		submitUpdatePlotThread,
		submitDeletePlotThread,
	} from '$modules/bible/stores/bible-crud.svelte.js';

	let { data }: { data: { projectId: string; plotThreads: PlotThread[]; scenes: Scene[] } } =
		$props();

	$effect(() => {
		initPlotThreads(data.plotThreads);
	});

	let creating = $state(false);
	let selectedId: string | null = $state(null);
	let confirmDeleteId: string | null = $state(null);

	const selectedThread = $derived(
		selectedId ? (getPlotThreads().find((t) => t.id === selectedId) ?? null) : null,
	);
	const options = $derived(getPlotThreads().map((t) => ({ id: t.id, name: t.title })));

	function selectThread(id: string) {
		selectedId = id;
		creating = false;
	}

	async function handleCreate(
		formData: Omit<PlotThread, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		await submitCreatePlotThread(data.projectId, formData);
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
				<div class="entity-dossier">
					<h2 class="dossier-title">New Arc</h2>
					<PlotThreadForm
						scenes={data.scenes}
						saving={getPlotThreadSaving()}
						onSave={handleCreate}
						onCancel={() => (creating = false)}
					/>
				</div>
			{:else if selectedThread}
				<div class="entity-dossier">
					<div class="dossier-header">
						<h2 class="dossier-title">{selectedThread.title}</h2>
						{#if confirmDeleteId === selectedThread.id}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => handleDelete(selectedThread.id)}>Confirm</button>
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = null)}>Cancel</button>
						{:else}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => (confirmDeleteId = selectedThread.id)}>Delete</button>
						{/if}
					</div>
					<PlotThreadForm
						thread={selectedThread}
						scenes={data.scenes}
						saving={getPlotThreadSaving()}
						onSave={handleUpdate}
						onCancel={() => (selectedId = null)}
					/>
				</div>
			{/if}
		{/snippet}
		{#snippet empty()}
			<div class="entity-empty">
				<p>No major arcs yet.</p>
				<button class="bible-btn-sm" onclick={() => (creating = true)}>+ Add your first arc</button>
			</div>
		{/snippet}
	</IndividualsWorkspaceShell>
</div>

<style>
	.entity-dossier {
		padding: var(--space-6);
		overflow-y: auto;
	}

	.dossier-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.dossier-title {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
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
