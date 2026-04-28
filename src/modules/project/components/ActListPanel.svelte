<script lang="ts">
	import type { Act } from '$lib/db/domain-types';
	import { goto } from '$app/navigation';
	import { EmptyStatePanel, GhostButton, SectionHeader } from '$lib/components/ui/index.js';
	import {
		createAct,
		updateAct,
		removeAct,
		reorderActs,
		getActsByProjectId,
	} from '../services/act-repository.js';
	import { selectChaptersForAct } from '../stores/hierarchy-store.svelte.js';
	import type { Chapter } from '$lib/db/domain-types';
	import ActCard from './ActCard.svelte';
	import ActCreateForm from './ActCreateForm.svelte';

	interface Props {
		projectId: string;
		arcId: string | null;
		acts: Act[];
		chapters: Chapter[];
	}

	let { projectId, arcId, acts: initialActs, chapters }: Props = $props();

	let acts = $state<Act[]>([]);
	let seeded = false;
	$effect(() => {
		if (!seeded) {
			acts = [...initialActs];
			seeded = true;
		}
	});

	let showCreate = $state(false);
	let editingAct = $state<Act | null>(null);
	let busy = $state(false);
	let error = $state<string | null>(null);

	const chapterCounts = $derived.by(() => {
		const map: Record<string, number> = {};
		for (const ch of chapters) {
			if (!ch.actId) continue;
			map[ch.actId] = (map[ch.actId] ?? 0) + 1;
		}
		return map;
	});

	const sectionTitle = $derived(arcId === null ? 'Unassigned acts' : 'Acts in this arc');
	const sectionDescription = $derived(
		arcId === null
			? 'Acts not yet assigned to any arc. Move them into an arc to give them throughline context.'
			: 'Sequenced acts that belong to this arc.',
	);

	async function refreshAll() {
		const all = await getActsByProjectId(projectId);
		// Filter to scope using the same semantics as the store helper.
		acts = arcId === null ? all.filter((a) => !a.arcId) : all.filter((a) => a.arcId === arcId);
	}

	async function handleCreate(data: { title: string; planningNotes: string }) {
		busy = true;
		error = null;
		try {
			await createAct({
				projectId,
				arcId: arcId ?? undefined,
				title: data.title,
				planningNotes: data.planningNotes,
				order: acts.length,
			});
			await refreshAll();
			showCreate = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create act.';
		} finally {
			busy = false;
		}
	}

	async function handleEdit(data: { title: string; planningNotes: string }) {
		if (!editingAct) return;
		busy = true;
		error = null;
		try {
			await updateAct(editingAct.id, {
				title: data.title,
				planningNotes: data.planningNotes,
			});
			await refreshAll();
			editingAct = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save changes.';
		} finally {
			busy = false;
		}
	}

	async function handleDelete(act: Act) {
		const chapterCount = chapterCounts[act.id] ?? 0;
		const message =
			chapterCount > 0
				? `Delete act "${act.title || 'Untitled act'}"? ${chapterCount} chapter(s) will move to Unassigned.`
				: `Delete act "${act.title || 'Untitled act'}"?`;
		if (!confirm(message)) return;
		busy = true;
		try {
			await removeAct(act.id);
			await refreshAll();
		} finally {
			busy = false;
		}
	}

	async function moveAct(act: Act, direction: -1 | 1) {
		const index = acts.findIndex((a) => a.id === act.id);
		const target = index + direction;
		if (index === -1 || target < 0 || target >= acts.length) return;
		const nextOrder = [...acts];
		[nextOrder[index], nextOrder[target]] = [nextOrder[target], nextOrder[index]];
		const previous = acts;
		acts = nextOrder;
		try {
			await reorderActs(
				projectId,
				nextOrder.map((a) => a.id),
			);
		} catch {
			acts = previous;
		}
	}

	async function moveToArc(act: Act) {
		if (arcId === null) return;
		busy = true;
		try {
			await updateAct(act.id, { arcId });
			await refreshAll();
		} finally {
			busy = false;
		}
	}

	function openAct(act: Act) {
		const arcSegment = act.arcId ?? 'unassigned';
		goto(`/projects/${projectId}/arcs/${arcSegment}/acts/${act.id}`);
	}

	// Keep the unused import live so accidental tree-shake stays consistent
	// with future drilldown extension.
	void selectChaptersForAct;
</script>

<section class="act-list" aria-label={sectionTitle}>
	<SectionHeader title={sectionTitle} description={sectionDescription}>
		{#snippet actions()}
			{#if arcId !== null}
				<GhostButton type="button" onclick={() => (showCreate = !showCreate)} disabled={busy}>
					{showCreate ? 'Close' : 'New act'}
				</GhostButton>
			{/if}
		{/snippet}
	</SectionHeader>

	{#if showCreate}
		<ActCreateForm
			mode="create"
			{busy}
			{error}
			onSubmit={handleCreate}
			onCancel={() => (showCreate = false)}
		/>
	{/if}

	{#if editingAct}
		<ActCreateForm
			mode="edit"
			initial={editingAct}
			{busy}
			{error}
			onSubmit={handleEdit}
			onCancel={() => (editingAct = null)}
		/>
	{/if}

	{#if acts.length === 0}
		{#if arcId === null}
			<!-- Hide unassigned panel entirely when empty -->
		{:else}
			<EmptyStatePanel
				title="No acts in this arc yet"
				description="Acts split your arc into beats. Add the first one to start mapping chapters underneath."
			>
				{#snippet actions()}
					<GhostButton type="button" onclick={() => (showCreate = true)}>Create your first act</GhostButton>
				{/snippet}
			</EmptyStatePanel>
		{/if}
	{:else}
		<ul class="act-list__grid">
			{#each acts as act, idx (act.id)}
				<li>
					<ActCard
						{act}
						chapterCount={chapterCounts[act.id] ?? 0}
						canMoveUp={idx > 0}
						canMoveDown={idx < acts.length - 1}
						showMoveToArc={arcId === null}
						onOpen={openAct}
						onEdit={(a) => (editingAct = a)}
						onDelete={handleDelete}
						onMoveUp={(a) => moveAct(a, -1)}
						onMoveDown={(a) => moveAct(a, 1)}
						onMoveToArc={moveToArc}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.act-list {
		display: grid;
		gap: var(--space-4);
	}

	.act-list__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--space-4);
		list-style: none;
		padding: 0;
		margin: 0;
	}
</style>
