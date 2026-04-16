<script lang="ts">
	import type { Arc, ArcStatus, Beat, Stage } from '$lib/db/types.js';

	interface BeatWithStages extends Beat {
		stages: Stage[];
	}

	let { arc, allBeats = [], allStages = [], projectId, onCreateBeat, onUpdateBeat, onDeleteBeat, onCreateStage, onUpdateStage, onDeleteStage } = $props<{
		arc: Arc | null;
		allBeats?: Beat[];
		allStages?: Stage[];
		projectId: string;
		onCreateBeat?: (beat: Beat) => void;
		onUpdateBeat?: (id: string, changes: Partial<Beat>) => void;
		onDeleteBeat?: (id: string) => void;
		onCreateStage?: (stage: Stage) => void;
		onUpdateStage?: (id: string, changes: Partial<Stage>) => void;
		onDeleteStage?: (id: string) => void;
	}>();

	// Status options
	const arcStatuses: { value: ArcStatus; label: string }[] = [
		{ value: 'planned', label: 'Planned' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'complete', label: 'Complete' },
		{ value: 'on_hold', label: 'On Hold' },
		{ value: 'cut', label: 'Cut' }
	];

	const stageStatuses: { value: string; label: string }[] = [
		{ value: 'planned', label: 'Planned' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'completed', label: 'Completed' }
	];

	// Combine beats with their stages
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
		const now = new Date().toISOString();
		const newBeat: Beat = {
			id: crypto.randomUUID(),
			arcId: arc.id,
			projectId,
			title: `Beat ${beatsWithStages.length + 1}`,
			type: '',
			order: beatsWithStages.length,
			notes: '',
			createdAt: now,
			updatedAt: now
		};
		selectedBeatId = newBeat.id;
		onCreateBeat?.(newBeat);
	}

	function deleteBeat(id: string) {
		if (selectedBeatId === id) selectedBeatId = null;
		onDeleteBeat?.(id);
	}

	function handleBeatUpdate(id: string, field: 'title' | 'notes', value: string) {
		onUpdateBeat?.(id, { [field]: value });
	}

	function addStage(beatId: string) {
		const beat = beatsWithStages.find(b => b.id === beatId);
		if (!beat) return;
		const now = new Date().toISOString();
		const newStage: Stage = {
			id: crypto.randomUUID(),
			beatId,
			projectId,
			title: `Stage ${beat.stages.length + 1}`,
			description: '',
			order: beat.stages.length,
			status: 'planned',
			createdAt: now,
			updatedAt: now
		};
		onCreateStage?.(newStage);
	}

	function deleteStage(_beatId: string, stageId: string) {
		onDeleteStage?.(stageId);
	}

	function handleStageUpdate(stageId: string, field: keyof Stage, value: string) {
		onUpdateStage?.(stageId, { [field]: value });
	}

	let editArc = $state({
		title: '',
		arcType: '',
		purpose: '',
		description: '',
		status: 'planned' as ArcStatus,
		characterIds: [] as string[]
	});

	$effect(() => {
		if (arc) {
			editArc.title = arc.title || '';
			editArc.arcType = arc.arcType || '';
			editArc.purpose = arc.purpose || '';
			editArc.description = arc.description || '';
			editArc.status = arc.status || 'planned';
			editArc.characterIds = arc.characterIds || [];
		}
	});

</script>

