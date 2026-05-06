<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import type { Act, Arc } from '$lib/db/domain-types';
	import type { ChapterWithScenes } from '$modules/outline/types.js';
	import { WorkspaceInspector, GhostButton } from '$lib/components/ui/index.js';

	type NarrativeRole = 'setup' | 'escalation' | 'resolution' | '';

	type ActPlanningDraft = {
		subtitle: string;
		purpose: string;
		narrativeRole: NarrativeRole;
		stakesShift: string;
		entryState: string;
		exitState: string;
		beats: {
			incitingMoment: string;
			midpoint: string;
			climax: string;
			turningPoints: string;
		};
		characterInvolvement: string;
		arcInvolvement: string;
	};

	const EMPTY_DRAFT: ActPlanningDraft = {
		subtitle: '',
		purpose: '',
		narrativeRole: '',
		stakesShift: '',
		entryState: '',
		exitState: '',
		beats: {
			incitingMoment: '',
			midpoint: '',
			climax: '',
			turningPoints: '',
		},
		characterInvolvement: '',
		arcInvolvement: '',
	};

	let {
		act,
		chapters,
		relatedArc,
		onUpdateAct,
	} = $props<{
		act: Act;
		chapters: ChapterWithScenes[];
		relatedArc: Arc | null;
		onUpdateAct: (patch: Partial<Omit<Act, 'id' | 'projectId' | 'createdAt'>>) => Promise<void>;
	}>();

	let titleDraft = $state(untrack(() => act.title));
	let editingTitle = $state(false);
	const expandedChapters = new SvelteSet();
	let draft = $state<ActPlanningDraft>(untrack(() => parsePlanningNotes(act.planningNotes)));

	$effect(() => {
		titleDraft = act.title;
		draft = parsePlanningNotes(act.planningNotes);
		expandedChapters.clear();
	});

	const roleHint = $derived(
		draft.narrativeRole === 'setup'
			? 'Establish the world, pressure, and irreversible catalyst.'
			: draft.narrativeRole === 'escalation'
				? 'Deepen conflict and force meaningful costs.'
				: draft.narrativeRole === 'resolution'
					? 'Cash out pressure and land irreversible outcomes.'
					: 'Choose a narrative role to clarify what this act must accomplish.',
	);

	const uniqueActPovCount = $derived(
		new Set(
			chapters
				.flatMap((chapter: ChapterWithScenes) => chapter.scenes)
				.map((scene: ChapterWithScenes['scenes'][number]) => scene.povCharacterId)
				.filter((id: string | null): id is string => Boolean(id)),
		).size,
	);

	function parsePlanningNotes(planningNotes: string): ActPlanningDraft {
		if (!planningNotes.trim()) return { ...EMPTY_DRAFT, beats: { ...EMPTY_DRAFT.beats } };
		try {
			const parsed = JSON.parse(planningNotes) as Partial<ActPlanningDraft>;
			return {
				subtitle: parsed.subtitle ?? '',
				purpose: parsed.purpose ?? '',
				narrativeRole: (parsed.narrativeRole as NarrativeRole) ?? '',
				stakesShift: parsed.stakesShift ?? '',
				entryState: parsed.entryState ?? '',
				exitState: parsed.exitState ?? '',
				beats: {
					incitingMoment: parsed.beats?.incitingMoment ?? '',
					midpoint: parsed.beats?.midpoint ?? '',
					climax: parsed.beats?.climax ?? '',
					turningPoints: parsed.beats?.turningPoints ?? '',
				},
				characterInvolvement: parsed.characterInvolvement ?? '',
				arcInvolvement: parsed.arcInvolvement ?? '',
			};
		} catch {
			// Backward compatibility: legacy freeform notes become the purpose seed.
			return {
				...EMPTY_DRAFT,
				beats: { ...EMPTY_DRAFT.beats },
				purpose: planningNotes,
			};
		}
	}

	async function persistDraft() {
		await onUpdateAct({ planningNotes: JSON.stringify(draft) });
	}

	async function saveTitle() {
		editingTitle = false;
		const nextTitle = titleDraft.trim();
		if (!nextTitle) {
			titleDraft = act.title;
			return;
		}
		if (nextTitle !== act.title) {
			await onUpdateAct({ title: nextTitle });
		}
	}

	function toggleChapter(chapterId: string) {
		if (expandedChapters.has(chapterId)) {
			expandedChapters.delete(chapterId);
		} else {
			expandedChapters.add(chapterId);
		}
	}

	function chapterStatus(sceneCount: number): string {
		if (sceneCount === 0) return 'Empty';
		if (sceneCount < 3) return 'Developing';
		return 'Built';
	}

	function chapterPovCount(chapter: ChapterWithScenes): number {
		return new Set(
			chapter.scenes
				.map((scene) => scene.povCharacterId)
				.filter((id): id is string => Boolean(id)),
		).size;
	}
