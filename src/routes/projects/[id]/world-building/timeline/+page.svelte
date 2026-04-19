<script lang="ts">
	import type { TimelineEvent, Character } from '$lib/db/types.js';
	import TimelineEventForm from '$modules/bible/components/TimelineEventForm.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import {
		getTimelineEvents,
		getTimelineSaving,
		initTimelineEvents,
		submitCreateTimelineEvent,
		submitUpdateTimelineEvent,
		submitDeleteTimelineEvent,
	} from '$modules/bible/stores/bible-crud.svelte.js';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let { data }: { data: { projectId: string; timelineEvents: TimelineEvent[]; characters: Character[] } } =
		$props();

	$effect(() => {
		initTimelineEvents(data.timelineEvents);
	});

	let showForm = $state(false);
	let editingEvent: TimelineEvent | null = $state(null);
	let confirmDeleteId: string | null = $state(null);

	const sorted = $derived([...getTimelineEvents()].sort((a, b) => a.date.localeCompare(b.date)));

	async function handleCreate(
		formData: Omit<TimelineEvent, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		await submitCreateTimelineEvent(data.projectId, formData);
		showForm = false;
	}

	async function handleUpdate(
		formData: Omit<TimelineEvent, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!editingEvent) return;
		await submitUpdateTimelineEvent(editingEvent.id, formData);
		editingEvent = null;
	}

	async function handleDelete(id: string) {
		await submitDeleteTimelineEvent(id);
		confirmDeleteId = null;
	}

	function getCharName(id: string): string {
		return data.characters.find((c: Character) => c.id === id)?.name ?? id;
	}
</script>

<svelte:head>
	<title>Eras — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav projectId={data.projectId} topSection="timeline" activeId="eras" ariaLabel="Chronicles sections" />

	<div class="bible-page">
		<div class="bible-page-header">
			<div>
				<a class="bible-back-link" href="/projects/{data.projectId}/world-building/timeline"
					>← Chronicles</a
				>
				<h1>Eras</h1>
			</div>
			<PrimaryButton
				onclick={() => {
					showForm = !showForm;
					editingEvent = null;
				}}
			>
				{showForm && !editingEvent ? 'Cancel' : '+ Add Era Event'}
			</PrimaryButton>
		</div>

		{#if showForm || editingEvent}
		<div class="bible-form-section">
			<TimelineEventForm
				event={editingEvent ?? undefined}
				characters={data.characters}
				saving={getTimelineSaving()}
				onSave={editingEvent ? handleUpdate : handleCreate}
				onCancel={() => {
					showForm = false;
					editingEvent = null;
				}}
			/>
		</div>
		{/if}

		{#if getTimelineEvents().length === 0 && !showForm}
		<div class="bible-empty-state">
			<p>No era events yet.</p>
			<GhostButton onclick={() => (showForm = true)}>+ Add your first era event</GhostButton>
		</div>
		{:else}
		<ol class="timeline-list">
			{#each sorted as event (event.id)}
				<li class="timeline-item">
					<div class="item-dot"></div>
					<div class="item-body">
						{#if event.date}
							<span class="event-date">{event.date}</span>
						{/if}
						<span class="event-title">{event.title}</span>
						{#if event.relatedCharacterIds.length > 0}
							<span class="event-chars"
								>{event.relatedCharacterIds.map(getCharName).join(', ')}</span
							>
						{/if}
					</div>
					<div class="item-actions">
						<button
							class="bible-btn-sm"
							onclick={() => {
								editingEvent = event;
								showForm = false;
							}}>Edit</button
						>
						{#if confirmDeleteId === event.id}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => handleDelete(event.id)}
								>Yes</button
							>
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = null)}>No</button>
						{:else}
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = event.id)}
								>Delete</button
							>
						{/if}
					</div>
				</li>
			{/each}
		</ol>
		{/if}
	</div>
</div>
