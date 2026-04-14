<script lang="ts">
	import type { Character } from '$lib/db/types.js';
	import CharacterCard from '$modules/bible/components/CharacterCard.svelte';
	import CharacterForm from '$modules/bible/components/CharacterForm.svelte';
	import {
		getCharacters,
		getCharacterSaving,
		initCharacters,
		submitCreateCharacter,
		submitDeleteCharacter,
	} from '$modules/bible/stores/bible-crud.svelte.js';
	import { goto } from '$app/navigation';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let { data } = $props<{
		data: { projectId: string; characters: Character[] };
	}>();

	$effect(() => {
		initCharacters(data.characters);
	});

	let showForm = $state(false);

	async function handleCreate(
		formData: Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		await submitCreateCharacter(data.projectId, formData);
		showForm = false;
	}

	async function handleDelete(id: string) {
		await submitDeleteCharacter(id);
	}

	function handleEdit(character: Character) {
		goto(`/projects/${data.projectId}/world-building/characters/${character.id}`);
	}
</script>

<svelte:head>
	<title>Characters — Novellum</title>
</svelte:head>

<div class="bible-page">
	<div class="bible-page-header">
		<div>
			<a class="bible-back-link" href="/projects/{data.projectId}/world-building"
				>← World Building</a
			>
			<h1>Characters</h1>
		</div>
		<PrimaryButton onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : '+ Add Character'}
		</PrimaryButton>
	</div>

	{#if showForm}
		<div class="bible-form-section">
			<CharacterForm
				saving={getCharacterSaving()}
				onSave={handleCreate}
				onCancel={() => (showForm = false)}
			/>
		</div>
	{/if}

	{#if getCharacters().length === 0 && !showForm}
		<div class="bible-empty-state">
			<p>No characters yet.</p>
			<GhostButton onclick={() => (showForm = true)}>+ Add your first character</GhostButton>
		</div>
	{:else}
		<ul class="bible-entity-list">
			{#each getCharacters() as char (char.id)}
				<CharacterCard character={char} onEdit={handleEdit} onDelete={handleDelete} />
			{/each}
		</ul>
	{/if}
</div>
