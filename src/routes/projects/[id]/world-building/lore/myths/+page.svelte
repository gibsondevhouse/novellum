<script lang="ts">
	import { untrack } from 'svelte';
	import type { LoreEntry } from '$lib/db/types.js';
	import MythDossierPane from '$modules/bible/components/MythDossierPane.svelte';
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
	let selectedId = $state<string | null>(
		untrack(() => {
			const myths = data.loreEntries.filter(
				(entry) => entry.category === 'myth' || entry.category.startsWith('myth:'),
			);
			return myths[0]?.id ?? null;
		}),
	);
	let confirmDeleteId: string | null = $state(null);

	function isMythEntry(entry: LoreEntry): boolean {
		return entry.category === 'myth' || entry.category.startsWith('myth:');
	}

	const mythEntries = $derived(getLoreEntries().filter((entry) => isMythEntry(entry)));

	$effect(() => {
		const currentSelection = untrack(() => selectedId);
		if (!currentSelection || !mythEntries.find((entry) => entry.id === currentSelection)) {
			selectedId = mythEntries[0]?.id ?? null;
		}
	});

	const selectedEntry = $derived(
		selectedId ? (mythEntries.find((entry) => entry.id === selectedId) ?? null) : null,
	);
	const options = $derived(
		mythEntries.map((e) => ({
			id: e.id,
			name: e.title,
			subtitle: e.category.replace('myth:', '') || 'myth',
			meta: e.content?.trim() ? 'Entry drafted' : 'No details yet',
		})),
	);

	function selectEntry(id: string) {
		selectedId = id;
		creating = false;
	}

	async function createNewMyth() {
		creating = true;
	}

	async function handleCreate(
		formData: Omit<LoreEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		const created = await submitCreateLoreEntry(data.projectId, formData);
		selectedId = created.id;
		creating = false;
		confirmDeleteId = null;
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
		onCreateCharacter={createNewMyth}
		hasSelection={creating || selectedId !== null}
		listAriaLabel="Myths"
		createLabel="new +"
	>
		{#snippet dossier()}
			{#if creating}
				<MythDossierPane
					entry={null}
					isCreating={true}
					saving={getLoreSaving()}
					showDeleteConfirm={false}
					onSave={handleCreate}
					onCancel={() => (creating = false)}
					onDelete={() => {}}
				/>
			{:else if selectedEntry}
				<MythDossierPane
					entry={selectedEntry}
					saving={getLoreSaving()}
					showDeleteConfirm={confirmDeleteId === selectedEntry.id}
					onSave={handleUpdate}
					onCancel={cancelDelete}
					onDelete={() => handleDeleteAction(selectedEntry.id)}
				/>
			{/if}
		{/snippet}
		{#snippet empty()}
			<div class="myth-empty-state">
				<p>No myths yet. Add belief systems that influence decisions and fear.</p>
				<button class="bible-btn-sm" onclick={createNewMyth}>+ Add first myth</button>
			</div>
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

	.myth-empty-state {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		color: var(--color-text-muted);
	}

	@media (max-width: 768px) {
		.worldbuilding-section-view {
			height: auto;
			overflow: visible;
		}
	}
</style>
