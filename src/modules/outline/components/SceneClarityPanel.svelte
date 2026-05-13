<script lang="ts">
	import { untrack } from 'svelte';
	import type { Act, Arc, Chapter, Character, Scene, Beat } from '$lib/db/domain-types.js';
	import {
		updateBeat,
		removeBeat,
		reorderBeats,
		getBeatsBySceneId,
	} from '$modules/editor/services/beat-repository.js';
	import { goto } from '$app/navigation';
	import {
		getProjectMetadata,
		setProjectMetadata,
	} from '$lib/project-metadata.js';
	import { WorkspaceInspector, GhostButton } from '$lib/components/ui/index.js';

	type OutcomeType = 'win' | 'loss' | 'partial' | 'reversal' | '';
	type DraftStatus = 'idea' | 'draft' | 'revised' | 'locked' | '';
	type SceneLengthEstimate = 'short' | 'medium' | 'long' | '';

	type SceneMomentFlags = {
		dialogueHeavy: boolean;
		actionHeavy: boolean;
		exposition: boolean;
		emotionalPivot: boolean;
	};

	type SceneMeta = {
		sceneGoal: string;
		immediateObstacle: string;
		tensionSource: string;
		turningPoint: string;
		outcome: OutcomeType;
		startState: string;
		endState: string;
		momentFlags: SceneMomentFlags;
		continuityNotes: string;
		draftStatus: DraftStatus;
		lengthEstimate: SceneLengthEstimate;
		linkedCharacterIds: string[];
		relatedArcIds: string[];
	};

	const EMPTY_META: SceneMeta = {
		sceneGoal: '',
		immediateObstacle: '',
		tensionSource: '',
		turningPoint: '',
		outcome: '',
		startState: '',
		endState: '',
		momentFlags: {
			dialogueHeavy: false,
			actionHeavy: false,
			exposition: false,
			emotionalPivot: false,
		},
		continuityNotes: '',
		draftStatus: '',
		lengthEstimate: '',
		linkedCharacterIds: [],
		relatedArcIds: [],
	};

	let {
		projectId,
		scene,
		sceneNumber,
		parentChapter,
		parentAct,
		characters,
		arcs,
		onUpdateScene,
		onAddBeat,
	} = $props<{
		projectId: string;
		scene: Scene;
		sceneNumber: number;
		parentChapter: Chapter | null;
		parentAct: Act | null;
		characters: Character[];
		arcs: Arc[];
		onUpdateScene: (id: string, patch: Partial<Omit<Scene, 'id' | 'projectId' | 'createdAt'>>) => Promise<void>;
		onAddBeat: (sceneId: string, title: string) => Promise<void>;
	}>();

	let titleDraft = $state(untrack(() => scene.title));
	let summaryDraft = $state(untrack(() => scene.summary));
	let meta = $state<SceneMeta>(untrack(() => loadMeta(projectId, scene.id, scene.arcRefs?.map((ref: { arcId: string }) => ref.arcId) ?? [])));
	let beats = $state<Beat[]>([]);
	let newBeatTitle = $state('');
	let beatsExpanded = $state(false);

	$effect(() => {
		titleDraft = scene.title;
		summaryDraft = scene.summary;
		meta = loadMeta(
			projectId,
			scene.id,
			scene.arcRefs?.map((ref: { arcId: string }) => ref.arcId) ?? [],
		);
		void loadBeats();
		beatsExpanded = false;
		// Reconcile local cache with SQLite-canonical store.
		const pid = projectId;
		const sid = scene.id;
		void getProjectMetadata<Partial<SceneMeta> | null>(pid, 'scene', sid, 'clarity', null).then(
			(remote) => {
				if (!remote || pid !== projectId || sid !== scene.id) return;
				meta = {
					sceneGoal: remote.sceneGoal ?? meta.sceneGoal,
					immediateObstacle: remote.immediateObstacle ?? meta.immediateObstacle,
					tensionSource: remote.tensionSource ?? meta.tensionSource,
					turningPoint: remote.turningPoint ?? meta.turningPoint,
					outcome: (remote.outcome as OutcomeType) ?? meta.outcome,
					startState: remote.startState ?? meta.startState,
					endState: remote.endState ?? meta.endState,
					momentFlags: {
						dialogueHeavy: remote.momentFlags?.dialogueHeavy ?? meta.momentFlags.dialogueHeavy,
						actionHeavy: remote.momentFlags?.actionHeavy ?? meta.momentFlags.actionHeavy,
						exposition: remote.momentFlags?.exposition ?? meta.momentFlags.exposition,
						emotionalPivot: remote.momentFlags?.emotionalPivot ?? meta.momentFlags.emotionalPivot,
					},
					continuityNotes: remote.continuityNotes ?? meta.continuityNotes,
					draftStatus: (remote.draftStatus as DraftStatus) ?? meta.draftStatus,
					lengthEstimate:
						(remote.lengthEstimate as SceneLengthEstimate) ?? meta.lengthEstimate,
					linkedCharacterIds: remote.linkedCharacterIds ?? meta.linkedCharacterIds,
					relatedArcIds: remote.relatedArcIds ?? meta.relatedArcIds,
				};
				try {
					localStorage.setItem(storageKey(pid, sid), JSON.stringify(meta));
				} catch {
					/* storage unavailable */
				}
			},
		);
	});

	function storageKey(pid: string, sceneId: string): string {
		return `novellum.scene-clarity.${pid}.${sceneId}`;
	}

	function loadMeta(pid: string, sceneId: string, fallbackArcIds: string[]): SceneMeta {
		if (typeof localStorage === 'undefined') {
			return {
				...EMPTY_META,
				momentFlags: { ...EMPTY_META.momentFlags },
				relatedArcIds: [...fallbackArcIds],
			};
		}
		const raw = localStorage.getItem(storageKey(pid, sceneId));
		if (!raw) {
			return {
				...EMPTY_META,
				momentFlags: { ...EMPTY_META.momentFlags },
				relatedArcIds: [...fallbackArcIds],
			};
		}
		try {
			const parsed = JSON.parse(raw) as Partial<SceneMeta>;
			return {
				sceneGoal: parsed.sceneGoal ?? '',
				immediateObstacle: parsed.immediateObstacle ?? '',
				tensionSource: parsed.tensionSource ?? '',
				turningPoint: parsed.turningPoint ?? '',
				outcome: (parsed.outcome as OutcomeType) ?? '',
				startState: parsed.startState ?? '',
				endState: parsed.endState ?? '',
				momentFlags: {
					dialogueHeavy: parsed.momentFlags?.dialogueHeavy ?? false,
					actionHeavy: parsed.momentFlags?.actionHeavy ?? false,
					exposition: parsed.momentFlags?.exposition ?? false,
					emotionalPivot: parsed.momentFlags?.emotionalPivot ?? false,
				},
				continuityNotes: parsed.continuityNotes ?? '',
				draftStatus: (parsed.draftStatus as DraftStatus) ?? '',
				lengthEstimate: (parsed.lengthEstimate as SceneLengthEstimate) ?? '',
				linkedCharacterIds: parsed.linkedCharacterIds ?? [],
				relatedArcIds: parsed.relatedArcIds ?? [...fallbackArcIds],
			};
		} catch {
			return {
				...EMPTY_META,
				momentFlags: { ...EMPTY_META.momentFlags },
				relatedArcIds: [...fallbackArcIds],
			};
		}
	}

	async function loadBeats() {
		beats = await getBeatsBySceneId(scene.id);
	}

	function persistMeta() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(storageKey(projectId, scene.id), JSON.stringify(meta));
		}
		void setProjectMetadata(projectId, 'scene', scene.id, 'clarity', meta);
	}

	async function persistTitle() {
		const next = titleDraft.trim();
		if (!next || next === scene.title) {
			titleDraft = scene.title;
			return;
		}
		await onUpdateScene(scene.id, { title: next });
	}

	async function persistSummary() {
		if (summaryDraft === scene.summary) return;
		await onUpdateScene(scene.id, { summary: summaryDraft });
	}

	async function persistPovCharacter() {
		const povId = meta.linkedCharacterIds[0] ?? null;
		if (povId !== scene.povCharacterId) {
			await onUpdateScene(scene.id, { povCharacterId: povId });
		}
	}

	async function persistCharacterIds() {
		if (JSON.stringify(meta.linkedCharacterIds) !== JSON.stringify(scene.characterIds)) {
			await onUpdateScene(scene.id, { characterIds: meta.linkedCharacterIds });
		}
	}

	async function persistArcRefs() {
		const refs = meta.relatedArcIds.map((arcId) => ({ arcId }));
		await onUpdateScene(scene.id, { arcRefs: refs });
	}

	function toggleLinkedCharacter(id: string) {
		if (meta.linkedCharacterIds.includes(id)) {
			meta.linkedCharacterIds = meta.linkedCharacterIds.filter((item) => item !== id);
		} else {
			meta.linkedCharacterIds = [...meta.linkedCharacterIds, id];
		}
		meta = { ...meta };
		persistMeta();
		void persistCharacterIds();
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

	async function addBeat() {
		if (!newBeatTitle.trim()) return;
		await onAddBeat(scene.id, newBeatTitle);
		newBeatTitle = '';
		await loadBeats();
	}

	async function removeBeatLocal(beatId: string) {
		await removeBeat(beatId);
		beats = beats.filter((b) => b.id !== beatId);
	}

	async function updateBeatLocal(beatId: string, title: string) {
		await updateBeat(beatId, { title });
		beats = beats.map((b) => (b.id === beatId ? { ...b, title } : b));
	}

	async function reorderBeatsLocal(orderedIds: string[]) {
		await reorderBeats(scene.id, orderedIds);
		const beatMap = new Map(beats.map((b) => [b.id, b]));
		beats = orderedIds.map((id) => beatMap.get(id)!).filter(Boolean);
	}

	function moveUp(index: number) {
		if (index <= 0) return;
		const ids = beats.map((b) => b.id);
		[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
		void reorderBeatsLocal(ids);
	}

	function moveDown(index: number) {
		if (index >= beats.length - 1) return;
		const ids = beats.map((b) => b.id);
		[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
		void reorderBeatsLocal(ids);
	}
	function draftThisScene(): void {
		void goto(`/projects/${projectId}/editor?sceneId=${scene.id}`);
	}
</script>

<WorkspaceInspector aria-label="Scene editor">
	<header class="scene-header">
		<div class="scene-header__top">
			<input
				class="scene-title"
				type="text"
				bind:value={titleDraft}
				onblur={() => void persistTitle()}
				placeholder="Scene title"
				aria-label="Scene title"
			/>
			<div class="scene-header__meta">
				<span class="scene-number">Scene {sceneNumber}</span>
				<button
					type="button"
					class="draft-cta"
					onclick={draftThisScene}
					title="Open this scene in the editor"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
					Draft
				</button>
			</div>
		</div>
		<input
			class="scene-summary"
			type="text"
			bind:value={summaryDraft}
			onblur={() => void persistSummary()}
			placeholder="One-line summary (what happens in this scene)"
			aria-label="One-line summary"
			required
		/>
		<div class="parent-refs">
			<span class="parent-label">{parentChapter?.title ?? 'Unassigned Chapter'}</span>
			{#if parentAct}
				<span class="parent-label">{parentAct.title}</span>
			{/if}
		</div>
	</header>

	<details class="scene-card" open>
		<summary>POV & Participants</summary>
		<div class="card-body">
			<label>
				<span>POV Character</span>
				<select
					bind:value={meta.linkedCharacterIds[0]}
					onblur={() => void persistPovCharacter()}
				>
					<option value="">Unassigned</option>
					{#each characters as character (character.id)}
						<option value={character.id}>{character.name}</option>
					{/each}
				</select>
			</label>
			<div class="multi-pick">
				<span>Present Characters</span>
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
			<label>
				<span>Location (optional)</span>
				<input
					type="text"
					placeholder="Where this scene takes place"
					value={scene.locationId ?? ''}
					readonly
				/>
			</label>
			<label>
				<span>Time (optional)</span>
				<input
					type="text"
					placeholder="Time of day / position in timeline"
					onblur={(e) => {
						const val = (e.target as HTMLInputElement).value;
						if (val !== '') persistMeta();
					}}
				/>
			</label>
		</div>
	</details>

	<details class="scene-card" open>
		<summary>Intent</summary>
		<div class="card-body two-col">
			<label>
				<span>Scene Goal</span>
				<input
					type="text"
					bind:value={meta.sceneGoal}
					onblur={persistMeta}
					placeholder="What the POV character wants right now"
				/>
			</label>
			<label>
				<span>Immediate Obstacle</span>
				<input
					type="text"
					bind:value={meta.immediateObstacle}
					onblur={persistMeta}
					placeholder="What blocks them in this moment"
				/>
			</label>
		</div>
	</details>

	<details class="scene-card" open>
		<summary>Tension & Turn</summary>
		<div class="card-body two-col">
			<label>
				<span>Source of Tension</span>
				<input
					type="text"
					bind:value={meta.tensionSource}
					onblur={persistMeta}
					placeholder="What creates conflict"
				/>
			</label>
			<label>
				<span>Turning Point</span>
				<input
					type="text"
					bind:value={meta.turningPoint}
					onblur={persistMeta}
					placeholder="What shifts during this scene"
				/>
			</label>
			<label>
				<span>Outcome</span>
				<select bind:value={meta.outcome} onblur={persistMeta}>
					<option value="">Select outcome</option>
					<option value="win">Win</option>
					<option value="loss">Loss</option>
					<option value="partial">Partial</option>
					<option value="reversal">Reversal</option>
				</select>
			</label>
		</div>
	</details>

	<details class="scene-card" open>
		<summary>State Change</summary>
		<div class="card-body two-col">
			<label>
				<span>Start State</span>
				<input
					type="text"
					bind:value={meta.startState}
					onblur={persistMeta}
					placeholder="What's true at the opening"
				/>
			</label>
			<label>
				<span>End State</span>
				<input
					type="text"
					bind:value={meta.endState}
					onblur={persistMeta}
					placeholder="What's changed by the close"
				/>
			</label>
		</div>
	</details>

	<details class="scene-card" open={beatsExpanded}>
		<summary>Beat Flow</summary>
		<div class="card-body">
			{#if beats.length === 0}
				<p class="empty-text">No beats yet. Add one to build the moment-to-moment flow.</p>
			{:else}
				<ul class="beat-list" role="list">
					{#each beats as beat, index (beat.id)}
						<li class="beat-item">
							<div class="beat-controls">
								<GhostButton
									class="beat-nav"
									type="button"
									onclick={() => moveUp(index)}
									disabled={index === 0}
									aria-label="Move beat up"
									title="Move up"
								>
									↑
								</GhostButton>
								<GhostButton
									class="beat-nav"
									type="button"
									onclick={() => moveDown(index)}
									disabled={index === beats.length - 1}
									aria-label="Move beat down"
									title="Move down"
								>
									↓
								</GhostButton>
							</div>
							<div class="beat-content">
								<input
									type="text"
									class="beat-title"
									value={beat.title}
									onblur={(e) => void updateBeatLocal(beat.id, (e.target as HTMLInputElement).value)}
									placeholder="Beat action/reaction"
								/>
								<span class="beat-index">Beat {index + 1}</span>
							</div>
							<GhostButton
								class="beat-remove"
								type="button"
								onclick={() => void removeBeatLocal(beat.id)}
								aria-label="Remove beat"
								title="Remove"
							>
								✕
							</GhostButton>
						</li>
					{/each}
				</ul>
			{/if}
			<div class="beat-add">
				<input
					type="text"
					class="beat-input"
					bind:value={newBeatTitle}
					placeholder="Add beat..."
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							void addBeat();
						}
					}}
				/>
				<GhostButton class="beat-add-btn" type="button" onclick={() => void addBeat()}
					>+ Add</GhostButton
				>
			</div>
		</div>
	</details>

	<details class="scene-card">
		<summary>Dialogue & Moment Flags</summary>
		<div class="card-body">
			<div class="flags-grid">
				<label class="flag-toggle">
					<input type="checkbox" bind:checked={meta.momentFlags.dialogueHeavy} onchange={persistMeta} />
					<span>Dialogue-heavy</span>
				</label>
				<label class="flag-toggle">
					<input type="checkbox" bind:checked={meta.momentFlags.actionHeavy} onchange={persistMeta} />
					<span>Action-heavy</span>
				</label>
				<label class="flag-toggle">
					<input type="checkbox" bind:checked={meta.momentFlags.exposition} onchange={persistMeta} />
					<span>Exposition</span>
				</label>
				<label class="flag-toggle">
					<input type="checkbox" bind:checked={meta.momentFlags.emotionalPivot} onchange={persistMeta} />
					<span>Emotional pivot</span>
				</label>
			</div>
		</div>
	</details>

	<details class="scene-card">
		<summary>Connections</summary>
		<div class="card-body">
			<div class="readonly-ref">
				<span>Chapter</span>
				<strong>{parentChapter?.title ?? 'Unassigned'}</strong>
			</div>
			{#if parentAct}
				<div class="readonly-ref">
					<span>Act</span>
					<strong>{parentAct.title}</strong>
				</div>
			{/if}
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
		</div>
	</details>

	<details class="scene-card">
		<summary>Continuity Notes</summary>
		<div class="card-body">
			<textarea
				rows="3"
				bind:value={meta.continuityNotes}
				onblur={persistMeta}
				placeholder="Callbacks, setup/payoff, important details to track..."
			></textarea>
		</div>
	</details>

	<details class="scene-card">
		<summary>Status & Meta</summary>
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
				<span>Scene Length</span>
				<select bind:value={meta.lengthEstimate} onblur={persistMeta}>
					<option value="">Select</option>
					<option value="short">Short</option>
					<option value="medium">Medium</option>
					<option value="long">Long</option>
				</select>
			</label>
			<div class="readonly-ref full">
				<span>Current Word Count</span>
				<strong>{scene.wordCount || 0}</strong>
			</div>
		</div>
	</details>
</WorkspaceInspector>

<style>
	.scene-header,
	.scene-card {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-raised) 92%, transparent);
	}

	.scene-header {
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.scene-header__top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.scene-title {
		flex: 1;
		background: none;
		border: none;
		padding: 0;
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.scene-number {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.scene-header__meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-shrink: 0;
	}

	.draft-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: 3px 10px;
		background: var(--color-nova-blue);
		color: var(--color-text-on-accent);
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: opacity var(--duration-fast) var(--ease-standard);
	}

	.draft-cta:hover {
		opacity: 0.85;
	}

	.scene-summary,
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

	.parent-refs {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.parent-label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		background: var(--color-surface-overlay);
	}

	.scene-card {
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

	label,
	.multi-pick,
	.readonly-ref {
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

	.readonly-ref strong {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.empty-text {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.beat-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.beat-item {
		display: flex;
		gap: var(--space-2);
		align-items: stretch;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
	}

	.beat-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	:global(.beat-nav) {
		background: none;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		cursor: pointer;
		padding: var(--space-1);
		line-height: 1;
		min-width: 32px;
	}

	:global(.beat-nav:disabled) {
		opacity: 0.4;
		cursor: not-allowed;
	}

	:global(.beat-nav:hover:not(:disabled)) {
		background: var(--color-surface-hover);
	}

	.beat-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.beat-title {
		padding: var(--space-1) var(--space-2) !important;
		border: none !important;
		background: transparent !important;
		font-size: var(--text-sm) !important;
	}

	.beat-index {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	:global(.beat-remove) {
		background: none;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		flex-shrink: 0;
	}

	:global(.beat-remove:hover) {
		color: var(--color-semantic-error-fg);
		border-color: var(--color-semantic-error-fg);
	}

	.beat-add {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		margin-top: var(--space-2);
	}

	.beat-input {
		flex: 1;
	}

	:global(.beat-add-btn) {
		padding: var(--space-2) var(--space-3);
		background: none;
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		cursor: pointer;
		white-space: nowrap;
	}

	:global(.beat-add-btn:hover) {
		border-color: var(--color-border-strong);
		color: var(--color-text-primary);
	}

	.flags-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--space-3);
	}

	.flag-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		font-size: var(--text-sm);
	}

	.flag-toggle input {
		width: auto;
		cursor: pointer;
	}

	input:focus,
	select:focus,
	textarea:focus,
	.scene-title:focus {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 960px) {
		.two-col {
			grid-template-columns: 1fr;
		}
	}
</style>
