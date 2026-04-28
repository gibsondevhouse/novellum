<script lang="ts">
	import { untrack } from 'svelte';
	import type { LoreEntry } from '$lib/db/domain-types';
	import { translator } from '$lib/i18n';
	import MythDossierPane from '$modules/bible/components/MythDossierPane.svelte';
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
	<title>{$translator('worldbuilding.page.myths.title')}</title>
</svelte:head>

<WorldBuildingWorkspacePage
	projectId={data.projectId}
	topSection="lore"
	activeId="myths"
	ariaLabel={$translator('worldbuilding.aria.archiveSections')}
	{options}
	{selectedId}
	onSelect={selectEntry}
	onCreate={createNewMyth}
	hasSelection={creating || selectedId !== null}
	listAriaLabel={$translator('worldbuilding.list.myths')}
	createLabel={$translator('worldbuilding.workspace.common.createLabel')}
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
		<WorldBuildingWorkspaceEmptyState
			title={$translator('worldbuilding.workspace.myths.emptyTitle')}
			description={$translator('worldbuilding.workspace.myths.emptyDescription')}
			actionLabel={$translator('worldbuilding.workspace.common.firstMyth')}
			onAction={createNewMyth}
		/>
	{/snippet}
</WorldBuildingWorkspacePage>
