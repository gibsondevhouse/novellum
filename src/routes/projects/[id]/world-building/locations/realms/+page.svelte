<script lang="ts">
	import { untrack } from 'svelte';
	import type { Location } from '$lib/db/types.js';
	import RealmDossierPane from '$modules/bible/components/RealmDossierPane.svelte';
	import RealmEmptyState from '$modules/bible/components/RealmEmptyState.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import IndividualsWorkspaceShell from '$modules/bible/components/IndividualsWorkspaceShell.svelte';
	import {
		formatLocationSubtitle,
		formatRealmMeta,
		isRealmLocation,
	} from '$modules/bible/narrative-locations.js';
	import {
		getLocations,
		getLocationSaving,
		initLocations,
		submitCreateLocation,
		submitDeleteLocation,
		submitUpdateLocation,
	} from '$modules/bible/stores/bible-crud.svelte.js';

	let { data }: { data: { projectId: string; locations: Location[] } } = $props();

	let creating = $state(false);
	let selectedId = $state<string | null>(
		untrack(() => data.locations.find((location) => isRealmLocation(location))?.id ?? null),
	);
	let confirmDeleteId = $state<string | null>(null);
	let realmPhotoUrls = $state<Record<string, string>>({});

	const REALM_PHOTO_STORAGE_KEY_PREFIX = 'novellum.realm.photo';

	$effect(() => {
		initLocations(data.locations);
	});

	const realms = $derived.by(() => getLocations().filter((location) => isRealmLocation(location)));

	const selectedLocation = $derived.by(() =>
		selectedId ? realms.find((location) => location.id === selectedId) ?? null : null,
	);

	const options = $derived.by(() =>
		realms
			.map((location) => ({
				id: location.id,
				name: location.name,
				subtitle: formatRealmMeta(location),
				meta: formatLocationSubtitle(location, 'Narrative environment'),
			}))
			.sort((a, b) => a.name.localeCompare(b.name)),
	);

	$effect(() => {
		if (selectedId && realms.some((location) => location.id === selectedId)) {
			return;
		}

		selectedId = realms[0]?.id ?? null;
	});

	$effect(() => {
		if (typeof window === 'undefined') return;

		const next: Record<string, string> = {};
		for (const realm of realms) {
			const key = `${REALM_PHOTO_STORAGE_KEY_PREFIX}:${data.projectId}:${realm.id}`;
			const saved = window.localStorage.getItem(key);
			if (saved) {
				next[realm.id] = saved;
			}
		}

		realmPhotoUrls = next;
	});

	function selectLocation(id: string) {
		confirmDeleteId = null;
		selectedId = id;
		creating = false;
	}

	async function createNewRealm() {
		creating = true;
	}

	async function handleCreate(
		formData: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		const created = await submitCreateLocation(data.projectId, formData);
		selectedId = created.id;
		creating = false;
		confirmDeleteId = null;
	}

	function readFileAsDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				const result = event.target?.result;
				if (typeof result !== 'string') {
					reject(new Error('Failed to read selected image.'));
					return;
				}
				resolve(result);
			};
			reader.onerror = () =>
				reject(reader.error ?? new Error('Failed to read selected image.'));
			reader.readAsDataURL(file);
		});
	}

	async function handleRealmPhotoUpload(file: File): Promise<void> {
		if (!selectedLocation || typeof window === 'undefined') return;

		const photoData = await readFileAsDataUrl(file);
		realmPhotoUrls = { ...realmPhotoUrls, [selectedLocation.id]: photoData };

		const key = `${REALM_PHOTO_STORAGE_KEY_PREFIX}:${data.projectId}:${selectedLocation.id}`;
		window.localStorage.setItem(key, photoData);
	}

	async function handleUpdate(
		formData: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!selectedId) return;
		await submitUpdateLocation(selectedId, formData);
	}

	async function handleDelete(id: string) {
		await submitDeleteLocation(id);
		confirmDeleteId = null;
		selectedId = null;
	}

	function cancelDelete() {
		confirmDeleteId = null;
	}

	function handleDeleteAction(id: string): void | Promise<void> {
		if (confirmDeleteId === id) {
			return handleDelete(id);
		}

		confirmDeleteId = id;
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
		onCreateCharacter={createNewRealm}
		hasSelection={creating || selectedId !== null}
		listAriaLabel="Realms"
		createLabel="new +"
	>
		{#snippet dossier()}
			{#if creating}
				<RealmDossierPane
					realm={null}
					isCreating={true}
					saving={getLocationSaving()}
					showDeleteConfirm={false}
					onSave={handleCreate}
					onCancel={() => (creating = false)}
					onDelete={() => {}}
					formatMeta={formatRealmMeta}
				/>
			{:else if selectedLocation}
				<RealmDossierPane
					realm={selectedLocation}
					saving={getLocationSaving()}
					showDeleteConfirm={confirmDeleteId === selectedLocation.id}
					onSave={handleUpdate}
					onCancel={cancelDelete}
					onDelete={() => handleDeleteAction(selectedLocation.id)}
					onPhotoUpload={handleRealmPhotoUpload}
					photoUrl={realmPhotoUrls[selectedLocation.id] ?? ''}
					formatMeta={formatRealmMeta}
				/>
			{/if}
		{/snippet}
		{#snippet empty()}
			<RealmEmptyState onCreate={createNewRealm} />
		{/snippet}
	</IndividualsWorkspaceShell>
</div>

<style>
	.worldbuilding-section-view {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		height: 100%;
		min-height: 0;
		overflow: hidden;
		overscroll-behavior: none;
	}

	@media (max-width: 768px) {
		.worldbuilding-section-view {
			height: auto;
			overflow: visible;
		}
	}
</style>
