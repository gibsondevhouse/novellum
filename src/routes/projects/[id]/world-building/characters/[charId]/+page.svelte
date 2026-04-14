<script lang="ts">
	import type { Character, CharacterRelationship } from '$lib/db/types.js';
	import CharacterForm from '$modules/bible/components/CharacterForm.svelte';
	import RelationshipEditor from '$modules/bible/components/RelationshipEditor.svelte';
	import {
		getCharacterSaving,
		submitUpdateCharacter,
		submitDeleteCharacter,
	} from '$modules/bible/stores/bible-crud.svelte.js';
	import { goto } from '$app/navigation';

	let { data } = $props<{
		data: {
			projectId: string;
			character: Character;
			allCharacters: Character[];
			relationships: CharacterRelationship[];
		};
	}>();

	let confirmDelete = $state(false);
	let saveSuccess = $state(false);

	async function handleSave(
		formData: Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		await submitUpdateCharacter(data.character.id, formData);
		saveSuccess = true;
		setTimeout(() => {
			saveSuccess = false;
		}, 2000);
	}

	async function handleDelete() {
		await submitDeleteCharacter(data.character.id);
		goto(`/projects/${data.projectId}/world-building/characters`);
	}
</script>

<svelte:head>
	<title>{data.character.name} — Novellum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<a class="back-link" href="/projects/{data.projectId}/world-building/characters">← Characters</a
		>
		<div class="header-row">
			<h1>{data.character.name}</h1>
			<div class="header-actions">
				{#if confirmDelete}
					<span class="confirm-text">Delete this character?</span>
					<button class="btn-danger" onclick={handleDelete}>Yes, delete</button>
					<button class="btn-ghost" onclick={() => (confirmDelete = false)}>Cancel</button>
				{:else}
					<button class="btn-ghost" onclick={() => (confirmDelete = true)}>Delete</button>
				{/if}
			</div>
		</div>
	</div>

	{#if saveSuccess}
		<p class="success-text" role="status">Saved successfully.</p>
	{/if}

	<CharacterForm
		character={data.character}
		saving={getCharacterSaving()}
		onSave={handleSave}
		onCancel={() => goto(`/projects/${data.projectId}/world-building/characters`)}
	/>

	<RelationshipEditor
		characterId={data.character.id}
		projectId={data.projectId}
		allCharacters={data.allCharacters}
		initialRelationships={data.relationships}
	/>
</div>

<style>
	.page {
		padding: var(--space-4) 0;
	}

	.page-header {
		margin-bottom: var(--space-4);
	}

	.back-link {
		display: block;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: var(--space-2);
	}

	.back-link:hover {
		color: var(--color-text-secondary);
		text-decoration: none;
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-row h1 {
		margin: 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.confirm-text {
		font-size: var(--text-sm);
		color: var(--color-warning);
	}

	.success-text {
		font-size: var(--text-sm);
		color: var(--color-success);
		margin-bottom: var(--space-3);
	}
</style>
