<script lang="ts">
	import { untrack } from 'svelte';
	import type { Act, Arc, Chapter, Character, Scene } from '$lib/db/types.js';

	type OutcomeType = 'win' | 'loss' | 'partial' | 'worse' | '';
	type DraftStatus = 'idea' | 'draft' | 'revised' | 'locked' | '';

	type ChapterMeta = {
		subtitle: string;
		characterGoal: string;
		obstacle: string;
		centralConflict: string;
		outcome: OutcomeType;
		outcomeNote: string;
		entryState: string;
		exitState: string;
		beats: {
			opening: string;
			escalation: string;
			turningPoint: string;
			closingHook: string;
		};
		povCharacterId: string;
		linkedCharacterIds: string[];
		relatedArcIds: string[];
		continuityNotes: string;
		draftStatus: DraftStatus;
		targetLength: string;
	};

	const EMPTY_META: ChapterMeta = {
		subtitle: '',
		characterGoal: '',
		obstacle: '',
		centralConflict: '',
		outcome: '',
		outcomeNote: '',
		entryState: '',
		exitState: '',
		beats: {
			opening: '',
			escalation: '',
			turningPoint: '',
			closingHook: '',
		},
		povCharacterId: '',
		linkedCharacterIds: [],
		relatedArcIds: [],
		continuityNotes: '',
		draftStatus: '',
		targetLength: '',
	};

	let {
		projectId,
		chapter,
		chapterNumber,
		parentAct,
		scenes,
		characters,
		arcs,
		onUpdateChapter,
		onAddScene,
	} = $props<{
		projectId: string;
		chapter: Chapter;
		chapterNumber: number;
		parentAct: Act | null;
		scenes: Scene[];
		characters: Character[];
		arcs: Arc[];
		onUpdateChapter: (id: string, patch: Partial<Omit<Chapter, 'id' | 'projectId' | 'createdAt'>>) => Promise<void>;
		onAddScene: (chapterId: string) => Promise<void>;
	}>();

	let titleDraft = $state(untrack(() => chapter.title));
	let summaryDraft = $state(untrack(() => chapter.summary));
	let meta = $state<ChapterMeta>(
		untrack(() =>
			loadMeta(
				projectId,
				chapter.id,
				chapter.arcRefs?.map((ref: { arcId: string }) => ref.arcId) ?? [],
			),
		),
	);
	let scenesExpanded = $state(true);

	$effect(() => {
		titleDraft = chapter.title;
		summaryDraft = chapter.summary;
		meta = loadMeta(
			projectId,
			chapter.id,
			chapter.arcRefs?.map((ref: { arcId: string }) => ref.arcId) ?? [],
		);
		scenesExpanded = true;
	});

	function storageKey(pid: string, chapterId: string): string {
		return `novellum.chapter-clarity.${pid}.${chapterId}`;
	}

	function loadMeta(pid: string, chapterId: string, fallbackArcIds: string[]): ChapterMeta {
		if (typeof localStorage === 'undefined') {
			return {
				...EMPTY_META,
				beats: { ...EMPTY_META.beats },
				relatedArcIds: [...fallbackArcIds],
			};
		}
		const raw = localStorage.getItem(storageKey(pid, chapterId));
		if (!raw) {
			return {
				...EMPTY_META,
				beats: { ...EMPTY_META.beats },
				relatedArcIds: [...fallbackArcIds],
			};
		}
		try {
			const parsed = JSON.parse(raw) as Partial<ChapterMeta>;
			return {
				subtitle: parsed.subtitle ?? '',
				characterGoal: parsed.characterGoal ?? '',
				obstacle: parsed.obstacle ?? '',
				centralConflict: parsed.centralConflict ?? '',
				outcome: (parsed.outcome as OutcomeType) ?? '',
				outcomeNote: parsed.outcomeNote ?? '',
				entryState: parsed.entryState ?? '',
				exitState: parsed.exitState ?? '',
				beats: {
					opening: parsed.beats?.opening ?? '',
					escalation: parsed.beats?.escalation ?? '',
					turningPoint: parsed.beats?.turningPoint ?? '',
					closingHook: parsed.beats?.closingHook ?? '',
				},
				povCharacterId: parsed.povCharacterId ?? '',
				linkedCharacterIds: parsed.linkedCharacterIds ?? [],
				relatedArcIds: parsed.relatedArcIds ?? [...fallbackArcIds],
				continuityNotes: parsed.continuityNotes ?? '',
				draftStatus: (parsed.draftStatus as DraftStatus) ?? '',
				targetLength: parsed.targetLength ?? '',
			};
		} catch {
			return {
				...EMPTY_META,
				beats: { ...EMPTY_META.beats },
				relatedArcIds: [...fallbackArcIds],
			};
		}
	}

	function persistMeta() {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(storageKey(projectId, chapter.id), JSON.stringify(meta));
	}

	async function persistTitle() {
		const next = titleDraft.trim();
		if (!next || next === chapter.title) {
			titleDraft = chapter.title;
			return;
		}
		await onUpdateChapter(chapter.id, { title: next });
	}

	async function persistSummary() {
		if (summaryDraft === chapter.summary) return;
		await onUpdateChapter(chapter.id, { summary: summaryDraft });
	}

	async function persistArcRefs() {
		const refs = meta.relatedArcIds.map((arcId) => ({ arcId }));
		await onUpdateChapter(chapter.id, { arcRefs: refs });
	}

	function toggleLinkedCharacter(id: string) {
		if (meta.linkedCharacterIds.includes(id)) {
			meta.linkedCharacterIds = meta.linkedCharacterIds.filter((item) => item !== id);
		} else {
			meta.linkedCharacterIds = [...meta.linkedCharacterIds, id];
		}
		meta = { ...meta };
		persistMeta();
	}

	function toggleRelatedArc(id: string) {
		if (meta.relatedArcIds.includes(id)) {
			meta.relatedArcIds = meta.relatedArcIds.filter((item) => item !== id);
		} else {
			meta.relatedArcIds = [...meta.relatedArcIds, id];
		}
		meta = { ...meta };
		persistMeta();
		void persistArcRefs();
	}