</script>

<WorkspaceInspector aria-label="Act clarity panel">
	<header class="act-clarity__header">
		<div>
			{#if editingTitle}
				<input
					class="act-title-input"
					type="text"
					bind:value={titleDraft}
					onblur={() => void saveTitle()}
					onkeydown={(event) => {
						if (event.key === 'Enter') void saveTitle();
						if (event.key === 'Escape') {
							editingTitle = false;
							titleDraft = act.title;
						}
					}}
					aria-label="Act title"
				/>
			{:else}
				<GhostButton class="act-title-btn" type="button" onclick={() => (editingTitle = true)} aria-label="Edit act title">
					{act.title}
				</GhostButton>
			{/if}
			<input
				class="act-subtitle-input"
				type="text"
				bind:value={draft.subtitle}
				onblur={() => void persistDraft()}
				placeholder="Optional subtitle: the strategic goal of this act"
				aria-label="Act subtitle"
			/>
		</div>
		<p class="purpose-hint">Clarity first: what is this act doing in the story?</p>
		<textarea
			class="purpose-input"
			rows="2"
			bind:value={draft.purpose}
			onblur={() => void persistDraft()}
			placeholder="Example: This is where the protagonist is forced into conflict and can’t go back."
			aria-label="Act purpose"
		></textarea>
	</header>

	<details class="clarity-card" open>
		<summary class="clarity-card__summary">
			<span class="clarity-card__title">Role and Purpose</span>
			<span class="clarity-card__chevron" aria-hidden="true">▾</span>
		</summary>
		<div class="clarity-card__content">
			<div class="field-grid">
				<label>
					<span>Narrative role</span>
					<select bind:value={draft.narrativeRole} onblur={() => void persistDraft()}>
						<option value="">Select role</option>
						<option value="setup">Setup</option>
						<option value="escalation">Escalation</option>
						<option value="resolution">Resolution</option>
					</select>
				</label>
				<label>
					<span>Stakes shift</span>
					<input
						type="text"
						bind:value={draft.stakesShift}
						onblur={() => void persistDraft()}
						placeholder="What changes by the end of this act?"
					/>
				</label>
				<label>
					<span>Entry state</span>
					<input
						type="text"
						bind:value={draft.entryState}
						onblur={() => void persistDraft()}
						placeholder="Where the cast starts"
					/>
				</label>
				<label>
					<span>Exit state</span>
					<input
						type="text"
						bind:value={draft.exitState}
						onblur={() => void persistDraft()}
						placeholder="Where they end up"
					/>
				</label>
			</div>
			<p class="hint-text">{roleHint}</p>
		</div>
	</details>

	<details class="clarity-card" open>
		<summary class="clarity-card__summary">
			<span class="clarity-card__title">Chapter and Scene Breakdown</span>
			<span class="clarity-card__chevron" aria-hidden="true">▾</span>
		</summary>
		<div class="clarity-card__content">
			{#if chapters.length === 0}
				<p class="empty-text">No chapters in this act yet.</p>
			{:else}
				<ul class="chapter-list" role="list">
					{#each chapters as chapter (chapter.id)}
						<li class="chapter-item">
							<GhostButton class="chapter-row" type="button" onclick={() => toggleChapter(chapter.id)}>
								<span class="chapter-title">{chapter.title}</span>
								<span class="chapter-meta">
									{chapterStatus(chapter.scenes.length)} · {chapter.scenes.length} scenes · {chapterPovCount(chapter)} POV
								</span>
							</GhostButton>
							{#if expandedChapters.has(chapter.id)}
								<ul class="scene-list" role="list">
									{#each chapter.scenes as scene (scene.id)}
										<li class="scene-item">
											<span>{scene.title}</span>
											<span class="scene-meta">POV: {scene.povCharacterId ? 'Set' : 'Unassigned'} · Tension: --</span>
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</details>

	<details class="clarity-card" open>
		<summary class="clarity-card__summary">
			<span class="clarity-card__title">Key Beats</span>
			<span class="clarity-card__chevron" aria-hidden="true">▾</span>
		</summary>
		<div class="clarity-card__content">
			<div class="field-grid">
				<label>
					<span>Inciting moment {act.order === 0 ? '(recommended)' : ''}</span>
					<input
						type="text"
						bind:value={draft.beats.incitingMoment}
						onblur={() => void persistDraft()}
						placeholder={act.order === 0 ? 'What forces the story to move?' : 'Optional act trigger'}
					/>
				</label>
				<label>
					<span>Midpoint {act.order === 1 ? '(recommended)' : ''}</span>
					<input
						type="text"
						bind:value={draft.beats.midpoint}
						onblur={() => void persistDraft()}
						placeholder={act.order === 1 ? 'What re-frames the conflict?' : 'Optional midpoint turn'}
					/>
				</label>
				<label>
					<span>Climax {act.order >= 2 ? '(recommended)' : ''}</span>
					<input
						type="text"
						bind:value={draft.beats.climax}
						onblur={() => void persistDraft()}
						placeholder={act.order >= 2 ? 'What outcome resolves this act pressure?' : 'Optional climax beat'}
					/>
				</label>
			</div>
			<label class="block-label">
				<span>Turning points in this act</span>
				<textarea
					rows="3"
					bind:value={draft.beats.turningPoints}
					onblur={() => void persistDraft()}
					placeholder="List the shifts that redirect choices and consequences."
				></textarea>
			</label>
		</div>
	</details>

	<details class="clarity-card" open>
		<summary class="clarity-card__summary">
			<span class="clarity-card__title">Character and Arc Involvement</span>
			<span class="clarity-card__chevron" aria-hidden="true">▾</span>
		</summary>
		<div class="clarity-card__content">
			<p class="hint-text">Unique POVs in this act: {uniqueActPovCount}</p>
			<label class="block-label">
				<span>Character involvement</span>
				<textarea
					rows="3"
					bind:value={draft.characterInvolvement}
					onblur={() => void persistDraft()}
					placeholder="Who is most affected in this act and how do their goals collide?"
				></textarea>
			</label>
			<label class="block-label">
				<span>Arc involvement {relatedArc ? `(linked: ${relatedArc.title})` : ''}</span>
				<textarea
					rows="3"
					bind:value={draft.arcInvolvement}
					onblur={() => void persistDraft()}
					placeholder="Which arcs advance, stall, or twist here?"
				></textarea>
			</label>
		</div>
	</details>
</WorkspaceInspector>

<style>
	.act-clarity__header {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-raised) 90%, transparent);
	}

	:global(.act-title-btn) {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		text-align: left;
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.act-title-input,
	.act-subtitle-input,
	input,
	select,
	textarea {
		width: 100%;
		background: var(--color-surface-base);
		border: 1px solid var(--color-border-default);
		border-radius: 0;
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: inherit;
		padding: var(--space-2) var(--space-3);
	}

	.act-title-input {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--space-2);
	}

	.act-subtitle-input {
		margin-top: var(--space-2);
	}

	.purpose-hint {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.purpose-input {
		min-height: 72px;
	}

	.clarity-card {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-raised) 90%, transparent);
		overflow: visible;
	}

	.clarity-card[open] .clarity-card__chevron {
		transform: rotate(0deg);
	}

	.clarity-card__summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		cursor: pointer;
		list-style: none;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.clarity-card__summary::-webkit-details-marker {
		display: none;
	}

	.clarity-card__title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
	}

	.clarity-card__chevron {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		transform: rotate(-90deg);
		transition: transform var(--duration-fast) var(--ease-standard);
	}

	.clarity-card__content {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background: transparent;
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
	}

	label,
	.block-label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	label span,
	.block-label span {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.hint-text,
	.empty-text {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.chapter-list,
	.scene-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.chapter-item {
		border-left: 1px solid var(--color-border-subtle);
		overflow: visible;
	}

	:global(.chapter-row) {
		width: 100%;
		background: transparent;
		border: none;
		padding: var(--space-2) var(--space-3);
		display: flex;
		justify-content: space-between;
		align-items: center;
		text-align: left;
		cursor: pointer;
		border-bottom: 1px dashed var(--color-border-subtle);
		min-width: 0;
	}

	:global(.chapter-row:hover) {
		background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
	}

	.chapter-title {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.chapter-meta,
	.scene-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-align: right;
		overflow-wrap: anywhere;
	}

	.scene-list {
		padding: 0 var(--space-3) var(--space-3) var(--space-5);
	}

	.scene-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px dotted var(--color-border-subtle);
		min-width: 0;
		flex-wrap: wrap;
	}

	input:focus,
	select:focus,
	textarea:focus,
	:global(.chapter-row:focus-visible),
	:global(.act-title-btn:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 960px) {
		.field-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
