<script lang="ts">
	import type { Chapter } from '$lib/db/types.js';
	import { goto } from '$app/navigation';
	import { Input, EmptyStatePanel, GhostButton, PrimaryButton, SectionHeader, SurfacePanel } from '$lib/components/ui/index.js';
	import {
		createChapter,
		updateChapter,
		removeChapter,
		reorderChapters,
		getChaptersByActId,
	} from '../services/chapter-repository.js';
	import type { Scene } from '$lib/db/types.js';
	import ChapterCard from './ChapterCard.svelte';

	interface Props {
		projectId: string;
		actId: string;
		arcSegment: string;
		chapters: Chapter[];
		scenes: Scene[];
	}

	let { projectId, actId, arcSegment, chapters: initialChapters, scenes }: Props = $props();

	let chapters = $state<Chapter[]>([]);
	let seeded = false;
	$effect(() => {
		if (!seeded) {
			chapters = [...initialChapters];
			seeded = true;
		}
	});

	let showCreate = $state(false);
	let editingChapter = $state<Chapter | null>(null);
	let busy = $state(false);
	let error = $state<string | null>(null);

	let newTitle = $state('');
	let newSummary = $state('');
	let editTitle = $state('');
	let editSummary = $state('');

	const sceneCounts = $derived.by(() => {
		const map: Record<string, number> = {};
		for (const s of scenes) {
			if (!s.chapterId) continue;
			map[s.chapterId] = (map[s.chapterId] ?? 0) + 1;
		}
		return map;
	});

	async function refresh() {
		chapters = await getChaptersByActId(actId);
	}

	function openCreate() {
		newTitle = '';
		newSummary = '';
		showCreate = true;
	}

	async function handleCreate(event: Event) {
		event.preventDefault();
		if (!newTitle.trim() || busy) return;
		busy = true;
		error = null;
		try {
			await createChapter({
				projectId,
				actId,
				title: newTitle.trim(),
				summary: newSummary.trim(),
				order: chapters.length,
				wordCount: 0,
			});
			await refresh();
			showCreate = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create chapter.';
		} finally {
			busy = false;
		}
	}

	function openEdit(chapter: Chapter) {
		editingChapter = chapter;
		editTitle = chapter.title;
		editSummary = chapter.summary;
	}

	async function handleEdit(event: Event) {
		event.preventDefault();
		if (!editingChapter || !editTitle.trim() || busy) return;
		busy = true;
		error = null;
		try {
			await updateChapter(editingChapter.id, {
				title: editTitle.trim(),
				summary: editSummary.trim(),
			});
			await refresh();
			editingChapter = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save changes.';
		} finally {
			busy = false;
		}
	}

	async function handleDelete(chapter: Chapter) {
		const sceneCount = sceneCounts[chapter.id] ?? 0;
		const message =
			sceneCount > 0
				? `Delete chapter "${chapter.title || 'Untitled chapter'}" and orphan ${sceneCount} scene(s)?`
				: `Delete chapter "${chapter.title || 'Untitled chapter'}"?`;
		if (!confirm(message)) return;
		busy = true;
		try {
			await removeChapter(chapter.id);
			await refresh();
		} finally {
			busy = false;
		}
	}

	async function moveChapter(chapter: Chapter, direction: -1 | 1) {
		const index = chapters.findIndex((c) => c.id === chapter.id);
		const target = index + direction;
		if (index === -1 || target < 0 || target >= chapters.length) return;
		const next = [...chapters];
		[next[index], next[target]] = [next[target], next[index]];
		const previous = chapters;
		chapters = next;
		try {
			await reorderChapters(
				projectId,
				next.map((c) => c.id),
			);
		} catch {
			chapters = previous;
		}
	}

	function openChapter(chapter: Chapter) {
		goto(`/projects/${projectId}/arcs/${arcSegment}/acts/${actId}/chapters/${chapter.id}`);
	}
</script>

