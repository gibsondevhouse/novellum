<script lang="ts">
	import { untrack } from 'svelte';
	import type { Character, CharacterRelationship } from '$lib/db/types';
	import { createAssetsStore } from '$modules/assets/stores/assets.svelte';
	import {
		createCharacter,
		removeCharacter,
		updateCharacter,
	} from '$modules/bible/services/character-repository.js';
	import CharacterCorePanel from '$modules/bible/components/CharacterCorePanel.svelte';
	import CharacterDetailHeader from '$modules/bible/components/CharacterDetailHeader.svelte';
	import ContinuityPanel from '$modules/bible/components/ContinuityPanel.svelte';
	import EmptyCharacterState from '$modules/bible/components/EmptyCharacterState.svelte';
	import IndividualsWorkspaceShell from '$modules/bible/components/IndividualsWorkspaceShell.svelte';
	import NarrativeStatePanel from '$modules/bible/components/NarrativeStatePanel.svelte';
	import RelationshipPanel from '$modules/bible/components/RelationshipPanel.svelte';
	import StoryFunctionPanel from '$modules/bible/components/StoryFunctionPanel.svelte';
	import VoicePanel from '$modules/bible/components/VoicePanel.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';

	type LoadedData = {
		projectId: string;
		characters: Character[];
		relationships: CharacterRelationship[];
	};

	type LocalRelationship = {
		id: string;
		targetCharacterId: string;
		relationshipType: string;
		status?: string;
		notes?: string;
	};

	type CharacterRecord = {
		id: string;
		name: string;
		role?: string;
		occupation?: string;
		summary?: string;
		photoUrl?: string;
		age?: string;
		height?: string;
		weight?: string;
		build?: string;
		hair?: string;
		eyes?: string;
		coreDesire?: string;
		fear?: string;
		contradiction?: string;
		temperament?: string;
		alignment?: string;
		strength?: string;
		flaw?: string;
		storyRole?: string;
		arcStage?: string;
		externalGoal?: string;
		internalNeed?: string;
		stakes?: string;
		conflict?: string;
		voiceSummary?: string;
		speechPattern?: string;
		phrases?: string;
		tells?: string;
		bodyLanguage?: string;
		dialogueSample?: string;
		immutableTraits?: string;
		injuries?: string;
		habits?: string;
		secrets?: string;
		othersKnow?: string;
		lastChange?: string;
		timelineMarkers?: string;
		emotionalState?: string;
		currentObjective?: string;
		currentPressure?: string;
		lastSeen?: string;
		nextMove?: string;
		biography?: string;
		relationships: LocalRelationship[];
	};

	type EditableCharacterField = Exclude<keyof CharacterRecord, 'id' | 'relationships'>;
	type CharacterOption = { id: string; name: string; role?: string; summary?: string };

	const PHOTO_STORAGE_KEY_PREFIX = 'novellum.character.photo';

	let { data }: { data: LoadedData } = $props();
	const assetsStore = createAssetsStore(() => data.projectId || undefined);

	function mapCharacterRecord(
		character: Character,
		allRelationships: CharacterRelationship[],
	): CharacterRecord {
		const relationships = allRelationships
			.filter(
				(relationship) =>
					relationship.characterAId === character.id || relationship.characterBId === character.id,
			)
			.map((relationship) => ({
				id: relationship.id,
				targetCharacterId:
					relationship.characterAId === character.id
						? relationship.characterBId
						: relationship.characterAId,
				relationshipType: relationship.type || '',
				notes: relationship.description || '',
			}));

		return {
			id: character.id,
			name: character.name,
			role: character.role,
			summary: character.bio,
			photoUrl: character.photoUrl,
			biography: character.notes,
			relationships,
		};
	}

	function buildCharacterMap(
		characters: Character[],
		relationships: CharacterRelationship[],
	): Record<string, CharacterRecord> {
		const map: Record<string, CharacterRecord> = {};
		for (const character of characters) {
			map[character.id] = mapCharacterRecord(character, relationships);
		}
		return map;
	}

	let characterRecords = $state<Record<string, CharacterRecord>>(
		untrack(() => buildCharacterMap(data.characters, data.relationships)),
	);
	let selectedCharacterId = $state<string | null>(
		untrack(() => data.characters[0]?.id ?? null),
	);
	let deletingCharacterId = $state<string | null>(null);

	$effect(() => {
		const nextMap = buildCharacterMap(data.characters, data.relationships);
		characterRecords = nextMap;
		const currentSelection = untrack(() => selectedCharacterId);
		if (!currentSelection || !nextMap[currentSelection]) {
			selectedCharacterId = data.characters[0]?.id ?? Object.keys(nextMap)[0] ?? null;
		}
	});

	const characterOptions = $derived.by<CharacterOption[]>(() =>
		Object.values(characterRecords)
			.map((character) => ({
				id: character.id,
				name: character.name,
				role: character.role,
				summary: character.summary,
				subtitle: character.role?.trim() || 'Role not set',
				meta: character.summary?.trim() || 'No summary yet',
			}))
			.sort((a, b) => a.name.localeCompare(b.name)),
	);

	const selectedCharacter = $derived(
		selectedCharacterId ? characterRecords[selectedCharacterId] : null,
	);

	$effect(() => {
		if (typeof window === 'undefined') return;
		for (const characterId of Object.keys(characterRecords)) {
			const key = `${PHOTO_STORAGE_KEY_PREFIX}:${data.projectId}:${characterId}`;
			const persistedPhoto = window.localStorage.getItem(key);
			if (!persistedPhoto || characterRecords[characterId]?.photoUrl === persistedPhoto) continue;

			const current = characterRecords[characterId];
			if (!current) continue;

			characterRecords[characterId] = {
				...current,
				photoUrl: persistedPhoto,
			};
		}
	});

	function selectCharacter(id: string) {
		selectedCharacterId = id;
	}

	async function createNewCharacter() {
		const nextCount = Object.keys(characterRecords).length + 1;
		const created = await createCharacter({
			projectId: data.projectId,
			name: `New Character ${nextCount}`,
			role: '',
			pronunciation: '',
			aliases: [],
			diasporaOrigin: '',
			photoUrl: '',
			bio: '',
			faction: '',
			anomalies: [],
			traits: [],
			goals: [],
			flaws: [],
			arcs: [],
			notes: '',
			tags: [],
		});

		characterRecords = {
			...characterRecords,
			[created.id]: mapCharacterRecord(created, []),
		};
		selectedCharacterId = created.id;
	}

	async function persistCharacterField(
		characterId: string,
		field: EditableCharacterField,
		value: string,
	): Promise<void> {
		if (field === 'name') {
			await updateCharacter(characterId, { name: value });
			return;
		}
		if (field === 'role') {
			await updateCharacter(characterId, { role: value });
			return;
		}
		if (field === 'summary') {
			await updateCharacter(characterId, { bio: value });
			return;
		}
		if (field === 'photoUrl') {
			await updateCharacter(characterId, { photoUrl: value });
			return;
		}
		if (field === 'biography') {
			await updateCharacter(characterId, { notes: value });
		}
	}

	function updateCharacterField(field: EditableCharacterField, value: string) {
		if (!selectedCharacterId) return;
		const current = characterRecords[selectedCharacterId];
		if (!current) return;

		characterRecords[selectedCharacterId] = {
			...current,
			[field]: value,
		};

		if (field === 'photoUrl' && typeof window !== 'undefined') {
			const key = `${PHOTO_STORAGE_KEY_PREFIX}:${data.projectId}:${selectedCharacterId}`;
			if (value.trim()) {
				window.localStorage.setItem(key, value);
			} else {
				window.localStorage.removeItem(key);
			}
		}

		void persistCharacterField(selectedCharacterId, field, value);
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

	async function handleCharacterPhotoUpload(file: File): Promise<void> {
		if (!selectedCharacterId) return;
		const current = characterRecords[selectedCharacterId];
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
			name: `${baseName || 'character'}-portrait.${extension}`,
			mimeType: file.type || 'image/png',
			data: dataUrl,
			sizeBytes: file.size,
		});

		updateCharacterField('photoUrl', createdAsset.data);
	}

	function updateRelationshipField(
		index: number,
		field: keyof Omit<LocalRelationship, 'id'>,
		value: string,
	) {
		if (!selectedCharacterId) return;
		const current = characterRecords[selectedCharacterId];
		if (!current || !current.relationships[index]) return;

		const relationships = [...current.relationships];
		relationships[index] = {
			...relationships[index],
			[field]: value,
		};

		characterRecords[selectedCharacterId] = {
			...current,
			relationships,
		};
	}

	function addRelationship(relationship: {
		targetCharacterId: string;
		relationshipType?: string;
		status?: string;
		notes?: string;
	}) {
		if (!selectedCharacterId) return;
		const current = characterRecords[selectedCharacterId];
		if (!current) return;

		const nextId = `rel-${Date.now()}`;
		characterRecords[selectedCharacterId] = {
			...current,
			relationships: [
				...current.relationships,
				{
					id: nextId,
					targetCharacterId: relationship.targetCharacterId,
					relationshipType: relationship.relationshipType ?? '',
					status: relationship.status,
					notes: relationship.notes,
				},
			],
		};
	}

	function removeRelationship(index: number) {
		if (!selectedCharacterId) return;
		const current = characterRecords[selectedCharacterId];
		if (!current) return;

		const relationships = current.relationships.filter(
			(_, relationshipIndex) => relationshipIndex !== index,
		);
		characterRecords[selectedCharacterId] = {
			...current,
			relationships,
		};
	}

	async function deleteSelectedCharacter() {
		if (!selectedCharacterId) return;
		const characterId = selectedCharacterId;
		const characterName = characterRecords[characterId]?.name || 'this character';

		if (typeof window !== 'undefined') {
			const shouldDelete = window.confirm(
				`Delete ${characterName}? This cannot be undone.`,
			);
			if (!shouldDelete) return;
		}

		deletingCharacterId = characterId;
		await removeCharacter(characterId);

		const nextRecords = { ...characterRecords };
		delete nextRecords[characterId];
		characterRecords = nextRecords;

		if (typeof window !== 'undefined') {
			const photoStorageKey = `${PHOTO_STORAGE_KEY_PREFIX}:${data.projectId}:${characterId}`;
			window.localStorage.removeItem(photoStorageKey);
		}

		const remainingIds = Object.keys(nextRecords).sort((a, b) => {
			const aName = nextRecords[a]?.name || '';
			const bName = nextRecords[b]?.name || '';
			return aName.localeCompare(bName);
		});

		selectedCharacterId = remainingIds[0] ?? null;
		deletingCharacterId = null;
	}
