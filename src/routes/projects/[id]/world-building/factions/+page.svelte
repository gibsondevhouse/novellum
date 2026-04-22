<script lang="ts">
	import { translator } from '$lib/i18n';
	import { createAssetsStore } from '$modules/assets/stores/assets.svelte';
	import EmptyFactionState from '$modules/bible/components/EmptyFactionState.svelte';
	import FactionContinuityPanel from '$modules/bible/components/FactionContinuityPanel.svelte';
	import FactionCoreIdentityPanel from '$modules/bible/components/FactionCoreIdentityPanel.svelte';
	import FactionCulturePanel from '$modules/bible/components/FactionCulturePanel.svelte';
	import FactionCurrentStatePanel from '$modules/bible/components/FactionCurrentStatePanel.svelte';
	import FactionDetailHeader from '$modules/bible/components/FactionDetailHeader.svelte';
	import FactionMembersPanel from '$modules/bible/components/FactionMembersPanel.svelte';
	import FactionRelationshipPanel from '$modules/bible/components/FactionRelationshipPanel.svelte';
	import FactionStoryFunctionPanel from '$modules/bible/components/FactionStoryFunctionPanel.svelte';
	import WorldBuildingWorkspacePage from '$modules/bible/components/WorldBuildingWorkspacePage.svelte';

	type FactionRelationship = {
		id: string;
		targetFactionId: string;
		relationshipType?: string;
		status?: string;
		notes?: string;
	};

	type FactionRecord = {
		id: string;
		name: string;
		factionType?: string;
		alignment?: string;
		summary?: string;
		photoUrl?: string;
		publicReputation?: string;
		headquarters?: string;
		size?: string;
		sphereOfInfluence?: string;
		foundingPurpose?: string;
		ideology?: string;
		contradiction?: string;
		operatingTemperament?: string;
		publicFace?: string;
		privateReality?: string;
		greatestStrength?: string;
		greatestVulnerability?: string;
		roleInStory?: string;
		currentArcStage?: string;
		externalObjective?: string;
		internalFracture?: string;
		stakes?: string;
		sourceOfConflict?: string;
		currentStatus?: string;
		activeObjective?: string;
		currentPressure?: string;
		latestMajorMove?: string;
		lastSeenIn?: string;
		nextExpectedMove?: string;
		cultureSummary?: string;
		communicationStyle?: string;
		ritualsCustoms?: string;
		symbolsInsignia?: string;
		recruitmentStyle?: string;
		disciplineStyle?: string;
		internalSlogans?: string;
		publicMessagingSample?: string;
		immutableTraits?: string;
		knownHistoryMarkers?: string;
		alliances?: string;
		feuds?: string;
		internalRules?: string;
		secrets?: string;
		publicKnowledge?: string;
		lastMajorChange?: string;
		timelineMarkers?: string;
		leader?: string;
		knownMembers?: string;
		powerStructure?: string;
		keyRepresentatives?: string;
		relationships: FactionRelationship[];
	};

	type EditableFactionField = Exclude<keyof FactionRecord, 'id' | 'relationships'>;
	type FactionOption = { id: string; name: string; role?: string; summary?: string };

	let { data }: { data: { projectId: string } } = $props();

	const assetsStore = createAssetsStore(() => data.projectId || undefined);
	const storageKey = $derived(`novellum.factions.workspace:${data.projectId}`);

	let hasHydrated = $state(false);
	let factionsById = $state<Record<string, FactionRecord>>({});
	let selectedFactionId = $state<string | null>(null);

	const factionOptions = $derived.by<FactionOption[]>(() =>
		Object.values(factionsById)
			.map((faction) => ({
				id: faction.id,
				name: faction.name,
				role: faction.factionType,
				summary: faction.summary,
			}))
			.sort((a, b) => a.name.localeCompare(b.name)),
	);

	const selectedFaction = $derived(selectedFactionId ? factionsById[selectedFactionId] : null);

	$effect(() => {
		if (typeof window === 'undefined' || hasHydrated) return;
		const raw = window.localStorage.getItem(storageKey);
		if (raw) {
			try {
				const parsed = JSON.parse(raw) as Record<string, FactionRecord>;
				factionsById = parsed;
				selectedFactionId = Object.keys(parsed)[0] ?? null;
			} catch {
				factionsById = {};
			}
		}
		hasHydrated = true;
	});

	$effect(() => {
		if (typeof window === 'undefined' || !hasHydrated) return;
		window.localStorage.setItem(storageKey, JSON.stringify(factionsById));
	});

	function selectFaction(id: string) {
		selectedFactionId = id;
	}

	function updateFactionField(field: EditableFactionField, value: string) {
		if (!selectedFactionId) return;
		const current = factionsById[selectedFactionId];
		if (!current) return;

		factionsById[selectedFactionId] = {
			...current,
			[field]: value,
		};
	}

	function generateFactionId() {
		if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
			return crypto.randomUUID();
		}
		return `faction-${Date.now()}`;
	}

	function createNewFaction() {
		const id = generateFactionId();
		const nextCount = Object.keys(factionsById).length + 1;
		factionsById = {
			...factionsById,
			[id]: {
				id,
				name: `New Faction ${nextCount}`,
				factionType: '',
				summary: '',
				alignment: '',
				headquarters: '',
				relationships: [],
			},
		};
		selectedFactionId = id;
	}

	function updateRelationshipField(
		index: number,
		field: keyof Omit<FactionRelationship, 'id'>,
		value: string,
	) {
		if (!selectedFactionId) return;
		const current = factionsById[selectedFactionId];
		if (!current || !current.relationships[index]) return;

		const relationships = [...current.relationships];
		relationships[index] = {
			...relationships[index],
			[field]: value,
		};

		factionsById[selectedFactionId] = {
			...current,
			relationships,
		};
	}

	function addRelationship(relationship: Omit<FactionRelationship, 'id'>) {
		if (!selectedFactionId) return;
		const current = factionsById[selectedFactionId];
		if (!current) return;

		factionsById[selectedFactionId] = {
			...current,
			relationships: [...current.relationships, { ...relationship, id: `rel-${Date.now()}` }],
		};
	}

	function removeRelationship(index: number) {
		if (!selectedFactionId) return;
		const current = factionsById[selectedFactionId];
		if (!current) return;

		factionsById[selectedFactionId] = {
			...current,
			relationships: current.relationships.filter((_, relIndex) => relIndex !== index),
		};
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

	async function handleFactionPhotoUpload(file: File): Promise<void> {
		if (!selectedFactionId) return;
		const current = factionsById[selectedFactionId];
		if (!current) return;

		const dataUrl = await readFileAsDataUrl(file);
		const baseName = current.name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
		const extension = file.type.split('/')[1] || 'png';

		const createdAsset = await assetsStore.addAsset({
			projectId: data.projectId || 'global',
			name: `${baseName || 'faction'}-emblem.${extension}`,
			mimeType: file.type || 'image/png',
			data: dataUrl,
			sizeBytes: file.size,
		});

		updateFactionField('photoUrl', createdAsset.data);
	}
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.factions.title')}</title>
</svelte:head>

<WorldBuildingWorkspacePage
	projectId={data.projectId}
	topSection="characters"
	activeId="factions"
	ariaLabel={$translator('worldbuilding.aria.personaeSections')}
	options={factionOptions}
	selectedId={selectedFactionId}
	onSelect={selectFaction}
	onCreate={createNewFaction}
	hasSelection={!!selectedFaction}
	listAriaLabel={$translator('worldbuilding.list.factionNames')}
	createLabel={$translator('worldbuilding.workspace.common.createLabel')}
>
	{#snippet dossier()}
		<div class="faction-dossier">
			<FactionDetailHeader
				faction={selectedFaction}
				onFieldChange={updateFactionField}
				onPhotoUpload={handleFactionPhotoUpload}
			/>

			<div class="dossier-flow" aria-label="Faction dossier sections">
				<FactionCoreIdentityPanel faction={selectedFaction} onFieldChange={updateFactionField} />
				<FactionStoryFunctionPanel faction={selectedFaction} onFieldChange={updateFactionField} />
				<FactionCurrentStatePanel faction={selectedFaction} onFieldChange={updateFactionField} />
				<FactionCulturePanel faction={selectedFaction} onFieldChange={updateFactionField} />
				<FactionContinuityPanel faction={selectedFaction} onFieldChange={updateFactionField} />
				<FactionRelationshipPanel
					faction={selectedFaction}
					factions={factionOptions}
					currentFactionId={selectedFaction?.id || ''}
					onRelationshipFieldChange={updateRelationshipField}
					onAddRelationship={addRelationship}
					onRemoveRelationship={removeRelationship}
				/>
				<FactionMembersPanel faction={selectedFaction} onFieldChange={updateFactionField} />
			</div>
		</div>
	{/snippet}

	{#snippet empty()}
		<EmptyFactionState />
	{/snippet}
</WorldBuildingWorkspacePage>

<style>
	.faction-dossier {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
		max-width: 920px;
		width: 100%;
		padding-right: var(--space-6);
	}

	.dossier-flow {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	@media (max-width: 768px) {
		.faction-dossier {
			padding-right: 0;
		}
	}
</style>
