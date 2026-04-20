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
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

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
		goto(`/projects/${data.projectId}/world-building/characters/individuals`);
	}
</script>

<svelte:head>
	<title>{data.character.name} — Novellum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<Breadcrumb items={[
			{ label: 'Individuals', href: `/projects/${data.projectId}/world-building/characters/individuals` },
			{ label: data.character.name },
		]} />
		<div class="header-row">
			<h1>{data.character.name}</h1>
			<div class="header-actions">
				{#if confirmDelete}
					<span class="confirm-text">Delete this character?</span>
					<button class="btn-danger" onclick={handleDelete}>Yes, delete</button>
					<GhostButton onclick={() => (confirmDelete = false)}>Cancel</GhostButton>
				{:else}
					<GhostButton onclick={() => (confirmDelete = true)}>Delete</GhostButton>
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
		onCancel={() => goto(`/projects/${data.projectId}/world-building/characters/individuals`)}
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
