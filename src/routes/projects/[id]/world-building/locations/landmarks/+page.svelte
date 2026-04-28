<script lang="ts">
	import { untrack } from 'svelte';
	import type { Location } from '$lib/db/types.js';
	import { translator } from '$lib/i18n';
	import { getProjectMetadata, setProjectMetadata } from '$lib/project-metadata.js';
	import LandmarkDossierPane from '$modules/bible/components/LandmarkDossierPane.svelte';
	import LandmarkEmptyState from '$modules/bible/components/LandmarkEmptyState.svelte';
	import WorldBuildingWorkspacePage from '$modules/bible/components/WorldBuildingWorkspacePage.svelte';
	import {
		formatLandmarkMeta,
		formatLocationSubtitle,
		isLandmarkLocation,
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

	type RealmOption = {
		id: string;
		name: string;
		realmType?: string;
	};

	let { data }: { data: { projectId: string; locations: Location[] } } = $props();

	let creating = $state(false);
	let selectedLandmarkId = $state<string | null>(
		untrack(() => data.locations.find((location) => isLandmarkLocation(location))?.id ?? null),
	);
	let deleteConfirmLandmarkId = $state<string | null>(null);
	let landmarkPhotoUrls = $state<Record<string, string>>({});

	const LANDMARK_PHOTO_STORAGE_KEY_PREFIX = 'novellum.landmark.photo';

	$effect(() => {
		initLocations(data.locations);
	});

	const realmRecords = $derived.by(() =>
		getLocations().filter((location) => isRealmLocation(location)),
	);
	const landmarkRecords = $derived.by(() =>
		getLocations().filter((location) => isLandmarkLocation(location)),
	);

	const realmOptions = $derived.by<RealmOption[]>(() =>
		realmRecords
			.map((realm) => ({
				id: realm.id,
				name: realm.name,
				realmType: realm.realmType,
			}))
			.sort((a, b) => a.name.localeCompare(b.name)),
	);

	const landmarkOptions = $derived.by(() =>
		landmarkRecords
			.map((landmark) => ({
				id: landmark.id,
				name: landmark.name,
				subtitle: formatLandmarkMeta(landmark, realmRecords),
				meta: formatLocationSubtitle(landmark, 'Scene location'),
			}))
			.sort((a, b) => a.name.localeCompare(b.name)),
	);

	const selectedLandmark = $derived.by(() =>
		selectedLandmarkId
			? (landmarkRecords.find((landmark) => landmark.id === selectedLandmarkId) ?? null)
			: null,
	);

	$effect(() => {
		if (
			selectedLandmarkId &&
			landmarkRecords.some((landmark) => landmark.id === selectedLandmarkId)
		) {
			return;
		}

		selectedLandmarkId = landmarkRecords[0]?.id ?? null;
	});

	$effect(() => {
		if (typeof window === 'undefined') return;

		const next: Record<string, string> = {};
		for (const landmark of landmarkRecords) {
			const key = `${LANDMARK_PHOTO_STORAGE_KEY_PREFIX}:${data.projectId}:${landmark.id}`;
			const saved = window.localStorage.getItem(key);
			if (saved) {
				next[landmark.id] = saved;
			}
		}

		landmarkPhotoUrls = next;

		const pid = data.projectId;
		if (!pid) return;
		void getProjectMetadata<Record<string, string> | null>(
			pid,
			'project',
			pid,
			'landmark-photos',
			null,
		).then((remote) => {
			if (!remote || pid !== data.projectId) return;
			landmarkPhotoUrls = { ...landmarkPhotoUrls, ...remote };
			for (const [id, url] of Object.entries(remote)) {
				try {
					window.localStorage.setItem(`${LANDMARK_PHOTO_STORAGE_KEY_PREFIX}:${pid}:${id}`, url);
				} catch {
					/* ignore */
				}
			}
		});
	});

	function persistLandmarkPhotos(): void {
		const pid = data.projectId;
		if (!pid) return;
		void setProjectMetadata<Record<string, string>>(
			pid,
			'project',
			pid,
			'landmark-photos',
			landmarkPhotoUrls,
		);
	}

	function selectLandmark(id: string) {
		deleteConfirmLandmarkId = null;
		selectedLandmarkId = id;
		creating = false;
	}

	async function createLandmark() {
		if (realmOptions.length === 0) return;
		creating = true;
	}

	async function handleCreateLandmark(
		formData: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		const createdLandmark = await submitCreateLocation(data.projectId, formData);
		selectedLandmarkId = createdLandmark.id;
		creating = false;
		deleteConfirmLandmarkId = null;
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
			reader.onerror = () => reject(reader.error ?? new Error('Failed to read selected image.'));
			reader.readAsDataURL(file);
		});
	}

	async function handleLandmarkPhotoUpload(file: File): Promise<void> {
		if (!selectedLandmark || typeof window === 'undefined') return;

		const photoData = await readFileAsDataUrl(file);
		landmarkPhotoUrls = { ...landmarkPhotoUrls, [selectedLandmark.id]: photoData };

		const key = `${LANDMARK_PHOTO_STORAGE_KEY_PREFIX}:${data.projectId}:${selectedLandmark.id}`;
		window.localStorage.setItem(key, photoData);
		persistLandmarkPhotos();
	}

	async function updateLandmark(
		formData: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!selectedLandmarkId) return;
		await submitUpdateLocation(selectedLandmarkId, formData);
	}

	async function deleteLandmark(id: string) {
		await submitDeleteLocation(id);
		deleteConfirmLandmarkId = null;
		if (typeof window !== 'undefined') {
			const key = `${LANDMARK_PHOTO_STORAGE_KEY_PREFIX}:${data.projectId}:${id}`;
			window.localStorage.removeItem(key);
		}
		const nextPhotos = { ...landmarkPhotoUrls };
		delete nextPhotos[id];
		landmarkPhotoUrls = nextPhotos;
		persistLandmarkPhotos();
		selectedLandmarkId = null;
	}

	function cancelDelete() {
		deleteConfirmLandmarkId = null;
	}

	function requestOrConfirmDelete(id: string): void | Promise<void> {
		if (deleteConfirmLandmarkId === id) {
			return deleteLandmark(id);
		}

		deleteConfirmLandmarkId = id;
	}
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.landmarks.title')}</title>
</svelte:head>

