<script lang="ts">
	import type { Act, Milestone } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import WorkspaceBoardShell from './WorkspaceBoardShell.svelte';
	import ActHeader from './ActHeader.svelte';
	import MilestoneCard from './MilestoneCard.svelte';

	let {
		act,
		milestones = [],
		allChapters = [],
		projectId,
		onUpdateAct,
		onDeleteAct,
		onCreateMilestone,
		onUpdateMilestone,
		onDeleteMilestone,
		onLinkChapter,
		onUnlinkChapter,
	} = $props<{
		act: Act | null;
		milestones?: Milestone[];
		allChapters?: ChapterWithScenes[];
		projectId: string;
		onUpdateAct?: (id: string, changes: Partial<Act>) => void;
		onDeleteAct?: (id: string) => void;
		onCreateMilestone?: (actId: string) => void;
		onUpdateMilestone?: (id: string, changes: Partial<Milestone>) => void;
		onDeleteMilestone?: (id: string) => void;
		onLinkChapter?: (milestoneId: string, chapterId: string) => void;
		onUnlinkChapter?: (milestoneId: string, chapterId: string) => void;
	}>();

	/** Milestones for this act, sorted by order. */
	const actMilestones = $derived(
		milestones
			.filter((m: Milestone) => m.actId === act?.id)
			.sort((a: Milestone, b: Milestone) => a.order - b.order),
	);

	let selectedMilestoneId = $state<string | null>(null);
	const selectedMilestone = $derived(actMilestones.find((m: Milestone) => m.id === selectedMilestoneId) ?? null);

	/** Chapters linked to the selected milestone. */
	const linkedChapters = $derived.by(() => {
		if (!selectedMilestone) return [];
		return selectedMilestone.chapterIds
			.map((cid: string) => allChapters.find((c: ChapterWithScenes) => c.id === cid))
			.filter((c: ChapterWithScenes | undefined): c is ChapterWithScenes => !!c);
	});

	/** Chapters not linked to any milestone in this act — available for linking. */
	const availableChapters = $derived.by(() => {
		const linkedIds = new Set(actMilestones.flatMap((m: Milestone) => m.chapterIds));
		return allChapters.filter((c: ChapterWithScenes) => !linkedIds.has(c.id));
	});

	function selectMilestone(id: string) {
		selectedMilestoneId = selectedMilestoneId === id ? null : id;
	}

	function addMilestone() {
		if (!act) return;
		onCreateMilestone?.(act.id);
	}

	function deleteMilestone(id: string) {
		if (selectedMilestoneId === id) selectedMilestoneId = null;
		onDeleteMilestone?.(id);
	}

	function linkChapter(chapterId: string) {
		if (!selectedMilestone) return;
		onLinkChapter?.(selectedMilestone.id, chapterId);
	}

	function unlinkChapter(chapterId: string) {
		if (!selectedMilestone) return;
		onUnlinkChapter?.(selectedMilestone.id, chapterId);
	}

	function handleBackdropClick() {
		selectedMilestoneId = null;
	}
</script>

<WorkspaceBoardShell
	showEmpty={!act}
	onBackdropClick={handleBackdropClick}
