<script lang="ts">
	import type { Arc, Act } from '$lib/db/types.js';
	import { goto } from '$app/navigation';
	import { EmptyStatePanel, GhostButton, SectionHeader } from '$lib/components/ui/index.js';
	import {
		createArc,
		updateArc,
		removeArc,
		reorderArcs,
		getArcsByProjectId,
	} from '../services/arc-repository.js';
	import ArcCard from './ArcCard.svelte';
	import ArcCreateForm from './ArcCreateForm.svelte';

	interface Props {
		projectId: string;
		arcs: Arc[];
		acts: Act[];
	}

	let { projectId, arcs: initialArcs, acts }: Props = $props();

	let arcs = $state<Arc[]>([]);
	let seeded = false;
	$effect(() => {
		if (!seeded) {
			arcs = [...initialArcs];
			seeded = true;
		}
	});
	let showCreate = $state(false);
	let editingArc = $state<Arc | null>(null);
	let busy = $state(false);
	let error = $state<string | null>(null);

	const actCounts = $derived.by(() => {
		const map: Record<string, number> = {};
		for (const act of acts) {
			if (!act.arcId) continue;
			map[act.arcId] = (map[act.arcId] ?? 0) + 1;
		}
		return map;
	});

	async function refresh() {
		arcs = await getArcsByProjectId(projectId);
	}

	async function handleCreate(data: { title: string; purpose: string; description: string }) {
		busy = true;
		error = null;
		try {
			await createArc({
				projectId,
				title: data.title,
				purpose: data.purpose,
				description: data.description,
				order: arcs.length,
			});
			await refresh();
			showCreate = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create arc.';
		} finally {
			busy = false;
		}
	}

	async function handleEdit(data: { title: string; purpose: string; description: string }) {
		if (!editingArc) return;
		busy = true;
		error = null;
		try {
			await updateArc(editingArc.id, {
				title: data.title,
				purpose: data.purpose,
				description: data.description,
			});
			await refresh();
			editingArc = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save changes.';
		} finally {
			busy = false;
		}
	}

	async function handleDelete(arc: Arc) {
		if (
			!confirm(
				`Delete arc "${arc.title || 'Untitled arc'}"? Acts under this arc will move to Unassigned.`,
			)
		) {
			return;
		}
		busy = true;
		try {
			await removeArc(arc.id);
			await refresh();
		} finally {
			busy = false;
		}
	}

	async function moveArc(arc: Arc, direction: -1 | 1) {
		const index = arcs.findIndex((a) => a.id === arc.id);
		const target = index + direction;
		if (index === -1 || target < 0 || target >= arcs.length) return;
		const nextOrder = [...arcs];
		[nextOrder[index], nextOrder[target]] = [nextOrder[target], nextOrder[index]];
		const previous = arcs;
		arcs = nextOrder;
		try {
			await reorderArcs(
				projectId,
				nextOrder.map((a) => a.id),
			);
		} catch {
			arcs = previous;
		}
	}

	function openArc(arc: Arc) {
		goto(`/projects/${projectId}/arcs/${arc.id}`);
	}
</script>

<section class="arcs-list" aria-label="Story arcs">
	<SectionHeader title="Story arcs" description="The major arcs that drive your story.">
		{#snippet actions()}
			<GhostButton type="button" onclick={() => (showCreate = !showCreate)} disabled={busy}>
				{showCreate ? 'Close' : 'New arc'}
			</GhostButton>
		{/snippet}
	</SectionHeader>

	{#if showCreate}
		<ArcCreateForm
			mode="create"
			{busy}
			{error}
			onSubmit={handleCreate}
			onCancel={() => (showCreate = false)}
		/>
	{/if}

	{#if editingArc}
		<ArcCreateForm
			mode="edit"
			initial={editingArc}
			{busy}
			{error}
			onSubmit={handleEdit}
			onCancel={() => (editingArc = null)}
		/>
	{/if}

	{#if arcs.length === 0}
		<EmptyStatePanel
			title="No arcs yet"
			description="Arcs are the throughlines that hold your story together. Create one to start mapping acts and chapters under it."
		>
			{#snippet actions()}
				<GhostButton type="button" onclick={() => (showCreate = true)}>Create your first arc</GhostButton>
			{/snippet}
		</EmptyStatePanel>
	{:else}
		<ul class="arcs-grid">
			{#each arcs as arc, idx (arc.id)}
				<li>
					<ArcCard
						{arc}
						actCount={actCounts[arc.id] ?? 0}
						canMoveUp={idx > 0}
						canMoveDown={idx < arcs.length - 1}
						onOpen={openArc}
						onEdit={(a) => (editingArc = a)}
						onDelete={handleDelete}
						onMoveUp={(a) => moveArc(a, -1)}
						onMoveDown={(a) => moveArc(a, 1)}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.arcs-list {
		display: grid;
		gap: var(--space-4);
	}

	.arcs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--space-4);
		list-style: none;
		padding: 0;
		margin: 0;
	}
</style>