<WorldBuildingWorkspacePage
	projectId={data.projectId}
	topSection="locations"
	activeId="landmarks"
	ariaLabel={$translator('worldbuilding.aria.atlasSections')}
	options={landmarkOptions}
	selectedId={selectedLandmarkId}
	onSelect={selectLandmark}
	onCreate={createLandmark}
	hasSelection={creating || !!selectedLandmark}
	listAriaLabel={$translator('worldbuilding.list.landmarks')}
	createLabel={$translator('worldbuilding.workspace.common.createLabel')}
>
	{#snippet dossier()}
		{#if creating}
			<LandmarkDossierPane
				landmark={null}
				realms={realmOptions}
				isCreating={true}
				saving={getLocationSaving()}
				showDeleteConfirm={false}
				onSave={handleCreateLandmark}
				onCancel={() => (creating = false)}
				onDelete={() => {}}
				formatMeta={(landmark) => formatLandmarkMeta(landmark, realmRecords)}
			/>
		{:else}
			<LandmarkDossierPane
				landmark={selectedLandmark}
				realms={realmOptions}
				saving={getLocationSaving()}
				showDeleteConfirm={deleteConfirmLandmarkId === selectedLandmark?.id}
				onSave={updateLandmark}
				onCancel={cancelDelete}
				onDelete={() =>
					selectedLandmark ? requestOrConfirmDelete(selectedLandmark.id) : undefined}
				onPhotoUpload={handleLandmarkPhotoUpload}
				photoUrl={selectedLandmark ? (landmarkPhotoUrls[selectedLandmark.id] ?? '') : ''}
				formatMeta={(landmark) => formatLandmarkMeta(landmark, realmRecords)}
			/>
		{/if}
	{/snippet}

	{#snippet empty()}
		<LandmarkEmptyState
			hasRealms={realmOptions.length > 0}
			onCreate={createLandmark}
			openRealmsHref={`/projects/${data.projectId}/world-building/locations/realms`}
		/>
	{/snippet}
</WorldBuildingWorkspacePage>