>
	{#snippet empty()}
		<h2>No Act Selected</h2>
		<p>Select an act from the header or create a new one to begin structuring the story.</p>
	{/snippet}

	{#snippet header()}
		<ActHeader act={act!} {onUpdateAct} {onDeleteAct} />
	{/snippet}

	{#snippet columnHeaders()}
		<h3 class="column-label">Milestones</h3>
		<h3 class="column-label">Details</h3>
	{/snippet}

	{#snippet main()}
		<div class="milestone-sequence">
			<div class="milestones">
				{#each actMilestones as milestone (milestone.id)}
					<MilestoneCard
						{milestone}
						selected={selectedMilestoneId === milestone.id}
						onSelect={() => selectMilestone(milestone.id)}
						onUpdateTitle={(value) => onUpdateMilestone?.(milestone.id, { title: value })}
						onUpdateDescription={(value) => onUpdateMilestone?.(milestone.id, { description: value })}
					/>
				{/each}
				{#if actMilestones.length === 0}
					<div class="empty-milestones">
						<p class="empty-heading">Define this act's structure</p>
						<p class="empty-body">Create milestones to map out the major turning points and structural anchors of this act. Chapters can be linked later.</p>
					</div>
				{/if}
				<button class="add-milestone-btn" onclick={addMilestone}>
					+ Add Milestone
				</button>
			</div>
		</div>
	{/snippet}

	{#snippet sidebar()}
		<div class="act-context-panel">
			{#if selectedMilestone}
				<div class="milestone-detail">
					<div class="detail-header">
						<h4 class="detail-title">{selectedMilestone.title}</h4>
						<button class="delete-milestone-btn" onclick={() => deleteMilestone(selectedMilestone.id)} aria-label="Delete milestone">×</button>
					</div>

					<div class="detail-section">
						<span class="detail-label">Description</span>
						<textarea
							class="detail-textarea"
							value={selectedMilestone.description}
							oninput={(e) => onUpdateMilestone?.(selectedMilestone.id, { description: e.currentTarget.value })}
							placeholder="Describe what happens at this turning point..."
							rows="3"
						></textarea>
					</div>

					<div class="detail-section">
						<span class="detail-label">Linked Chapters</span>
						{#if linkedChapters.length > 0}
							<ul class="chapter-list">
								{#each linkedChapters as chapter (chapter.id)}
									<li class="chapter-item">
										<span class="chapter-name">{chapter.title}</span>
										<button class="unlink-btn" onclick={() => unlinkChapter(chapter.id)}>×</button>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="detail-empty">No chapters linked yet.</p>
						{/if}
					</div>

					{#if availableChapters.length > 0}
						<div class="detail-section">
							<span class="detail-label">Available Chapters</span>
							<div class="link-options">
								{#each availableChapters as ch (ch.id)}
									<button class="link-chapter-btn" onclick={() => linkChapter(ch.id)}>
										+ {ch.title}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="act-overview">
					<h3>Act Overview</h3>
					<div class="overview-content">
						<p>{actMilestones.length === 0 ? 'Add milestones to shape this act\'s movement.' : 'Select a milestone to view details and link chapters.'}</p>
						<div class="act-metrics">
							<div class="metric">
								<span class="label">Milestones</span>
								<span class="value">{actMilestones.length}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/snippet}
</WorkspaceBoardShell>

<style>
	/* Act-specific styles — layout structure is owned by WorkspaceBoardShell */

	.column-label {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	.milestone-sequence {
		--card-row-height: 148px;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.milestones {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.empty-milestones {
		text-align: center;
		padding: var(--space-6) var(--space-4);
	}

	.empty-heading {
		font-size: var(--text-md);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-2);
	}

	.empty-body {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.5;
	}

	.add-milestone-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-3);
		background: transparent;
		border: 1px dashed var(--color-border-subtle);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
	}

	.add-milestone-btn:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-sunken);
		border-color: var(--color-border-default);
	}

	.link-options {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.link-chapter-btn {
		display: flex;
		align-items: center;
		padding: var(--space-2) var(--space-3);
		background: transparent;
		border: 1px dashed var(--color-border-subtle);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		text-align: left;
	}

	.link-chapter-btn:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-sunken);
		border-color: var(--color-border-default);
	}

	/* ── Context Panel ── */

	.act-context-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
	}

	.act-overview {
		padding: var(--space-4);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.act-overview h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	.overview-content p {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	.act-metrics {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-top: var(--space-4);
		padding: var(--space-4);
		background: var(--color-surface-raised);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-subtle);
	}

	.metric {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.metric .label {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.metric .value {
		font-size: var(--text-md);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	/* ── Milestone Detail ── */

	.milestone-detail {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.detail-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.detail-title {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.delete-milestone-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		cursor: pointer;
		padding: var(--space-1);
		line-height: 1;
		transition: color 0.15s ease;
	}

	.delete-milestone-btn:hover {
		color: var(--color-text-primary);
	}

	.detail-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.detail-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wider);
		color: var(--color-text-muted);
	}

	.detail-textarea {
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		background: transparent;
		border: 1px solid var(--color-border-subtle);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.5;
		width: 100%;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.detail-textarea:hover {
		background: var(--color-surface-hover);
	}

	.detail-textarea:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.detail-empty {
		margin: 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-style: italic;
	}

	.chapter-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.chapter-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
	}

	.chapter-name {
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.unlink-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--text-md);
		cursor: pointer;
		padding: 0 var(--space-1);
		line-height: 1;
		transition: color 0.15s ease;
	}

	.unlink-btn:hover {
		color: var(--color-text-primary);
	}
</style>
