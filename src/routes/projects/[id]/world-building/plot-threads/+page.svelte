<script lang="ts">
	import type { PlotThread, Scene } from '$lib/db/types.js';
	import PlotThreadForm from '$modules/bible/components/PlotThreadForm.svelte';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import {
		getPlotThreads,
		getPlotThreadSaving,
		initPlotThreads,
		submitCreatePlotThread,
		submitUpdatePlotThread,
		submitDeletePlotThread,
	} from '$modules/bible/stores/bible-crud.svelte.js';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let { data }: { data: { projectId: string; plotThreads: PlotThread[]; scenes: Scene[] } } =
		$props();

	$effect(() => {
		initPlotThreads(data.plotThreads);
	});

	let showForm = $state(false);
	let editingThread: PlotThread | null = $state(null);
	let confirmDeleteId: string | null = $state(null);

	const STATUS_COLORS: Record<string, string> = {
		open: 'var(--color-nova-blue)',
		'in-progress': 'var(--color-warning)',
		resolved: 'var(--color-success)',
	};

	async function handleCreate(
		formData: Omit<PlotThread, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		await submitCreatePlotThread(data.projectId, formData);
		showForm = false;
	}

	async function handleUpdate(
		formData: Omit<PlotThread, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!editingThread) return;
		await submitUpdatePlotThread(editingThread.id, formData);
		editingThread = null;
	}

	async function handleStatusChange(thread: PlotThread, newStatus: string) {
		await submitUpdatePlotThread(thread.id, { status: newStatus });
	}

	async function handleDelete(id: string) {
		await submitDeletePlotThread(id);
		confirmDeleteId = null;
	}

	const STATUS_OPTIONS = ['open', 'in-progress', 'resolved'];
</script>

<svelte:head>
	<title>Major Arcs — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav projectId={data.projectId} topSection="plot-threads" activeId="major-arcs" ariaLabel="Threads sections" />

	<div class="bible-page">
		<div class="bible-page-header">
			<div>
				<a class="bible-back-link" href="/projects/{data.projectId}/world-building/plot-threads"
					>← Threads</a
				>
				<h1>Major Arcs</h1>
			</div>
			<PrimaryButton
				onclick={() => {
					showForm = !showForm;
					editingThread = null;
				}}
			>
				{showForm && !editingThread ? 'Cancel' : '+ Add Arc'}
			</PrimaryButton>
		</div>

		{#if showForm || editingThread}
		<div class="bible-form-section">
			<PlotThreadForm
				thread={editingThread ?? undefined}
				scenes={data.scenes}
				saving={getPlotThreadSaving()}
				onSave={editingThread ? handleUpdate : handleCreate}
				onCancel={() => {
					showForm = false;
					editingThread = null;
				}}
			/>
		</div>
		{/if}

		{#if getPlotThreads().length === 0 && !showForm}
		<div class="bible-empty-state">
			<p>No major arcs yet.</p>
			<GhostButton onclick={() => (showForm = true)}>+ Add your first arc</GhostButton>
		</div>
		{:else}
		<ul class="bible-entity-list">
			{#each getPlotThreads() as thread (thread.id)}
				<li class="bible-entity-item">
					<div class="bible-item-body">
						<span class="bible-item-name">{thread.title}</span>
						<div class="status-row">
							<select
								class="status-select"
								value={thread.status}
								style="color: {STATUS_COLORS[thread.status] ?? 'inherit'}"
								onchange={(e) =>
									handleStatusChange(thread, (e.currentTarget as HTMLSelectElement).value)}
							>
								{#each STATUS_OPTIONS as s (s)}
									<option value={s}>{s}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="bible-item-actions">
						<button
							class="bible-btn-sm"
							onclick={() => {
								editingThread = thread;
								showForm = false;
							}}>Edit</button
						>
						{#if confirmDeleteId === thread.id}
							<button class="bible-btn-sm bible-btn-danger" onclick={() => handleDelete(thread.id)}
								>Yes</button
							>
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = null)}>No</button>
						{:else}
							<button class="bible-btn-sm" onclick={() => (confirmDeleteId = thread.id)}
								>Delete</button
							>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
		{/if}
	</div>
</div>
