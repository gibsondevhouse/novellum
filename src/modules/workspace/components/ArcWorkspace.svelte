<script lang="ts">
	import type { Arc, Beat, Stage } from '$lib/db/types.js';
	import type { BeatWithStages } from '../types.js';
	import { STAGE_STATUSES } from '../constants.js';
	import { createBeat, createStage } from '../factories.js';
	import { computeCompletionPercent } from '../utils.js';
	import ArcHeader from './ArcHeader.svelte';
	import BeatCard from './BeatCard.svelte';
	import StageCard from './StageCard.svelte';

	let { arc, allBeats = [], allStages = [], projectId, onUpdateArc, onDeleteArc, onCreateBeat, onUpdateBeat, onDeleteBeat, onCreateStage, onUpdateStage, onDeleteStage } = $props<{
		arc: Arc | null;
		allBeats?: Beat[];
		allStages?: Stage[];
		projectId: string;
		onUpdateArc?: (id: string, changes: Partial<Arc>) => void;
		onDeleteArc?: (id: string) => void;
		onCreateBeat?: (beat: Beat) => void;
		onUpdateBeat?: (id: string, changes: Partial<Beat>) => void;
		onDeleteBeat?: (id: string) => void;
		onCreateStage?: (stage: Stage) => void;
		onUpdateStage?: (id: string, changes: Partial<Stage>) => void;
		onDeleteStage?: (id: string) => void;
	}>();

	const beatsWithStages: BeatWithStages[] = $derived(
		allBeats
			.filter((b: Beat) => b.arcId === arc?.id)
			.sort((a: Beat, b: Beat) => a.order - b.order)
			.map((b: Beat) => ({
				...b,
				stages: allStages.filter((s: Stage) => s.beatId === b.id).sort((a: Stage, bx: Stage) => a.order - bx.order)
			}))
	);

	let selectedBeatId = $state<string | null>(null);
	const selectedBeat = $derived(beatsWithStages.find(b => b.id === selectedBeatId) || null);

	function selectBeat(id: string) {
		selectedBeatId = selectedBeatId === id ? null : id;
	}

	function addBeat() {
		if (!arc) return;
		const newBeat = createBeat(arc.id, projectId, beatsWithStages.length);
		selectedBeatId = newBeat.id;
		onCreateBeat?.(newBeat);
	}

	function deleteBeat(id: string) {
		if (selectedBeatId === id) selectedBeatId = null;
		onDeleteBeat?.(id);
	}

	function addStage(beatId: string) {
		const beat = beatsWithStages.find(b => b.id === beatId);
		if (!beat) return;
		onCreateStage?.(createStage(beatId, projectId, beat.stages.length));
	}
</script>

<div class="arc-workspace">
	{#if !arc}
		<div class="empty-state">
			<h2>No Arc Selected</h2>
			<p>Select an arc from the header or create a new one to begin mapping out the story.</p>
		</div>
	{:else}
		<ArcHeader {arc} {onUpdateArc} {onDeleteArc} />

		<div class="arc-layout" role="presentation" onclick={(e: MouseEvent) => {
			const t = e.target as HTMLElement;
			if (!t.closest('.beat-card') && !t.closest('.sidebar-column')) selectedBeatId = null;
		}}>
			<div class="arc-layout-header">
				<h3>Beats</h3>
				<h3>Stages</h3>
			</div>
			<div class="arc-layout-body">
			<div class="main-column">
				<div class="beat-sequence">
					<div class="beats">
						{#each beatsWithStages as beat (beat.id)}
							<BeatCard
								{beat}
								selected={selectedBeatId === beat.id}
								onSelect={() => selectBeat(beat.id)}
								onUpdateTitle={(value) => onUpdateBeat?.(beat.id, { title: value })}
								onUpdateNotes={(value) => onUpdateBeat?.(beat.id, { notes: value })}
								onDelete={() => deleteBeat(beat.id)}
							/>
						{/each}
						{#if beatsWithStages.length === 0}
							<p class="empty-beats">No beats yet. Add your first beat to start building the arc.</p>
						{/if}
						<button class="add-beat-card" onclick={addBeat}>
							+ Add Beat
						</button>
					</div>
				</div>
			</div>
			
			<div class="sidebar-column">
				<div class="arc-context-panel">
					{#if selectedBeat}
						<div class="beat-editor">
							<div class="stage-list">
								{#each selectedBeat.stages as stage (stage.id)}
									<StageCard
										{stage}
									stageStatuses={STAGE_STATUSES}
										onUpdateField={(field, value) => onUpdateStage?.(stage.id, { [field]: value })}
										onDelete={() => onDeleteStage?.(stage.id)}
									/>
								{/each}
								<button class="add-stage-btn" onclick={() => addStage(selectedBeat.id)}>+ Add Stage</button>
							</div>
						</div>
					{:else}
						<div class="arc-guidance">
							<h3>Arc Overview</h3>
							<div class="guidance-content">
								<p>{beatsWithStages.length === 0 ? 'Create a beat to get started.' : 'Select a beat to edit its stages.'}</p>
								<div class="health-metrics">
									<div class="metric">
										<span class="label">Total Beats</span>
										<span class="value">{beatsWithStages.length}</span>
									</div>
									<div class="metric">
										<span class="label">Completion</span>
										<span class="value">
											{computeCompletionPercent(beatsWithStages.flatMap(b => b.stages))}%
										</span>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
			</div><!-- arc-layout-body -->
		</div><!-- arc-layout -->
	{/if}
</div>

<style>
	.arc-workspace {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		height: 100%;
		padding: var(--space-4);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-secondary);
		gap: var(--space-2);
		text-align: center;
	}

	.arc-layout {
		--card-row-height: 148px;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		gap: var(--space-3);
	}

	.arc-layout-header {
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: var(--space-6);
	}

	.arc-layout-header h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	.arc-layout-body {
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: var(--space-6);
		flex: 1;
		min-height: 0;
	}

	.main-column {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.sidebar-column {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}

	.beat-sequence {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.beats {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.empty-beats {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-align: center;
		padding: var(--space-4);
	}

	.add-beat-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		background: transparent;
		border: 1px dashed var(--color-border-subtle);
		border-radius: var(--radius-md);
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		height: var(--card-row-height);
		overflow: hidden;
		align-items: center;
		justify-content: center;
		color: var(--color-text-secondary);
	}

	.add-beat-card:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-sunken);
	}

	.arc-context-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
	}

	.arc-guidance, .beat-editor {
		display: flex;
		flex-direction: column;
	}

	.arc-guidance {
		padding: var(--space-4);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		gap: var(--space-2);
	}

	.arc-guidance h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	.guidance-content p {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	.stage-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.add-stage-btn {
		width: 100%;
		padding: var(--space-2);
		background: transparent;
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all 0.2s ease;
		margin-top: var(--space-2);
	}

	.add-stage-btn:hover {
		border-color: var(--color-border-hover);
		color: var(--color-text-primary);
	}

	.health-metrics {
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
</style>