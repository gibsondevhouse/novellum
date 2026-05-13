<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import type { Character, CharacterRelationship } from '$lib/db/domain-types';
	import { translator } from '$lib/i18n';
	import { DestructiveButton } from '$lib/components/ui/index.js';
	import { getProjectMetadata, setProjectMetadata } from '$lib/project-metadata.js';
	import { createAssetsStore } from '$modules/assets/stores/assets.svelte';
	import {
		createCharacter,
		removeCharacter,
		updateCharacter,
		createRelationship,
		removeRelationship as removePersistedRelationship,
		updateRelationship,
	} from '$modules/world-building/services/character-repository.js';
	import {
		addRelationshipReciprocal,
		removeRelationshipReciprocal,
		updateRelationshipReciprocal,
		type IndividualsCharacterRecord,
	} from '$modules/world-building/services/individuals-relationship-state.js';
	import CharacterCorePanel from '$modules/world-building/components/CharacterCorePanel.svelte';
	import CharacterDetailHeader from '$modules/world-building/components/CharacterDetailHeader.svelte';
	import ContinuityPanel from '$modules/world-building/components/ContinuityPanel.svelte';
	import EmptyCharacterState from '$modules/world-building/components/EmptyCharacterState.svelte';
	import NarrativeStatePanel from '$modules/world-building/components/NarrativeStatePanel.svelte';
	import RelationshipPanel from '$modules/world-building/components/RelationshipPanel.svelte';
	import StoryFunctionPanel from '$modules/world-building/components/StoryFunctionPanel.svelte';
	import VoicePanel from '$modules/world-building/components/VoicePanel.svelte';
	import WorldBuildingWorkspacePage from '$modules/world-building/components/WorldBuildingWorkspacePage.svelte';

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

	function isTemporaryRelationshipId(id: string): boolean {
		return id.startsWith('rel-');
	}

	function swapRelationshipIdAcrossCharacters(
		relationshipId: string,
		nextRelationshipId: string,
		characterAId: string,
		characterBId: string,
	) {
		const nextCharacterRecords = { ...characterRecords };
		for (const characterId of [characterAId, characterBId]) {
			const character = nextCharacterRecords[characterId];
			if (!character) continue;
			nextCharacterRecords[characterId] = {
				...character,
				relationships: character.relationships.map((relationship) =>
					relationship.id === relationshipId
						? { ...relationship, id: nextRelationshipId }
						: relationship,
				),
			};
		}
		characterRecords = nextCharacterRecords;
	}

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
				status: relationship.status || '',
				notes: relationship.description || '',
			}));

		return {
			id: character.id,
			name: character.name,
			role: character.role,
			occupation: character.occupation,
			summary: character.bio,
			photoUrl: character.photoUrl,
			age: character.age,
			height: character.height,
			weight: character.weight,
			build: character.build,
			hair: character.hair,
			eyes: character.eyes,
			coreDesire: character.coreDesire,
			fear: character.fear,
			contradiction: character.contradiction,
			temperament: character.temperament,
			alignment: character.alignment,
			strength: character.strength,
			flaw: character.flaw,
			storyRole: character.storyRole,
			arcStage: character.arcStage,
			externalGoal: character.externalGoal,
			internalNeed: character.internalNeed,
			stakes: character.stakes,
			conflict: character.conflict,
			voiceSummary: character.voiceSummary,
			speechPattern: character.speechPattern,
			phrases: character.phrases,
			tells: character.tells,
			bodyLanguage: character.bodyLanguage,
			dialogueSample: character.dialogueSample,
			immutableTraits: character.immutableTraits,
			injuries: character.injuries,
			habits: character.habits,
			secrets: character.secrets,
			othersKnow: character.othersKnow,
			lastChange: character.lastChange,
			timelineMarkers: character.timelineMarkers,
			emotionalState: character.emotionalState,
			currentObjective: character.currentObjective,
			currentPressure: character.currentPressure,
			lastSeen: character.lastSeen,
			nextMove: character.nextMove,
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
	let selectedCharacterId = $state<string | null>(untrack(() => data.characters[0]?.id ?? null));
	let deletingCharacterId = $state<string | null>(null);
	let pendingSaveCount = $state(0);
	let saveErrorMessage = $state<string | null>(null);
	let lastSavedAt = $state<number | null>(null);
	const hasPendingSaves = $derived(pendingSaveCount > 0);
	const showSaveIndicator = $derived(hasPendingSaves || !!saveErrorMessage || !!lastSavedAt);

	async function runWithPersistenceFeedback(
		operation: () => Promise<void>,
		errorMessage: string,
	): Promise<boolean> {
		pendingSaveCount += 1;
		saveErrorMessage = null;
		try {
			await operation();
			lastSavedAt = Date.now();
			return true;
		} catch (error) {
			console.error(errorMessage, error);
			saveErrorMessage = errorMessage;
			return false;
		} finally {
			pendingSaveCount = Math.max(0, pendingSaveCount - 1);
		}
	}

	async function runWithPersistenceResult<T>(
		operation: () => Promise<T>,
		errorMessage: string,
	): Promise<T | null> {
		pendingSaveCount += 1;
		saveErrorMessage = null;
		try {
			const result = await operation();
			lastSavedAt = Date.now();
			return result;
		} catch (error) {
			console.error(errorMessage, error);
			saveErrorMessage = errorMessage;
			return null;
		} finally {
			pendingSaveCount = Math.max(0, pendingSaveCount - 1);
		}
	}

	// Debounced field-save scheduler. Each (entity, field) pair gets its own
	// timer so different fields don't cancel each other. Typing fast in one
	// field collapses N keystrokes into 1 PUT after the user pauses. Tab-out
	// or window-close flushes any pending saves so nothing is lost.
	const SAVE_DEBOUNCE_MS = 600;
	interface PendingSave {
		timer: ReturnType<typeof setTimeout>;
		op: () => Promise<void>;
		errorMessage: string;
	}
	// Plain Map is intentional: this is a non-reactive cache of in-flight
	// save timers. Reactivity would re-run on every set/delete for no gain.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const pendingSaves: Map<string, PendingSave> = new Map();

	function scheduleSave(
		key: string,
		operation: () => Promise<void>,
		errorMessage: string,
	): void {
		const existing = pendingSaves.get(key);
		if (existing) clearTimeout(existing.timer);
		const timer = setTimeout(() => {
			pendingSaves.delete(key);
			void runWithPersistenceFeedback(operation, errorMessage);
		}, SAVE_DEBOUNCE_MS);
		pendingSaves.set(key, { timer, op: operation, errorMessage });
	}

	function flushPendingSaves(): void {
		if (pendingSaves.size === 0) return;
		const entries = Array.from(pendingSaves.values());
		pendingSaves.clear();
		for (const entry of entries) {
			clearTimeout(entry.timer);
			void runWithPersistenceFeedback(entry.op, entry.errorMessage);
		}
	}

	if (typeof window !== 'undefined') {
		const handleBeforeUnload = () => flushPendingSaves();
		const handleVisibility = () => {
			if (document.visibilityState === 'hidden') flushPendingSaves();
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		document.addEventListener('visibilitychange', handleVisibility);
		onDestroy(() => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			document.removeEventListener('visibilitychange', handleVisibility);
			flushPendingSaves();
		});
	}

	$effect(() => {
		const nextMap = buildCharacterMap(data.characters, data.relationships);
		characterRecords = nextMap;
		const currentSelection = untrack(() => selectedCharacterId);
		if (!currentSelection || !nextMap[currentSelection]) {
			selectedCharacterId = data.characters[0]?.id ?? Object.keys(nextMap)[0] ?? null;
		}
	});

	// Flush pending debounced saves whenever the selected character changes,
	// so switching dossiers never strands keystrokes typed in the previous one.
	$effect(() => {
		// Tracked: selectedCharacterId. We don't read it, just depend on it.
		void selectedCharacterId;
		untrack(() => flushPendingSaves());
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

		// Reconcile with SQLite-canonical character-photos blob.
		const pid = data.projectId;
		if (!pid) return;
		void getProjectMetadata<Record<string, string> | null>(
			pid,
			'project',
			pid,
			'character-photos',
			null,
		).then((remote) => {
			if (!remote || pid !== data.projectId) return;
			for (const [characterId, photoUrl] of Object.entries(remote)) {
				const current = characterRecords[characterId];
				if (!current) continue;
				if (current.photoUrl === photoUrl) continue;
				characterRecords[characterId] = { ...current, photoUrl };
				try {
					window.localStorage.setItem(`${PHOTO_STORAGE_KEY_PREFIX}:${pid}:${characterId}`, photoUrl);
				} catch {
					/* ignore */
				}
			}
		});
	});

	function collectCharacterPhotos(): Record<string, string> {
		const out: Record<string, string> = {};
		for (const [id, record] of Object.entries(characterRecords)) {
			if (record?.photoUrl) out[id] = record.photoUrl;
		}
		return out;
	}

	function persistCharacterPhotos(): void {
		const pid = data.projectId;
		if (!pid) return;
		void setProjectMetadata<Record<string, string>>(
			pid,
			'project',
			pid,
			'character-photos',
			collectCharacterPhotos(),
		);
	}

	function selectCharacter(id: string) {
		selectedCharacterId = id;
	}

	async function createNewCharacter() {
		const nextCount = Object.keys(characterRecords).length + 1;
		const created = await runWithPersistenceResult<Character>(
			() =>
				createCharacter({
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
				}),
			'Could not create character.',
		);

		if (!created) {
			return;
		}

		characterRecords = {
			...characterRecords,
			[created.id]: mapCharacterRecord(created, []),
		};
		selectedCharacterId = created.id;
	}

	async function persistCharacterField(
		characterId: string,
		field: EditableCharacterField,
		nextCharacter: CharacterRecord,
	): Promise<void> {
		if (field === 'name') {
			await updateCharacter(characterId, { name: nextCharacter.name });
			return;
		}
		if (field === 'role') {
			await updateCharacter(characterId, { role: nextCharacter.role ?? '' });
			return;
		}
		if (field === 'summary') {
			await updateCharacter(characterId, { bio: nextCharacter.summary ?? '' });
			return;
		}
		if (field === 'photoUrl') {
			await updateCharacter(characterId, { photoUrl: nextCharacter.photoUrl ?? '' });
			return;
		}
		if (field === 'biography') {
			await updateCharacter(characterId, { notes: nextCharacter.biography ?? '' });
			return;
		}

		await updateCharacter(characterId, {
			[field]: nextCharacter[field] ?? '',
		} as Partial<Omit<Character, 'id' | 'createdAt'>>);
	}

	function updateCharacterField(field: EditableCharacterField, value: string) {
		const activeCharacterId = selectedCharacterId;
		if (!activeCharacterId) return;
		const current = characterRecords[activeCharacterId];
		if (!current) return;

		const nextCharacter = {
			...current,
			[field]: value,
		};
		characterRecords[activeCharacterId] = nextCharacter;

		if (field === 'photoUrl' && typeof window !== 'undefined') {
			const key = `${PHOTO_STORAGE_KEY_PREFIX}:${data.projectId}:${activeCharacterId}`;
			if (value.trim()) {
				window.localStorage.setItem(key, value);
			} else {
				window.localStorage.removeItem(key);
			}
			persistCharacterPhotos();
		}

		// Debounce text-field saves so a fast typist doesn't fire one PUT
		// per keystroke. Persists are idempotent (full-field overwrite), so
		// collapsing intermediate states is safe.
		scheduleSave(
			`char:${activeCharacterId}:${field}`,
			() => persistCharacterField(activeCharacterId, field, nextCharacter),
			'Could not save character changes.',
		);
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

		const createdAsset = await runWithPersistenceResult<{ data: string }>(
			() =>
				assetsStore.addAsset({
				projectId: data.projectId || 'global',
				name: `${baseName || 'character'}-portrait.${extension}`,
				mimeType: file.type || 'image/png',
				data: dataUrl,
				sizeBytes: file.size,
				}),
			'Could not upload character photo.',
		);

		if (!createdAsset) {
			return;
		}

		updateCharacterField('photoUrl', createdAsset.data);
	}

	function updateRelationshipField(
		index: number,
		field: keyof Omit<LocalRelationship, 'id'>,
		value: string,
	) {
		if (!selectedCharacterId) return;
		const { nextRecords, previousRelationship, updatedRelationship } = updateRelationshipReciprocal(
			characterRecords as Record<string, IndividualsCharacterRecord>,
			selectedCharacterId,
			index,
			field,
			value,
		);
		if (!previousRelationship || !updatedRelationship) return;

		characterRecords = nextRecords as typeof characterRecords;

		if (field === 'targetCharacterId') {
			const sourceCharacterId = selectedCharacterId;
			const replacement = updatedRelationship;
			void runWithPersistenceFeedback(async () => {
					const created = await createRelationship({
						projectId: data.projectId,
						characterAId: sourceCharacterId,
						characterBId: replacement.targetCharacterId,
						type: replacement.relationshipType,
						status: replacement.status ?? '',
						description: replacement.notes ?? '',
					});

					if (!isTemporaryRelationshipId(previousRelationship.id)) {
						await removePersistedRelationship(previousRelationship.id);
					}

					swapRelationshipIdAcrossCharacters(
						previousRelationship.id,
						created.id,
						sourceCharacterId,
						replacement.targetCharacterId,
					);
			}, 'Could not save relationship target change.');
			return;
		}

		const relationshipToPersist = updatedRelationship;
		if (isTemporaryRelationshipId(relationshipToPersist.id)) {
			return;
		}

		const relationshipChanges: { type: string; status: string; description: string } = {
			type: relationshipToPersist.relationshipType,
			status: relationshipToPersist.status ?? '',
			description: relationshipToPersist.notes ?? '',
		};

		scheduleSave(
			`rel:${relationshipToPersist.id}:${field}`,
			() => updateRelationship(relationshipToPersist.id, relationshipChanges).then(() => undefined),
			'Could not save relationship changes.',
		);
	}

	function addRelationship(relationship: {
		targetCharacterId: string;
		relationshipType?: string;
		status?: string;
		notes?: string;
	}) {
		const sourceCharacterId = selectedCharacterId;
		if (!sourceCharacterId) return;

		const nextId = `rel-${Date.now()}`;
		const nextRelationship: LocalRelationship = {
			id: nextId,
			targetCharacterId: relationship.targetCharacterId,
			relationshipType: relationship.relationshipType ?? '',
			status: relationship.status,
			notes: relationship.notes,
		};
		characterRecords = addRelationshipReciprocal(
			characterRecords as Record<string, IndividualsCharacterRecord>,
			sourceCharacterId,
			nextRelationship,
		) as typeof characterRecords;

		const relationshipType = relationship.relationshipType ?? '';
		const notes = relationship.notes ?? '';
		const status = relationship.status ?? '';
		void runWithPersistenceFeedback(async () => {
				const created = await createRelationship({
					projectId: data.projectId,
					characterAId: sourceCharacterId,
					characterBId: relationship.targetCharacterId,
					type: relationshipType,
					status,
					description: notes,
				});
				swapRelationshipIdAcrossCharacters(
					nextId,
					created.id,
					sourceCharacterId,
					relationship.targetCharacterId,
				);
		}, 'Could not create relationship.');
	}

	function removeRelationship(index: number) {
		if (!selectedCharacterId) return;
		const { nextRecords, removedRelationship: relationshipToRemove } = removeRelationshipReciprocal(
			characterRecords as Record<string, IndividualsCharacterRecord>,
			selectedCharacterId,
			index,
		);
		if (!relationshipToRemove) return;
		characterRecords = nextRecords as typeof characterRecords;

		if (isTemporaryRelationshipId(relationshipToRemove.id)) {
			return;
		}

		void runWithPersistenceFeedback(
			() => removePersistedRelationship(relationshipToRemove.id),
			'Could not delete relationship.',
		);
	}

	async function deleteSelectedCharacter() {
		if (!selectedCharacterId) return;
		const characterId = selectedCharacterId;
		const characterName = characterRecords[characterId]?.name || 'this character';

		if (typeof window !== 'undefined') {
			const shouldDelete = window.confirm(`Delete ${characterName}? This cannot be undone.`);
			if (!shouldDelete) return;
		}

		deletingCharacterId = characterId;
		const deleted = await runWithPersistenceFeedback(
			() => removeCharacter(characterId),
			'Could not delete character.',
		);
		if (!deleted) {
			deletingCharacterId = null;
			return;
		}

		const nextRecords = { ...characterRecords };
		delete nextRecords[characterId];
		characterRecords = nextRecords;

		if (typeof window !== 'undefined') {
			const photoStorageKey = `${PHOTO_STORAGE_KEY_PREFIX}:${data.projectId}:${characterId}`;
			window.localStorage.removeItem(photoStorageKey);
		}
		persistCharacterPhotos();

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
	<title>{$translator('worldbuilding.page.individuals.title')}</title>
</svelte:head>

<WorldBuildingWorkspacePage
	projectId={data.projectId}
	topSection="characters"
	activeId="individuals"
	ariaLabel={$translator('worldbuilding.aria.personaeSections')}
	options={characterOptions}
	selectedId={selectedCharacterId}
	onSelect={selectCharacter}
	onCreate={createNewCharacter}
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
				{#if showSaveIndicator}
					<p
						class={`save-indicator ${saveErrorMessage ? 'is-error' : hasPendingSaves ? 'is-saving' : 'is-saved'}`}
						role={saveErrorMessage ? 'alert' : 'status'}
					>
						{#if hasPendingSaves}
							Saving changes...
						{:else if saveErrorMessage}
							{saveErrorMessage}
						{:else}
							All changes saved.
						{/if}
					</p>
				{/if}
				<DestructiveButton
					size="sm"
					onclick={deleteSelectedCharacter}
					disabled={deletingCharacterId === selectedCharacter?.id}
				>
					{deletingCharacterId === selectedCharacter?.id ? 'Deleting…' : 'Delete Character'}
				</DestructiveButton>
			</div>
		</div>
	{/snippet}

	{#snippet empty()}
		<EmptyCharacterState />
	{/snippet}
</WorldBuildingWorkspacePage>

<style>
	.dossier-footer-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.save-indicator {
		margin: 0;
		font-size: var(--text-xs);
	}

	.save-indicator.is-saving {
		color: var(--color-text-muted);
	}

	.save-indicator.is-saved {
		color: var(--color-success-on-dark);
	}

	.save-indicator.is-error {
		color: var(--color-error);
	}
</style>