</script>

<svelte:head>
	<title>Individuals — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav projectId={data.projectId} topSection="characters" activeId="individuals" ariaLabel="Personae sections" />
	<IndividualsWorkspaceShell
		{characterOptions}
		{selectedCharacterId}
		onSelectCharacter={selectCharacter}
		onCreateCharacter={createNewCharacter}
		hasSelection={!!selectedCharacter}
	>
		{#snippet dossier()}
			<div class="character-dossier">
				<CharacterDetailHeader
					character={selectedCharacter}
					onFieldChange={updateCharacterField}
					onPhotoUpload={handleCharacterPhotoUpload}
				/>

				<div class="dossier-flow" aria-label="Character dossier sections">
					<CharacterCorePanel character={selectedCharacter} onFieldChange={updateCharacterField} />
					<StoryFunctionPanel character={selectedCharacter} onFieldChange={updateCharacterField} />
					<NarrativeStatePanel character={selectedCharacter} onFieldChange={updateCharacterField} />
					<VoicePanel character={selectedCharacter} onFieldChange={updateCharacterField} />
					<ContinuityPanel character={selectedCharacter} onFieldChange={updateCharacterField} />
					<RelationshipPanel
						character={selectedCharacter}
						characters={characterOptions}
						currentCharacterId={selectedCharacter?.id || ''}
						onRelationshipFieldChange={updateRelationshipField}
						onAddRelationship={addRelationship}
						onRemoveRelationship={removeRelationship}
					/>
				</div>

				<div class="dossier-footer-actions">
					<button
						type="button"
						class="delete-character-btn"
						onclick={deleteSelectedCharacter}
						disabled={deletingCharacterId === selectedCharacter?.id}
					>
						{deletingCharacterId === selectedCharacter?.id ? 'Deleting…' : 'Delete Character'}
					</button>
				</div>
			</div>
		{/snippet}

		{#snippet empty()}
			<EmptyCharacterState />
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

	.delete-character-btn {
		border: 1px solid color-mix(in srgb, var(--color-semantic-error-fg) 50%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-semantic-error-bg) 35%, transparent);
		color: var(--color-semantic-error-fg);
		padding: 0.45rem 0.75rem;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
	}

	.delete-character-btn:hover:enabled {
		background: color-mix(in srgb, var(--color-semantic-error-bg) 55%, transparent);
	}

	.delete-character-btn:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.worldbuilding-section-view {
			height: auto;
			overflow: visible;
		}
	}

</style>
