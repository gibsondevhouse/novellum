<script lang="ts">
	import type { TimelineEvent, Character } from '$lib/db/domain-types';
	import { translator } from '$lib/i18n';
	import { DestructiveButton, GhostButton } from '$lib/components/ui/index.js';
	import ChronicleSystemForm from '$modules/world-building/components/ChronicleSystemForm.svelte';
	import WorldBuildingWorkspaceEmptyState from '$modules/world-building/components/WorldBuildingWorkspaceEmptyState.svelte';
	import WorldBuildingWorkspacePage from '$modules/world-building/components/WorldBuildingWorkspacePage.svelte';
	import {
		chronicleMeta,
		chronicleSubtitle,
		isChronicleKind,
		parseChroniclePayload,
	} from '$modules/world-building/chronicle-systems.js';
	import {
		getTimelineEvents,
		getTimelineSaving,
		initTimelineEvents,
		submitCreateTimelineEvent,
		submitUpdateTimelineEvent,
		submitDeleteTimelineEvent,
	} from '$modules/world-building/stores/world-building-crud.svelte.js';

	let {
		data,
	}: { data: { projectId: string; timelineEvents: TimelineEvent[]; characters: Character[] } } =
		$props();

	$effect(() => {
		initTimelineEvents(data.timelineEvents);
	});

	let creating = $state(false);
	let selectedId: string | null = $state(null);
	let confirmDeleteId: string | null = $state(null);

	const sorted = $derived(
		[...getTimelineEvents()]
			.filter((e) => isChronicleKind(e, 'key-event'))
			.sort((a, b) => a.date.localeCompare(b.date)),
	);
	const selectedEvent = $derived(
		selectedId ? (sorted.find((e) => e.id === selectedId) ?? null) : null,
	);
	const options = $derived(
		sorted.map((e) => ({
			id: e.id,
			name: e.title,
			subtitle: chronicleSubtitle(e),
			meta: chronicleMeta(e),
		})),
	);
	const selectedTitle = $derived.by(() => {
		if (!selectedEvent) return '';
		const payload = parseChroniclePayload(selectedEvent);
		if (payload?.kind === 'key-event') return payload.title || selectedEvent.title;
		return selectedEvent.title;
	});

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
	<title>{$translator('worldbuilding.page.key-events.title')}</title>
</svelte:head>

<WorldBuildingWorkspacePage
	projectId={data.projectId}
	topSection="timeline"
	activeId="key-events"
	ariaLabel={$translator('worldbuilding.aria.chroniclesSections')}
	{options}
	{selectedId}
	onSelect={selectEvent}
	onCreate={() => {
		creating = true;
		selectedId = null;
	}}
	hasSelection={creating || selectedId !== null}
	listAriaLabel={$translator('worldbuilding.list.keyEvents')}
	createLabel={$translator('worldbuilding.workspace.common.createLabel')}
>
	{#snippet dossier()}
		{#if creating}
			<div class="entity-dossier">
				<h2 class="dossier-title">New Key Event</h2>
				<ChronicleSystemForm
					kind="key-event"
					characters={data.characters}
					saving={getTimelineSaving()}
					onSave={handleCreate}
					onCancel={() => (creating = false)}
				/>
			</div>
		{:else if selectedEvent}
			<div class="entity-dossier">
				<div class="dossier-header">
					<h2 class="dossier-title">{selectedTitle}</h2>
					{#if confirmDeleteId === selectedEvent.id}
						<DestructiveButton size="sm" onclick={() => handleDelete(selectedEvent.id)}
							>Confirm</DestructiveButton
						>
						<GhostButton size="sm" onclick={() => (confirmDeleteId = null)}>Cancel</GhostButton>
					{:else}
						<DestructiveButton size="sm" onclick={() => (confirmDeleteId = selectedEvent.id)}
							>Delete</DestructiveButton
						>
					{/if}
				</div>
				<ChronicleSystemForm
					kind="key-event"
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
		<WorldBuildingWorkspaceEmptyState
			title={$translator('worldbuilding.workspace.keyEvents.emptyTitle')}
			description={$translator('worldbuilding.workspace.keyEvents.emptyDescription')}
			actionLabel={$translator('worldbuilding.workspace.common.firstKeyEvent')}
			onAction={() => {
				creating = true;
			}}
		/>
	{/snippet}
</WorldBuildingWorkspacePage>

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
</style>