<div class="arc-workspace">
	{#if !arc}
		<div class="empty-state">
			<h2>No Arc Selected</h2>
			<p>Select an arc from the header or create a new one to begin mapping out the story.</p>
		</div>
	{:else}
	<header class="arc-header split-panel">
			<div class="panel-left">
				<div class="title-row">
					<input type="text" class="arc-title-input" bind:value={editArc.title} placeholder="Untitled Arc" />
					<input type="text" class="arc-type-input" bind:value={editArc.arcType} placeholder="Type" />
				</div>
				<textarea class="arc-purpose-input" bind:value={editArc.purpose} placeholder="Arc Purpose..."></textarea>
				<div class="meta-row">
					<div class="meta-field">
						<span class="field-label">Status</span>
						<select class="arc-status-select" bind:value={editArc.status}>
							{#each arcStatuses as opt (opt.value)}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
					<div class="meta-field">
						<span class="field-label">Characters</span>
						<div class="character-chips">
							{#each editArc.characterIds as charId (charId)}
								<span class="character-chip active">{charId}</span>
							{/each}
							<button class="character-chip add-chip">Add +</button>
						</div>
					</div>
				</div>
			</div>
			<div class="panel-right">
				<span class="field-label">Description</span>
				<textarea class="arc-desc-input" bind:value={editArc.description} placeholder="Arc Description..."></textarea>
			</div>
		</header>

                <div class="arc-layout">
			<div class="main-column">
				<div class="beat-sequence">
					<h3>Beat Sequence</h3>
					<div class="beats">
						{#each beatsWithStages as beat (beat.id)}
							<div class="beat-card" class:selected={selectedBeatId === beat.id}>
								<div class="beat-card-header">
									<input
										type="text"
										class="beat-title-input"
										value={beat.title}
										oninput={(e) => handleBeatUpdate(beat.id, 'title', e.currentTarget.value)}
										onclick={() => selectBeat(beat.id)}
									/>
									<button class="delete-btn" onclick={() => deleteBeat(beat.id)} title="Delete beat">&times;</button>
								</div>
								<textarea
									class="beat-desc-input"
									value={beat.notes}
									oninput={(e) => handleBeatUpdate(beat.id, 'notes', e.currentTarget.value)}
									placeholder="Describe this beat..."
									rows="2"
									onclick={() => { if (selectedBeatId !== beat.id) selectBeat(beat.id); }}
								></textarea>
								<div class="stage-summary">
									{beat.stages.length} stage{beat.stages.length !== 1 ? 's' : ''}
								</div>
							</div>
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
							<h3>{selectedBeat.title}</h3>
							
							<div class="stage-list">
								<h4>Stages</h4>
								{#each selectedBeat.stages as stage (stage.id)}
									<div class="stage-row" data-status={stage.status}>
										<select
											class="stage-status-select"
											value={stage.status}
											onchange={(e) => handleStageUpdate(stage.id, 'status', e.currentTarget.value)}
										>
											{#each stageStatuses as opt (opt.value)}
												<option value={opt.value}>{opt.label}</option>
											{/each}
										</select>
										<div class="stage-content">
											<input
												type="text"
												class="stage-title-input"
												value={stage.title}
												oninput={(e) => handleStageUpdate(stage.id, 'title', e.currentTarget.value)}
											/>
											<textarea
												class="stage-desc-input"
												value={stage.description}
												oninput={(e) => handleStageUpdate(stage.id, 'description', e.currentTarget.value)}
												placeholder="Stage details..."
												rows="2"
											></textarea>
										</div>
										<button class="delete-btn small" onclick={() => deleteStage(selectedBeat.id, stage.id)} title="Delete stage">&times;</button>
									</div>
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
											{Math.round((beatsWithStages.flatMap(b => b.stages).filter(s => s.status === 'completed').length / Math.max(1, beatsWithStages.flatMap(b => b.stages).length)) * 100)}%
										</span>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
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

	.arc-header.split-panel {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
		padding: var(--space-3) 0 var(--space-4);
		margin-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		align-items: stretch;
	}

	.panel-left {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.title-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.panel-right {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding-top: var(--space-1);
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
		margin-top: var(--space-1);
	}

	.meta-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.arc-status-select {
		font-family: inherit;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		padding: 3px var(--space-2);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: border-color var(--duration-base) var(--ease-standard);
	}

	.arc-status-select:hover {
		border-color: var(--color-border-default);
	}

	.arc-status-select:focus {
		border-color: var(--color-border-focus);
		outline: none;
	}

	.character-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.character-chip {
		font-family: inherit;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		background: transparent;
		border: 1px solid var(--color-border-subtle);
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: all var(--duration-base) var(--ease-standard);
	}

	.character-chip:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-border-default);
	}

	.character-chip.active {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		color: var(--color-text-primary);
	}

	.add-chip {
		border-style: dashed;
		color: var(--color-text-muted);
		background: transparent;
	}

	.add-chip:hover {
		color: var(--color-text-primary);
		border-color: var(--color-border-default);
		background: var(--color-surface-hover);
	}

	.field-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.arc-title-input {
		font-size: var(--text-2xl);
		font-family: var(--font-display);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		border: 1px solid transparent;
		background: transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
		line-height: var(--leading-tight);
		flex: 1;
		min-width: 0;
	}

	.arc-type-input {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface-raised);
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
		width: auto;
		min-width: 72px;
		max-width: 120px;
		text-align: center;
		flex-shrink: 0;
		align-self: center;
	}

	.arc-purpose-input, .arc-desc-input {
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		border: 1px solid transparent;
		background: transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.6;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
		width: calc(100% + var(--space-2));
	}

	.arc-purpose-input {
		min-height: 2.4rem;
	}

	.arc-desc-input {
		min-height: 5rem;
		flex: 1;
		margin-left: 0;
		width: 100%;
	}

	.arc-title-input:hover,
	.arc-purpose-input:hover, 
	.arc-desc-input:hover {
		background: var(--color-surface-hover);
	}

	.arc-type-input:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-border-default);
	}

	.arc-title-input:focus,
	.arc-type-input:focus,
	.arc-purpose-input:focus,
	.arc-desc-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.arc-layout {
		display: grid;
		grid-template-columns: 7fr 3fr;
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
		background: var(--color-surface-sunken);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		overflow: hidden;
	}

	.beat-sequence {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.beat-sequence h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	.beats {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.beat-card, .add-beat-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
	}

	.beat-card:hover {
		border-color: var(--color-border-hover);
		background: var(--color-surface-hover);
	}

	.beat-card.selected {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 1px var(--color-primary);
	}

	.beat-card-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.beat-title-input {
		font-size: var(--text-md);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		flex: 1;
		min-width: 0;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.beat-title-input:hover {
		background: var(--color-surface-hover);
	}

	.beat-title-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.beat-desc-input {
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.5;
		width: calc(100% + var(--space-2));
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.beat-desc-input:hover {
		background: var(--color-surface-hover);
	}

	.beat-desc-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.delete-btn {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		cursor: pointer;
		padding: 0 var(--space-1);
		line-height: 1;
		border-radius: var(--radius-sm);
		transition: color var(--duration-base) var(--ease-standard);
		flex-shrink: 0;
	}

	.delete-btn:hover {
		color: var(--color-danger, #e53e3e);
	}

	.delete-btn.small {
		font-size: var(--text-sm);
		align-self: flex-start;
		margin-top: var(--space-1);
	}

	.empty-beats {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-align: center;
		padding: var(--space-4);
	}

	.stage-summary {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-2);
	}

	.add-beat-card {
		align-items: center;
		justify-content: center;
		background: transparent;
		border-style: dashed;
		color: var(--color-text-secondary);
	}

	.add-beat-card:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-sunken);
	}

	.arc-context-panel {
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
	}

	.arc-guidance, .beat-editor {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.arc-guidance h3, .beat-editor h3 {
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

	.stage-list h4 {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stage-row {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		align-items: flex-start;
	}

	.stage-status-select {
		font-family: inherit;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		background: var(--color-surface-sunken);
		border: 1px solid var(--color-border-subtle);
		padding: 2px var(--space-1);
		border-radius: var(--radius-sm);
		cursor: pointer;
		flex-shrink: 0;
		margin-top: var(--space-1);
		transition: border-color var(--duration-base) var(--ease-standard);
	}

	.stage-status-select:focus {
		border-color: var(--color-border-focus);
		outline: none;
	}

	.stage-row[data-status="done"] .stage-status-select {
		color: var(--color-success);
		border-color: var(--color-success);
	}

	.stage-row[data-status="in_progress"] .stage-status-select {
		color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.stage-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex: 1;
		min-width: 0;
	}

	.stage-title-input {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		width: calc(100% + var(--space-2));
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.stage-title-input:hover {
		background: var(--color-surface-hover);
	}

	.stage-title-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.stage-desc-input {
		font-family: inherit;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.5;
		width: calc(100% + var(--space-2));
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.stage-desc-input:hover {
		background: var(--color-surface-hover);
	}

	.stage-desc-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
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