</script>

<div class="chapter-editor" aria-label="Chapter editor">
	<header class="chapter-header">
		<div class="chapter-header__top">
			<input
				class="chapter-title"
				type="text"
				bind:value={titleDraft}
				onblur={() => void persistTitle()}
				placeholder="Chapter title"
				aria-label="Chapter title"
			/>
			<span class="chapter-number">Chapter {chapterNumber}</span>
		</div>
		<input
			class="chapter-subtitle"
			type="text"
			bind:value={meta.subtitle}
			onblur={persistMeta}
			placeholder="Optional subtitle"
			aria-label="Chapter subtitle"
		/>
		<input
			class="chapter-summary"
			type="text"
			bind:value={summaryDraft}
			onblur={() => void persistSummary()}
			placeholder="One-line summary (single sentence): what this chapter does in the story"
			aria-label="One-line summary"
		/>
	</header>

	<details class="chapter-card" open>
		<summary>Objective</summary>
		<div class="card-body two-col">
			<label>
				<span>Character Goal</span>
				<input type="text" bind:value={meta.characterGoal} onblur={persistMeta} placeholder="What the POV character wants" />
			</label>
			<label>
				<span>Obstacle</span>
				<input type="text" bind:value={meta.obstacle} onblur={persistMeta} placeholder="What stands in the way" />
			</label>
		</div>
	</details>

	<details class="chapter-card" open>
		<summary>Conflict + Outcome</summary>
		<div class="card-body two-col">
			<label>
				<span>Central Conflict</span>
				<input type="text" bind:value={meta.centralConflict} onblur={persistMeta} placeholder="Core conflict pressure" />
			</label>
			<label>
				<span>Outcome</span>
				<select bind:value={meta.outcome} onblur={persistMeta}>
					<option value="">Select</option>
					<option value="win">Win</option>
					<option value="loss">Loss</option>
					<option value="partial">Partial</option>
					<option value="worse">Worse</option>
				</select>
			</label>
			<label class="full">
				<span>Outcome Details (optional)</span>
				<input type="text" bind:value={meta.outcomeNote} onblur={persistMeta} placeholder="What this outcome costs or unlocks" />
			</label>
		</div>
	</details>

	<details class="chapter-card" open>
		<summary>State Change</summary>
		<div class="card-body two-col">
			<label>
				<span>Entry State</span>
				<input type="text" bind:value={meta.entryState} onblur={persistMeta} placeholder="Start state" />
			</label>
			<label>
				<span>Exit State</span>
				<input type="text" bind:value={meta.exitState} onblur={persistMeta} placeholder="End state" />
			</label>
		</div>
	</details>

	<details class="chapter-card">
		<summary>Key Beats</summary>
		<div class="card-body two-col">
			<label><span>Opening</span><input type="text" bind:value={meta.beats.opening} onblur={persistMeta} placeholder="Opening beat" /></label>
			<label><span>Escalation</span><input type="text" bind:value={meta.beats.escalation} onblur={persistMeta} placeholder="Escalation beat" /></label>
			<label><span>Turning Point</span><input type="text" bind:value={meta.beats.turningPoint} onblur={persistMeta} placeholder="Turning point" /></label>
			<label><span>Closing Hook</span><input type="text" bind:value={meta.beats.closingHook} onblur={persistMeta} placeholder="Closing hook" /></label>
		</div>
	</details>

	<details class="chapter-card">
		<summary>Connections</summary>
		<div class="card-body">
			<label>
				<span>POV Character</span>
				<select bind:value={meta.povCharacterId} onblur={persistMeta}>
					<option value="">Unassigned</option>
					{#each characters as character (character.id)}
						<option value={character.id}>{character.name}</option>
					{/each}
				</select>
			</label>
			<div class="multi-pick">
				<span>Linked Characters</span>
				<div class="chip-grid">
					{#each characters as character (character.id)}
						<label class="chip">
							<input
								type="checkbox"
								checked={meta.linkedCharacterIds.includes(character.id)}
								onchange={() => toggleLinkedCharacter(character.id)}
							/>
							<span>{character.name}</span>
						</label>
					{/each}
				</div>
			</div>
			<div class="multi-pick">
				<span>Related Arcs</span>
				<div class="chip-grid">
					{#each arcs as arc (arc.id)}
						<label class="chip">
							<input
								type="checkbox"
								checked={meta.relatedArcIds.includes(arc.id)}
								onchange={() => toggleRelatedArc(arc.id)}
							/>
							<span>{arc.title}</span>
						</label>
					{/each}
				</div>
			</div>
			<div class="readonly-ref">
				<span>Parent Act</span>
				<strong>{parentAct?.title ?? 'Unassigned Act'}</strong>
			</div>
		</div>
	</details>

	<details class="chapter-card" open={scenesExpanded}>
		<summary>Scenes Preview</summary>
		<div class="card-body">
			{#if scenes.length === 0}
				<p class="empty">No scenes yet.</p>
			{:else}
				<ul class="scene-list" role="list">
					{#each scenes as scene (scene.id)}
						<li>
							<span>{scene.title}</span>
							<span class="meta">{scene.locationId ? 'Location linked' : 'No location'} · {scene.summary ? 'Purpose set' : 'No purpose'}</span>
						</li>
					{/each}
				</ul>
			{/if}
			<button class="btn-add" onclick={() => void onAddScene(chapter.id)}>+ Add Scene</button>
		</div>
	</details>

	<details class="chapter-card">
		<summary>Continuity / Intent Notes</summary>
		<div class="card-body">
			<textarea
				rows="4"
				bind:value={meta.continuityNotes}
				onblur={persistMeta}
				placeholder="Foreshadowing, continuity anchors, thematic tone, important details..."
			></textarea>
		</div>
	</details>

	<details class="chapter-card">
		<summary>Status / Meta</summary>
		<div class="card-body two-col">
			<label>
				<span>Draft Status</span>
				<select bind:value={meta.draftStatus} onblur={persistMeta}>
					<option value="">Select</option>
					<option value="idea">Idea</option>
					<option value="draft">Draft</option>
					<option value="revised">Revised</option>
					<option value="locked">Locked</option>
				</select>
			</label>
			<label>
				<span>Target Length (optional)</span>
				<input type="text" bind:value={meta.targetLength} onblur={persistMeta} placeholder="e.g., 2500 words" />
			</label>
			<div class="readonly-ref full">
				<span>Current Word Count</span>
				<strong>{chapter.wordCount || 0}</strong>
			</div>
		</div>
	</details>
</div>

<style>
	.chapter-editor {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: min(920px, 100%);
		height: 100%;
		overflow-y: auto;
		padding-right: var(--space-2);
	}

	.chapter-header,
	.chapter-card {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-raised) 92%, transparent);
	}

	.chapter-header {
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.chapter-header__top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.chapter-title {
		flex: 1;
		background: none;
		border: none;
		padding: 0;
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.chapter-number {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.chapter-subtitle,
	.chapter-summary,
	input,
	select,
	textarea {
		width: 100%;
		background: var(--color-surface-base);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: inherit;
		padding: var(--space-2) var(--space-3);
	}

	.chapter-card {
		overflow: visible;
	}

	summary {
		padding: var(--space-3) var(--space-4);
		cursor: pointer;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		list-style: none;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	summary::-webkit-details-marker {
		display: none;
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
	}

	.two-col {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
	}

	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	label span,
	.multi-pick > span,
	.readonly-ref span {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.full {
		grid-column: 1 / -1;
	}

	.multi-pick {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.chip-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.readonly-ref {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.readonly-ref strong {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.scene-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.scene-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		flex-wrap: wrap;
	}

	.scene-list .meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.empty {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.btn-add {
		align-self: flex-start;
		padding: var(--space-2) var(--space-3);
		background: none;
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.btn-add:hover {
		border-color: var(--color-border-strong);
		color: var(--color-text-primary);
	}

	input:focus,
	select:focus,
	textarea:focus,
	.chapter-title:focus {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 960px) {
		.two-col {
			grid-template-columns: 1fr;
		}
	}
</style>
