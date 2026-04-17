<script lang="ts">
	import type { Scene } from '$lib/db/types.js';
	import WorkspaceBoardShell from './WorkspaceBoardShell.svelte';
	import SceneDetailHeader from './SceneDetailHeader.svelte';
	import SceneCard from './SceneCard.svelte';

	type SceneStatus = 'planned' | 'drafted' | 'complete';

	let {
		scene,
		allScenes,
		projectId,
		onSelectScene,
		onUpdateScene,
		onDeleteScene,
		onCreateScene,
		onDragStart,
		onDrop,
	} = $props<{
		scene: Scene | null;
		allScenes: Scene[];
		projectId: string;
		onSelectScene?: (id: string) => void;
		onUpdateScene?: (id: string, changes: Partial<Scene>) => void;
		onDeleteScene?: (id: string) => void;
		onCreateScene?: () => void;
		onDragStart?: (e: DragEvent, id: string) => void;
		onDrop?: (targetIdx: number) => void;
	}>();

	let localDragOverIdx = $state<number | null>(null);

	/** All scenes sorted by order. */
	const sortedScenes = $derived(
		allScenes.slice().sort((a: Scene, b: Scene) => a.order - b.order),
	);

	/** Infer a lightweight status from scene data. */
	function inferStatus(s: Scene): SceneStatus {
		if (s.wordCount > 0 && s.summary) return 'complete';
		if (s.wordCount > 0 || s.content || s.notes) return 'drafted';
		return 'planned';
	}

	const STATUS_LABELS: Record<SceneStatus, string> = {
		planned: 'Planned',
		drafted: 'Drafted',
		complete: 'Complete',
	};

	function handleBackdropClick() {
		onSelectScene?.('');
	}
</script>

<WorkspaceBoardShell
	showEmpty={sortedScenes.length === 0}
	onBackdropClick={handleBackdropClick}
