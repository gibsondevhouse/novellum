<script lang="ts">
	import type { TimelineEvent, Character } from '$lib/db/types.js';
	import TimelineEventForm from '$modules/bible/components/TimelineEventForm.svelte';
	import {
		getTimelineEvents,
		getTimelineSaving,
		initTimelineEvents,
		submitCreateTimelineEvent,
		submitUpdateTimelineEvent,
		submitDeleteTimelineEvent,
	} from '$modules/bible/stores/bible-crud.svelte.js';

	let { data } = $props<{
		data: { projectId: string; timelineEvents: TimelineEvent[]; characters: Character[] };
	}>();

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
	<title>Timeline — Novellum</title>
</svelte:head>

<div class="bible-page">
	<div class="bible-page-header">
		<div>
			<a class="bible-back-link" href="/projects/{data.projectId}/bible">← Story Bible</a>
			<h1>Timeline</h1>
		</div>
		<button
			class="btn-primary"
			onclick={() => {
				showForm = !showForm;
				editingEvent = null;
			}}
		>
			{showForm && !editingEvent ? 'Cancel' : '+ Add Event'}
		</button>
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
			<p>No timeline events yet.</p>
			<button class="btn-ghost" onclick={() => (showForm = true)}
				>+ Add your first event</button
			>
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

