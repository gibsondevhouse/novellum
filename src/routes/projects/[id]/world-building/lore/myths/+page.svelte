<script lang="ts">
	import type { LoreEntry } from '$lib/db/types.js';
	import LoreEntryForm from '$modules/bible/components/LoreEntryForm.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import IndividualsWorkspaceShell from '$modules/bible/components/IndividualsWorkspaceShell.svelte';
	import {
		getLoreEntries,
		getLoreSaving,
		initLoreEntries,
		submitCreateLoreEntry,
		submitUpdateLoreEntry,
		submitDeleteLoreEntry,
	} from '$modules/bible/stores/bible-crud.svelte.js';

	let { data }: { data: { projectId: string; loreEntries: LoreEntry[] } } = $props();

	$effect(() => {
		initLoreEntries(data.loreEntries);
	});

	let creating = $state(false);
	let selectedId: string | null = $state(null);
	let confirmDeleteId: string | null = $state(null);

	const selectedEntry = $derived(
		selectedId ? (getLoreEntries().find((e) => e.id === selectedId) ?? null) : null,
	);
	const options = $derived(getLoreEntries().map((e) => ({ id: e.id, name: e.title })));

	function selectEntry(id: string) {
		selectedId = id;
		creating = false;
	}

	async function handleCreate(
		formData: Omit<LoreEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		await submitCreateLoreEntry(data.projectId, formData);
		creating = false;
	}

	async function handleUpdate(
		formData: Omit<LoreEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!selectedEntry) return;
		await submitUpdateLoreEntry(selectedEntry.id, formData);
	}

	async function handleDelete(id: string) {
		await submitDeleteLoreEntry(id);
		confirmDeleteId = null;
		selectedId = null;
	}
</script>

<svelte:head>
	<title>Myths — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav
		projectId={data.projectId}
		topSection="lore"
		activeId="myths"
		ariaLabel="Archive sections"
	/>

	<IndividualsWorkspaceShell
		characterOptions={options}
		selectedCharacterId={selectedId}
		onSelectCharacter={selectEntry}
		onCreateCharacter={() => {
			creating = true;
			selectedId = null;
		}}
		hasSelection={creating || selectedId !== null}
		listAriaLabel="Myths"
		createLabel="new +"
	>
		{#snippet dossier()}
			{#if creating}
				<div class="entity-dossier">
					<h2 class="dossier-title">New Myth Entry</h2>
					<LoreEntryForm
						saving={getLoreSaving()}
						onSave={handleCreate}
						onCancel={() => (creating = false)}
					/>
				</div>
			{:else if selectedEntry}
				<div class="entity-dossier">
					<div class="dossier-header">
						<h2 class="dossier-title">{selectedEntry.title}</h2>
						{#if confirmDeleteId === selectedEntry.id}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => handleDelete(selectedEntry.id)}>Confirm</button>
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = null)}>Cancel</button>
						{:else}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => (confirmDeleteId = selectedEntry.id)}>Delete</button>
						{/if}
					</div>
					<LoreEntryForm
						entry={selectedEntry}
						saving={getLoreSaving()}
						onSave={handleUpdate}
						onCancel={() => (selectedId = null)}
					/>
				</div>
			{/if}
		{/snippet}
		{#snippet empty()}
			<div class="entity-empty">
				<p>No myth entries yet.</p>
				<button class="bible-btn-sm" onclick={() => (creating = true)}>+ Add your first entry</button>
			</div>
		{/snippet}
	</IndividualsWorkspaceShell>
</div>

<style>
	.entity-dossier {
		padding: var(--space-6);
		overflow-y: auto;
	}

	.dossier-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.dossier-title {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
	}

	.entity-empty {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		color: var(--color-text-muted);
	}
</style>
