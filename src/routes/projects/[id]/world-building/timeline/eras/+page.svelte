<script lang="ts">
	import type { TimelineEvent, Character } from '$lib/db/types.js';
	import TimelineEventForm from '$modules/bible/components/TimelineEventForm.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import IndividualsWorkspaceShell from '$modules/bible/components/IndividualsWorkspaceShell.svelte';
	import {
		getTimelineEvents,
		getTimelineSaving,
		initTimelineEvents,
		submitCreateTimelineEvent,
		submitUpdateTimelineEvent,
		submitDeleteTimelineEvent,
	} from '$modules/bible/stores/bible-crud.svelte.js';

	let { data }: { data: { projectId: string; timelineEvents: TimelineEvent[]; characters: Character[] } } =
		$props();

	$effect(() => {
		initTimelineEvents(data.timelineEvents);
	});

	let creating = $state(false);
	let selectedId: string | null = $state(null);
	let confirmDeleteId: string | null = $state(null);

	const sorted = $derived([...getTimelineEvents()].sort((a, b) => a.date.localeCompare(b.date)));
	const selectedEvent = $derived(
		selectedId ? (sorted.find((e) => e.id === selectedId) ?? null) : null,
	);
	const options = $derived(
		sorted.map((e) => ({
			id: e.id,
			name: e.title,
			subtitle: e.date?.trim() || 'Date pending',
			meta: e.description?.trim() ? 'Context drafted' : 'No context yet',
		})),
	);

	function selectEvent(id: string) {
		selectedId = id;
		creating = false;
	}

	async function handleCreate(
		formData: Omit<TimelineEvent, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		await submitCreateTimelineEvent(data.projectId, formData);
		creating = false;
	}

	async function handleUpdate(
		formData: Omit<TimelineEvent, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!selectedEvent) return;
		await submitUpdateTimelineEvent(selectedEvent.id, formData);
	}

	async function handleDelete(id: string) {
		await submitDeleteTimelineEvent(id);
		confirmDeleteId = null;
		selectedId = null;
	}
</script>

<svelte:head>
	<title>Eras — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav
		projectId={data.projectId}
		topSection="timeline"
		activeId="eras"
		ariaLabel="Chronicles sections"
	/>

	<IndividualsWorkspaceShell
		characterOptions={options}
		selectedCharacterId={selectedId}
		onSelectCharacter={selectEvent}
		onCreateCharacter={() => {
			creating = true;
			selectedId = null;
		}}
		hasSelection={creating || selectedId !== null}
		listAriaLabel="Eras"
		createLabel="new +"
	>
		{#snippet dossier()}
			{#if creating}
				<div class="entity-dossier">
					<h2 class="dossier-title">New Era Event</h2>
					<TimelineEventForm
						characters={data.characters}
						saving={getTimelineSaving()}
						onSave={handleCreate}
						onCancel={() => (creating = false)}
					/>
				</div>
			{:else if selectedEvent}
				<div class="entity-dossier">
					<div class="dossier-header">
						<h2 class="dossier-title">{selectedEvent.title}</h2>
						{#if confirmDeleteId === selectedEvent.id}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => handleDelete(selectedEvent.id)}>Confirm</button>
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = null)}>Cancel</button>
						{:else}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => (confirmDeleteId = selectedEvent.id)}>Delete</button>
						{/if}
					</div>
					<TimelineEventForm
						event={selectedEvent}
						characters={data.characters}
						saving={getTimelineSaving()}
						onSave={handleUpdate}
						onCancel={() => (selectedId = null)}
					/>
				</div>
			{/if}
		{/snippet}
		{#snippet empty()}
			<div class="entity-empty">
				<p>No era events yet.</p>
				<button class="bible-btn-sm" onclick={() => (creating = true)}>+ Add your first era event</button>
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
