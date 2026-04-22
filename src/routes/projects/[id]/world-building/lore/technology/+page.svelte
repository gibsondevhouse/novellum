<script lang="ts">
	import { untrack } from 'svelte';
	import type { LoreEntry } from '$lib/db/types.js';
	import { translator } from '$lib/i18n';
	import TechnologyDossierPane from '$modules/bible/components/TechnologyDossierPane.svelte';
	import WorldBuildingWorkspaceEmptyState from '$modules/bible/components/WorldBuildingWorkspaceEmptyState.svelte';
	import WorldBuildingWorkspacePage from '$modules/bible/components/WorldBuildingWorkspacePage.svelte';
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

	const technologyEntries = $derived(getLoreEntries().filter((entry) => isTechnologyEntry(entry)));

	$effect(() => {
		const currentSelection = untrack(() => selectedId);
		if (!currentSelection || !technologyEntries.find((entry) => entry.id === currentSelection)) {
			selectedId = technologyEntries[0]?.id ?? null;
		}
	});

	const selectedEntry = $derived(
		selectedId ? (technologyEntries.find((entry) => entry.id === selectedId) ?? null) : null,
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
	<title>{$translator('worldbuilding.page.technology.title')}</title>
</svelte:head>

<WorldBuildingWorkspacePage
	projectId={data.projectId}
	topSection="lore"
	activeId="technology"
	ariaLabel={$translator('worldbuilding.aria.archiveSections')}
	{options}
	{selectedId}
	onSelect={selectEntry}
	onCreate={createNewTechnology}
	hasSelection={creating || selectedId !== null}
	listAriaLabel={$translator('worldbuilding.list.technology')}
	createLabel={$translator('worldbuilding.workspace.common.createLabel')}
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
		<WorldBuildingWorkspaceEmptyState
			title={$translator('worldbuilding.workspace.technology.emptyTitle')}
			description={$translator('worldbuilding.workspace.technology.emptyDescription')}
			actionLabel={$translator('worldbuilding.workspace.common.firstTechnology')}
			onAction={createNewTechnology}
		/>
	{/snippet}
</WorldBuildingWorkspacePage>
