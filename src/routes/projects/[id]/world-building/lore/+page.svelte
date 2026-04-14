<script lang="ts">
	import type { LoreEntry } from '$lib/db/types.js';
	import LoreEntryForm from '$modules/bible/components/LoreEntryForm.svelte';
	import {
		getLoreEntries,
		getLoreSaving,
		initLoreEntries,
		submitCreateLoreEntry,
		submitUpdateLoreEntry,
		submitDeleteLoreEntry,
	} from '$modules/bible/stores/bible-crud.svelte.js';

	let { data } = $props<{ data: { projectId: string; loreEntries: LoreEntry[] } }>();

	$effect(() => {
		initLoreEntries(data.loreEntries);
	});

	let showForm = $state(false);
	let editingEntry: LoreEntry | null = $state(null);
	let confirmDeleteId: string | null = $state(null);
	let activeCategory = $state('');

	const categories = $derived([
		...new Set(
			getLoreEntries()
				.map((e) => e.category)
				.filter(Boolean),
		),
	]);
	const filtered = $derived(
		activeCategory
			? getLoreEntries().filter((e) => e.category === activeCategory)
			: getLoreEntries(),
	);

	async function handleCreate(
		formData: Omit<LoreEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		await submitCreateLoreEntry(data.projectId, formData);
		showForm = false;
	}
	async function handleUpdate(
		formData: Omit<LoreEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!editingEntry) return;
		await submitUpdateLoreEntry(editingEntry.id, formData);
		editingEntry = null;
	}
	async function handleDelete(id: string) {
		await submitDeleteLoreEntry(id);
		confirmDeleteId = null;
	}
</script>

<svelte:head><title>Lore — Novellum</title></svelte:head>

<div class="bible-page">
	<div class="bible-page-header">
		<div>
			<a class="bible-back-link" href="/projects/{data.projectId}/world-building"
				>← World Building</a
			>
			<h1>Lore</h1>
		</div>
		<button
			class="btn-primary"
			onclick={() => {
				showForm = !showForm;
				editingEntry = null;
			}}
		>
			{showForm && !editingEntry ? 'Cancel' : '+ Add Entry'}
		</button>
	</div>

	{#if showForm || editingEntry}
		<div class="bible-form-section">
			<LoreEntryForm
				entry={editingEntry ?? undefined}
				saving={getLoreSaving()}
				onSave={editingEntry ? handleUpdate : handleCreate}
				onCancel={() => {
					showForm = false;
					editingEntry = null;
				}}
			/>
		</div>
	{/if}

	{#if categories.length > 0}
		<div class="filter-bar" role="group" aria-label="Filter by category">
			<button class="pill" class:active={!activeCategory} onclick={() => (activeCategory = '')}
				>All</button
			>
			{#each categories as cat (cat)}
				<button
					class="pill"
					class:active={activeCategory === cat}
					onclick={() => (activeCategory = cat)}>{cat}</button
				>
			{/each}
		</div>
	{/if}

	{#if getLoreEntries().length === 0 && !showForm}
		<div class="bible-empty-state">
			<p>No lore entries yet.</p>
			<button class="btn-ghost" onclick={() => (showForm = true)}>+ Add your first entry</button>
		</div>
	{:else if filtered.length === 0}
		<p class="empty-filter">No entries in this category.</p>
	{:else}
		<ul class="bible-entity-list">
			{#each filtered as entry (entry.id)}
				<li class="bible-entity-item">
					<div class="bible-item-body">
						<span class="bible-item-name">{entry.title}</span>
						<span class="item-category">{entry.category}</span>
					</div>
					<div class="bible-item-actions">
						<button
							class="bible-btn-sm"
							onclick={() => {
								editingEntry = entry;
								showForm = false;
							}}>Edit</button
						>
						{#if confirmDeleteId === entry.id}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => handleDelete(entry.id)}
								>Yes</button
							>
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = null)}>No</button>
						{:else}
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = entry.id)}
								>Delete</button
							>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