<section class="chapter-list" aria-label="Chapters in act">
	<SectionHeader title="Chapters" description="Chapters that belong to this act.">
		{#snippet actions()}
			<GhostButton type="button" onclick={openCreate} disabled={busy || showCreate}>
				New chapter
			</GhostButton>
		{/snippet}
	</SectionHeader>

	{#if showCreate}
		<SurfacePanel class="chapter-form">
			<form onsubmit={handleCreate}>
				<div class="chapter-form__row">
					<label class="chapter-form__label" for="ch-title">Title</label>
					<Input id="ch-title" type="text" bind:value={newTitle} required disabled={busy} />
				</div>
				<div class="chapter-form__row">
					<label class="chapter-form__label" for="ch-summary">Summary</label>
					<textarea id="ch-summary" class="chapter-form__textarea" rows="3" bind:value={newSummary} disabled={busy}></textarea>
				</div>
				{#if error}<p class="chapter-form__error" role="alert">{error}</p>{/if}
				<div class="chapter-form__actions">
					<GhostButton type="button" onclick={() => (showCreate = false)} disabled={busy}>Cancel</GhostButton>
					<PrimaryButton type="submit" disabled={!newTitle.trim() || busy}>
						{busy ? 'Saving…' : 'Create chapter'}
					</PrimaryButton>
				</div>
			</form>
		</SurfacePanel>
	{/if}

	{#if editingChapter}
		<SurfacePanel class="chapter-form">
			<form onsubmit={handleEdit}>
				<div class="chapter-form__row">
					<label class="chapter-form__label" for="ch-edit-title">Title</label>
					<Input id="ch-edit-title" type="text" bind:value={editTitle} required disabled={busy} />
				</div>
				<div class="chapter-form__row">
					<label class="chapter-form__label" for="ch-edit-summary">Summary</label>
					<textarea id="ch-edit-summary" class="chapter-form__textarea" rows="3" bind:value={editSummary} disabled={busy}></textarea>
				</div>
				{#if error}<p class="chapter-form__error" role="alert">{error}</p>{/if}
				<div class="chapter-form__actions">
					<GhostButton type="button" onclick={() => (editingChapter = null)} disabled={busy}>Cancel</GhostButton>
					<PrimaryButton type="submit" disabled={!editTitle.trim() || busy}>
						{busy ? 'Saving…' : 'Save changes'}
					</PrimaryButton>
				</div>
			</form>
		</SurfacePanel>
	{/if}

	{#if chapters.length === 0}
		<EmptyStatePanel
			title="No chapters yet"
			description="Add your first chapter to start drafting scenes inside this act."
		>
			{#snippet actions()}
				<GhostButton type="button" onclick={openCreate}>Create your first chapter</GhostButton>
			{/snippet}
		</EmptyStatePanel>
	{:else}
		<ul class="chapter-list__grid">
			{#each chapters as chapter, idx (chapter.id)}
				<li>
					<ChapterCard
						{chapter}
						sceneCount={sceneCounts[chapter.id] ?? 0}
						canMoveUp={idx > 0}
						canMoveDown={idx < chapters.length - 1}
						onOpen={openChapter}
						onEdit={openEdit}
						onDelete={handleDelete}
						onMoveUp={(c) => moveChapter(c, -1)}
						onMoveDown={(c) => moveChapter(c, 1)}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.chapter-list {
		display: grid;
		gap: var(--space-4);
	}

	.chapter-list__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--space-4);
		list-style: none;
		padding: 0;
		margin: 0;
	}

	:global(.chapter-form) {
		padding: var(--space-4);
	}

	.chapter-form__row {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.chapter-form__label {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
	}

	.chapter-form__textarea {
		width: 100%;
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		resize: vertical;
	}

	.chapter-form__textarea:focus-visible {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: 2px;
	}

	.chapter-form__error {
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		margin: 0 0 var(--space-3) 0;
	}

	.chapter-form__actions {
		display: flex;
		gap: var(--space-2);
		justify-content: flex-end;
	}
</style>
