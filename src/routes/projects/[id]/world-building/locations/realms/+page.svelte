<script lang="ts">
	import type { Location } from '$lib/db/types.js';
	import LocationForm from '$modules/bible/components/LocationForm.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import IndividualsWorkspaceShell from '$modules/bible/components/IndividualsWorkspaceShell.svelte';
	import {
		getLocations,
		getLocationSaving,
		initLocations,
		submitCreateLocation,
		submitUpdateLocation,
		submitDeleteLocation,
	} from '$modules/bible/stores/bible-crud.svelte.js';

	let { data }: { data: { projectId: string; locations: Location[] } } = $props();

	$effect(() => {
		initLocations(data.locations);
	});

	let creating = $state(false);
	let selectedId: string | null = $state(null);
	let confirmDeleteId: string | null = $state(null);

	const selectedLocation = $derived(
		selectedId ? (getLocations().find((l) => l.id === selectedId) ?? null) : null,
	);
	const options = $derived(getLocations().map((l) => ({ id: l.id, name: l.name })));

	function selectLocation(id: string) {
		selectedId = id;
		creating = false;
	}

	async function handleCreate(
		formData: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		await submitCreateLocation(data.projectId, formData);
		creating = false;
	}

	async function handleUpdate(
		formData: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!selectedLocation) return;
		await submitUpdateLocation(selectedLocation.id, formData);
	}

	async function handleDelete(id: string) {
		await submitDeleteLocation(id);
		confirmDeleteId = null;
		selectedId = null;
	}
</script>

<svelte:head>
	<title>Realms — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav
		projectId={data.projectId}
		topSection="locations"
		activeId="realms"
		ariaLabel="Atlas sections"
	/>

	<IndividualsWorkspaceShell
		characterOptions={options}
		selectedCharacterId={selectedId}
		onSelectCharacter={selectLocation}
		onCreateCharacter={() => {
			creating = true;
			selectedId = null;
		}}
		hasSelection={creating || selectedId !== null}
		listAriaLabel="Realms"
		createLabel="new +"
	>
		{#snippet dossier()}
			{#if creating}
				<div class="entity-dossier">
					<h2 class="dossier-title">New Realm</h2>
					<LocationForm
						saving={getLocationSaving()}
						onSave={handleCreate}
						onCancel={() => (creating = false)}
					/>
				</div>
			{:else if selectedLocation}
				<div class="entity-dossier">
					<div class="dossier-header">
						<h2 class="dossier-title">{selectedLocation.name}</h2>
						{#if confirmDeleteId === selectedLocation.id}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => handleDelete(selectedLocation.id)}>Confirm</button>
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = null)}>Cancel</button>
						{:else}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => (confirmDeleteId = selectedLocation.id)}>Delete</button>
						{/if}
					</div>
					<LocationForm
						location={selectedLocation}
						saving={getLocationSaving()}
						onSave={handleUpdate}
						onCancel={() => (selectedId = null)}
					/>
				</div>
			{/if}
		{/snippet}
		{#snippet empty()}
			<div class="entity-empty">
				<p>No realms yet.</p>
				<button class="bible-btn-sm" onclick={() => (creating = true)}>+ Add your first realm</button>
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
