<script lang="ts">
	import { translator } from '$lib/i18n';
	import { createAssetsStore } from '$modules/assets/stores/assets.svelte';
	import EmptyLineageState from '$modules/bible/components/EmptyLineageState.svelte';
	import LineageContinuityPanel from '$modules/bible/components/LineageContinuityPanel.svelte';
	import LineageCoreIdentityPanel from '$modules/bible/components/LineageCoreIdentityPanel.svelte';
	import LineageCurrentStatePanel from '$modules/bible/components/LineageCurrentStatePanel.svelte';
	import LineageDetailHeader from '$modules/bible/components/LineageDetailHeader.svelte';
	import LineageInheritanceCulturePanel from '$modules/bible/components/LineageInheritanceCulturePanel.svelte';
	import LineageMembersPanel from '$modules/bible/components/LineageMembersPanel.svelte';
	import LineageRelationshipPanel from '$modules/bible/components/LineageRelationshipPanel.svelte';
	import LineageStoryFunctionPanel from '$modules/bible/components/LineageStoryFunctionPanel.svelte';
	import WorldBuildingWorkspacePage from '$modules/bible/components/WorldBuildingWorkspacePage.svelte';

	type LineageRelationship = {
		id: string;
		targetLineageId: string;
		relationshipType?: string;
		status?: string;
		notes?: string;
	};

	type LineageRecord = {
		id: string;
		name: string;
		lineageType?: string;
		summary?: string;
		photoUrl?: string;
		origin?: string;
		eraAge?: string;
		regionHomeland?: string;
		currentStatus?: string;
		foundingOrigin?: string;
		inheritedValues?: string;
		definingContradiction?: string;
		publicReputation?: string;
		internalTruth?: string;
		greatestStrength?: string;
		greatestVulnerability?: string;
		distinctiveMark?: string;
		roleInStory?: string;
		currentArcStage?: string;
		externalObjective?: string;
		hiddenBurden?: string;
		stakes?: string;
		sourceOfConflict?: string;
		presentCondition?: string;
		activeInfluence?: string;
		currentThreat?: string;
		lastMajorEvent?: string;
		lastSeenIn?: string;
		nextExpectedMove?: string;
		inheritedTraits?: string;
		customsTraditions?: string;
		ritesRituals?: string;
		taboos?: string;
		symbolsHeraldry?: string;
		namingConventions?: string;
		generationalExpectations?: string;
		commonSayings?: string;
		culturalIdentitySummary?: string;
		immutableFacts?: string;
		bloodlineMarkers?: string;
		successionRules?: string;
		majorBranches?: string;
		knownDescendants?: string;
		secrets?: string;
		outsiderKnowledge?: string;
		lastMajorChange?: string;
		timelineMarkers?: string;
		founder?: string;
		notableAncestors?: string;
		currentHeirs?: string;
		claimants?: string;
		disputedMembers?: string;
		legacyFigures?: string;
		relationships: LineageRelationship[];
	};

	type EditableLineageField = Exclude<keyof LineageRecord, 'id' | 'relationships'>;
	type LineageOption = { id: string; name: string; role?: string; summary?: string };

	let { data }: { data: { projectId: string } } = $props();

	const assetsStore = createAssetsStore(() => data.projectId || undefined);
	const storageKey = $derived(`novellum.lineages.workspace:${data.projectId}`);

	let hasHydrated = $state(false);
	let lineagesById = $state<Record<string, LineageRecord>>({});
	let selectedLineageId = $state<string | null>(null);

	const lineageOptions = $derived.by<LineageOption[]>(() =>
		Object.values(lineagesById)
			.map((lineage) => ({
				id: lineage.id,
				name: lineage.name,
				role: lineage.lineageType,
				summary: lineage.summary,
			}))
			.sort((a, b) => a.name.localeCompare(b.name)),
	);

	const selectedLineage = $derived(selectedLineageId ? lineagesById[selectedLineageId] : null);

	$effect(() => {
		if (typeof window === 'undefined' || hasHydrated) return;
		const raw = window.localStorage.getItem(storageKey);
		if (raw) {
			try {
				const parsed = JSON.parse(raw) as Record<string, LineageRecord>;
				lineagesById = parsed;
				selectedLineageId = Object.keys(parsed)[0] ?? null;
			} catch {
				lineagesById = {};
			}
		}
		hasHydrated = true;
	});

	$effect(() => {
		if (typeof window === 'undefined' || !hasHydrated) return;
		window.localStorage.setItem(storageKey, JSON.stringify(lineagesById));
	});

	function selectLineage(id: string) {
		selectedLineageId = id;
	}

	function updateLineageField(field: EditableLineageField, value: string) {
		if (!selectedLineageId) return;
		const current = lineagesById[selectedLineageId];
		if (!current) return;

		lineagesById[selectedLineageId] = {
			...current,
			[field]: value,
		};
	}

	function generateLineageId() {
		if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
			return crypto.randomUUID();
		}
		return `lineage-${Date.now()}`;
	}

	function createNewLineage() {
		const id = generateLineageId();
		const nextCount = Object.keys(lineagesById).length + 1;
		lineagesById = {
			...lineagesById,
			[id]: {
				id,
				name: `New Lineage ${nextCount}`,
				lineageType: '',
				summary: '',
				origin: '',
				regionHomeland: '',
				currentStatus: '',
				relationships: [],
			},
		};
		selectedLineageId = id;
	}

	function updateRelationshipField(
		index: number,
		field: keyof Omit<LineageRelationship, 'id'>,
		value: string,
	) {
		if (!selectedLineageId) return;
		const current = lineagesById[selectedLineageId];
		if (!current || !current.relationships[index]) return;

		const relationships = [...current.relationships];
		relationships[index] = {
			...relationships[index],
			[field]: value,
		};

		lineagesById[selectedLineageId] = {
			...current,
			relationships,
		};
	}

	function addRelationship(relationship: Omit<LineageRelationship, 'id'>) {
		if (!selectedLineageId) return;
		const current = lineagesById[selectedLineageId];
		if (!current) return;

		lineagesById[selectedLineageId] = {
			...current,
			relationships: [...current.relationships, { ...relationship, id: `rel-${Date.now()}` }],
		};
	}

	function removeRelationship(index: number) {
		if (!selectedLineageId) return;
		const current = lineagesById[selectedLineageId];
		if (!current) return;

		lineagesById[selectedLineageId] = {
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

	async function handleLineagePhotoUpload(file: File): Promise<void> {
		if (!selectedLineageId) return;
		const current = lineagesById[selectedLineageId];
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
			name: `${baseName || 'lineage'}-crest.${extension}`,
			mimeType: file.type || 'image/png',
			data: dataUrl,
			sizeBytes: file.size,
		});

		updateLineageField('photoUrl', createdAsset.data);
	}
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.lineages.title')}</title>
</svelte:head>

