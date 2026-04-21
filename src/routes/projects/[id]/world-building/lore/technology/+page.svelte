<script lang="ts">
	import { untrack } from 'svelte';
	import type { LoreEntry } from '$lib/db/types.js';
	import TechnologyDossierPane from '$modules/bible/components/TechnologyDossierPane.svelte';
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
			const technologies = data.loreEntries.filter(
				(entry) => entry.category === 'technology' || entry.category.startsWith('technology:'),
			);
			return technologies[0]?.id ?? null;
		}),
	);
	let confirmDeleteId: string | null = $state(null);

	function isTechnologyEntry(entry: LoreEntry): boolean {
		return entry.category === 'technology' || entry.category.startsWith('technology:');
	}

	const technologyEntries = $derived(
		getLoreEntries().filter((entry) => isTechnologyEntry(entry)),
	);

	$effect(() => {
		const currentSelection = untrack(() => selectedId);
		if (!currentSelection || !technologyEntries.find((entry) => entry.id === currentSelection)) {
			selectedId = technologyEntries[0]?.id ?? null;
		}
	});

	const selectedEntry = $derived(
		selectedId
			? (technologyEntries.find((entry) => entry.id === selectedId) ?? null)
			: null,
	);

	const options = $derived(
		technologyEntries.map((entry) => ({
			id: entry.id,
			name: entry.title,
			subtitle: entry.category.replace('technology:', '') || 'technology',
			meta: entry.content?.trim() ? 'System drafted' : 'No details yet',
		})),
	);

	function selectEntry(id: string) {
		selectedId = id;
		creating = false;
	}

	async function createNewTechnology() {
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
	<title>Technology — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav
		projectId={data.projectId}
		topSection="lore"
		activeId="technology"
		ariaLabel="Archive sections"
	/>
	<IndividualsWorkspaceShell
		characterOptions={options}
		selectedCharacterId={selectedId}
		onSelectCharacter={selectEntry}
		onCreateCharacter={createNewTechnology}
		hasSelection={creating || selectedId !== null}
		listAriaLabel="Technology"
		createLabel="new +"
	>
		{#snippet dossier()}
			{#if creating}
				<TechnologyDossierPane
					entry={null}
					isCreating={true}
					saving={getLoreSaving()}
					showDeleteConfirm={false}
					onSave={handleCreate}
					onCancel={() => (creating = false)}
					onDelete={() => {}}
				/>
			{:else if selectedEntry}
				<TechnologyDossierPane
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
			<div class="technology-empty-state">
				<p>No technology systems yet. Add capabilities with limitations and consequences.</p>
				<button class="bible-btn-sm" onclick={createNewTechnology}>+ Add first technology</button>
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

	.technology-empty-state {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		color: var(--color-text-muted);
		text-align: center;
	}

	@media (max-width: 768px) {
		.worldbuilding-section-view {
			height: auto;
			overflow: visible;
		}
	}
</style>