>
	{#snippet empty()}
		<div class="scenes-empty">
			<h2>Define your first scene</h2>
			<p>A scene is a single dramatic moment — something happens, something changes. Start by defining what this moment is about.</p>
			<button class="create-first-btn" onclick={() => onCreateScene?.()}>
				+ Create Scene
			</button>
		</div>
	{/snippet}

	{#snippet header()}
		{#if scene}
			<SceneDetailHeader {scene} {onUpdateScene} {onDeleteScene} />
		{/if}
	{/snippet}

	{#snippet columnHeaders()}
		<h3 class="column-label">Scenes</h3>
		<h3 class="column-label">{scene ? 'Scene Details' : 'Overview'}</h3>
	{/snippet}

	{#snippet main()}
		<div class="scene-list" role="list">
			{#each sortedScenes as s, i (s.id)}
				<div
					class="scene-slot"
					class:drag-over={localDragOverIdx === i}
					role="group"
					ondragover={(e) => { e.preventDefault(); if (onDrop) localDragOverIdx = i; }}
					ondragleave={() => { if (onDrop) localDragOverIdx = null; }}
					ondrop={() => { onDrop?.(i); localDragOverIdx = null; }}
				>
					<SceneCard
						scene={s}
						ordinal={i + 1}
						selected={scene?.id === s.id}
						onSelect={() => onSelectScene?.(s.id)}
						onUpdateTitle={(value) => onUpdateScene?.(s.id, { title: value })}
						onUpdateSummary={(value) => onUpdateScene?.(s.id, { summary: value })}
						{onDragStart}
					/>
				</div>
			{/each}
			<button class="add-scene-btn" onclick={() => onCreateScene?.()}>
				+ Add Scene
			</button>
		</div>
	{/snippet}

	{#snippet sidebar()}
		<div class="scene-context-panel">
			{#if scene}
				<div class="scene-develop">
					<div class="develop-group">
						<div class="develop-section">
							<span class="develop-label">Purpose</span>
							<textarea
								class="develop-textarea"
								value={scene.summary}
								oninput={(e) => onUpdateScene?.(scene.id, { summary: e.currentTarget.value })}
								placeholder="Why does this scene exist in the story?"
								rows="3"
							></textarea>
						</div>

						<div class="develop-section">
							<span class="develop-label">Tension / Conflict</span>
							<textarea
								class="develop-textarea"
								value={scene.content}
								oninput={(e) => onUpdateScene?.(scene.id, { content: e.currentTarget.value })}
								placeholder="What drives this scene forward?"
								rows="3"
							></textarea>
						</div>

						<div class="develop-section">
							<span class="develop-label">Outcome / Shift</span>
							<textarea
								class="develop-textarea"
								value={scene.notes}
								oninput={(e) => onUpdateScene?.(scene.id, { notes: e.currentTarget.value })}
								placeholder="What is different by the end of this scene?"
								rows="2"
							></textarea>
						</div>
					</div>

					<div class="develop-row">
						<div class="develop-section develop-section--half">
							<span class="develop-label">Status</span>
							<span class="status-badge status-badge--{inferStatus(scene)}">{STATUS_LABELS[inferStatus(scene)]}</span>
						</div>
						<div class="develop-section develop-section--half">
							<span class="develop-label">Word Count</span>
							<span class="develop-value">{scene.wordCount > 0 ? scene.wordCount.toLocaleString() : '—'}</span>
						</div>
					</div>
				</div>
			{:else}
				<div class="scene-overview">
					<h3>Scene Overview</h3>
					<div class="overview-content">
						<p>Select a scene to develop its purpose, summary, and structural notes.</p>
						<div class="scene-metrics">
							<div class="metric">
								<span class="label">Scenes</span>
								<span class="value">{sortedScenes.length}</span>
							</div>
							<div class="metric">
								<span class="label">Total Words</span>
								<span class="value">{sortedScenes.reduce((sum: number, s: Scene) => sum + s.wordCount, 0).toLocaleString()}</span>
							</div>
							<div class="metric">
								<span class="label">Drafted</span>
								<span class="value">{sortedScenes.filter((s: Scene) => inferStatus(s) !== 'planned').length}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/snippet}
</WorkspaceBoardShell>

<style>
	.column-label {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	/* ── Empty State ── */

	.scenes-empty {
		text-align: center;
		max-width: 36ch;
	}

	.scenes-empty h2 {
		font-size: var(--text-xl);
		font-weight: var(--font-weight-medium);
		margin: 0 0 var(--space-2);
	}

	.scenes-empty p {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-4);
		line-height: 1.6;
	}

	.create-first-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: var(--color-primary);
		color: var(--color-text-on-primary, #fff);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.create-first-btn:hover {
		opacity: 0.9;
	}

	/* ── Scene List ── */

	.scene-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.scene-slot {
		border-radius: var(--radius-md);
		transition: box-shadow 0.15s ease;
	}

	.scene-slot.drag-over {
		box-shadow: 0 -2px 0 0 var(--color-primary);
	}

	.add-scene-btn {
		display: flex;
		padding: var(--space-4);
		background: transparent;
		border: 1px dashed var(--color-border-subtle);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		align-items: center;
		justify-content: center;
		color: var(--color-text-secondary);
	}

	.add-scene-btn:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-sunken);
	}

	/* ── Context Panel ── */

	.scene-context-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: 100%;
	}

	.scene-develop {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.develop-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.develop-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.develop-section--half {
		flex: 1;
	}

	.develop-row {
		display: flex;
		gap: var(--space-4);
	}

	.develop-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.develop-textarea {
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		background: var(--color-surface-sunken);
		border: 1px solid var(--color-border-subtle);
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.5;
		width: 100%;
		transition: border-color var(--duration-base) var(--ease-standard);
	}

	.develop-textarea:focus {
		border-color: var(--color-border-focus);
		outline: none;
	}

	.develop-value {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	/* ── Status Badge ── */

	.status-badge {
		display: inline-block;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full, 9999px);
		width: fit-content;
	}

	.status-badge--planned {
		background: var(--color-surface-sunken);
		color: var(--color-text-muted);
	}

	.status-badge--drafted {
		background: color-mix(in srgb, var(--color-warning, #f59e0b) 15%, transparent);
		color: var(--color-warning, #f59e0b);
	}

	.status-badge--complete {
		background: color-mix(in srgb, var(--color-success, #22c55e) 15%, transparent);
		color: var(--color-success, #22c55e);
	}

	/* ── Overview ── */

	.scene-overview {
		background: var(--color-surface-raised);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	.scene-overview h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		margin: 0 0 var(--space-3);
	}

	.overview-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.overview-content p {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.5;
	}

	.scene-metrics {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
	}

	.metric {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.metric .label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.metric .value {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}
</style>