<WorldBuildingWorkspacePage
	projectId={data.projectId}
	topSection="characters"
	activeId="lineages"
	ariaLabel={$translator('worldbuilding.aria.personaeSections')}
	options={lineageOptions}
	selectedId={selectedLineageId}
	onSelect={selectLineage}
	onCreate={createNewLineage}
	hasSelection={!!selectedLineage}
	listAriaLabel={$translator('worldbuilding.list.lineageNames')}
	createLabel={$translator('worldbuilding.workspace.common.createLabel')}
>
	{#snippet dossier()}
		<div class="lineage-dossier">
			<LineageDetailHeader
				lineage={selectedLineage}
				onFieldChange={updateLineageField}
				onPhotoUpload={handleLineagePhotoUpload}
			/>

			<div class="dossier-flow" aria-label="Lineage dossier sections">
				<LineageCoreIdentityPanel lineage={selectedLineage} onFieldChange={updateLineageField} />
				<LineageStoryFunctionPanel lineage={selectedLineage} onFieldChange={updateLineageField} />
				<LineageCurrentStatePanel lineage={selectedLineage} onFieldChange={updateLineageField} />
				<LineageInheritanceCulturePanel
					lineage={selectedLineage}
					onFieldChange={updateLineageField}
				/>
				<LineageContinuityPanel lineage={selectedLineage} onFieldChange={updateLineageField} />
				<LineageRelationshipPanel
					lineage={selectedLineage}
					lineages={lineageOptions}
					currentLineageId={selectedLineage?.id || ''}
					onRelationshipFieldChange={updateRelationshipField}
					onAddRelationship={addRelationship}
					onRemoveRelationship={removeRelationship}
				/>
				<LineageMembersPanel lineage={selectedLineage} onFieldChange={updateLineageField} />
			</div>
		</div>
	{/snippet}

	{#snippet empty()}
		<EmptyLineageState />
	{/snippet}
</WorldBuildingWorkspacePage>

<style>
	.lineage-dossier {
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
		.lineage-dossier {
			padding-right: 0;
		}
	}
</style>
