<script lang="ts">
	import type { Location } from '$lib/db/types.js';
	import LocationForm from '$modules/bible/components/LocationForm.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import {
		getLocations,
		getLocationSaving,
		initLocations,
		submitCreateLocation,
		submitUpdateLocation,
		submitDeleteLocation,
	} from '$modules/bible/stores/bible-crud.svelte.js';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let { data }: { data: { projectId: string; locations: Location[] } } = $props();

	$effect(() => {
		initLocations(data.locations);
	});

	let showForm = $state(false);
	let editingLocation: Location | null = $state(null);
	let confirmDeleteId: string | null = $state(null);

	async function handleCreate(
		formData: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		await submitCreateLocation(data.projectId, formData);
		showForm = false;
	}

	async function handleUpdate(
		formData: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!editingLocation) return;
		await submitUpdateLocation(editingLocation.id, formData);
		editingLocation = null;
	}

	async function handleDelete(id: string) {
		await submitDeleteLocation(id);
		confirmDeleteId = null;
	}
</script>

<svelte:head>
	<title>Realms — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav projectId={data.projectId} topSection="locations" activeId="realms" ariaLabel="Atlas sections" />

	<div class="bible-page">
		<div class="bible-page-header">
			<div>
				<a class="bible-back-link" href="/projects/{data.projectId}/world-building/locations"
					>← Atlas</a
				>
				<h1>Realms</h1>
			</div>
			<PrimaryButton
				onclick={() => {
					showForm = !showForm;
					editingLocation = null;
				}}
			>
				{showForm ? 'Cancel' : '+ Add Realm'}
			</PrimaryButton>
		</div>

		{#if showForm}
		<div class="bible-form-section">
			<LocationForm
				saving={getLocationSaving()}
				onSave={handleCreate}
				onCancel={() => (showForm = false)}
			/>
		</div>
		{:else if editingLocation}
		<div class="bible-form-section">
			<LocationForm
				location={editingLocation}
				saving={getLocationSaving()}
				onSave={handleUpdate}
				onCancel={() => (editingLocation = null)}
			/>
		</div>
		{/if}

		{#if getLocations().length === 0 && !showForm}
		<div class="bible-empty-state">
			<p>No realms yet.</p>
			<GhostButton onclick={() => (showForm = true)}>+ Add your first realm</GhostButton>
		</div>
		{:else}
		<ul class="bible-entity-list">
			{#each getLocations() as loc (loc.id)}
				<li class="bible-entity-item">
					<div class="bible-item-body">
						<span class="bible-item-name">{loc.name}</span>
						{#if loc.description}<span class="bible-item-meta">{loc.description}</span>{/if}
					</div>
					<div class="bible-item-actions">
						<button
							class="bible-btn-sm"
							onclick={() => {
								editingLocation = loc;
								showForm = false;
							}}>Edit</button
						>
						{#if confirmDeleteId === loc.id}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => handleDelete(loc.id)}
								>Yes</button
							>
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = null)}>No</button>
						{:else}
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = loc.id)}>Delete</button
							>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
		{/if}
	</div>
</div>
