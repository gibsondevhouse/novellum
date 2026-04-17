<script lang="ts">
	import type { Chapter, Scene } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import WorkspaceBoardShell from './WorkspaceBoardShell.svelte';
	import ChapterHeader from './ChapterHeader.svelte';
	import SceneCard from './SceneCard.svelte';

	let {
		chapter,
		projectId,
		onUpdateChapter,
		onDeleteChapter,
		onCreateScene,
		onUpdateScene,
		onDeleteScene,
	} = $props<{
		chapter: ChapterWithScenes | null;
		projectId: string;
		onUpdateChapter?: (id: string, changes: Partial<Chapter>) => void;
		onDeleteChapter?: (id: string) => void;
		onCreateScene?: (chapterId: string) => void;
		onUpdateScene?: (id: string, changes: Partial<Scene>) => void;
		onDeleteScene?: (id: string) => void;
	}>();

	/** Scenes for this chapter, sorted by order. */
	const chapterScenes = $derived(
		(chapter?.scenes ?? []).slice().sort((a: Scene, b: Scene) => a.order - b.order),
	);

	let selectedSceneId = $state<string | null>(null);
	const selectedScene = $derived(chapterScenes.find((s: Scene) => s.id === selectedSceneId) ?? null);

	function selectScene(id: string) {
		selectedSceneId = selectedSceneId === id ? null : id;
	}

	function addScene() {
		if (!chapter) return;
		onCreateScene?.(chapter.id);
	}

	function deleteScene(id: string) {
		if (selectedSceneId === id) selectedSceneId = null;
		onDeleteScene?.(id);
	}

	function handleBackdropClick() {
		selectedSceneId = null;
	}
</script>

<WorkspaceBoardShell
	showEmpty={!chapter}
	onBackdropClick={handleBackdropClick}
>
	{#snippet empty()}
		<h2>No Chapter Selected</h2>
		<p>Select a chapter from the header or create a new one to begin building the manuscript.</p>
	{/snippet}

	{#snippet header()}
		<ChapterHeader chapter={chapter!} {onUpdateChapter} {onDeleteChapter} />
	{/snippet}

	{#snippet columnHeaders()}
		<h3 class="column-label">Scenes</h3>
		<h3 class="column-label">Details</h3>
	{/snippet}

	{#snippet main()}
		<div class="scene-sequence">
			<div class="scenes">
				{#each chapterScenes as scene (scene.id)}
					<SceneCard
						{scene}
						selected={selectedSceneId === scene.id}
						onSelect={() => selectScene(scene.id)}
						onUpdateTitle={(value) => onUpdateScene?.(scene.id, { title: value })}
						onUpdateSummary={(value) => onUpdateScene?.(scene.id, { summary: value })}
					/>
				{/each}
				{#if chapterScenes.length === 0}
					<div class="empty-scenes">
						<p class="empty-heading">Build this chapter's content</p>
						<p class="empty-body">Add scenes to define what the reader experiences in this chapter. Each scene is a continuous unit of action, dialogue, or reflection.</p>
					</div>
				{/if}
				<button class="add-scene-btn" onclick={addScene}>
					+ Add Scene
				</button>
			</div>
		</div>
	{/snippet}

	{#snippet sidebar()}
		<div class="chapter-context-panel">
			{#if selectedScene}
				<div class="scene-detail">
					<div class="detail-header">
						<h4 class="detail-title">{selectedScene.title}</h4>
						<button class="delete-scene-btn" onclick={() => deleteScene(selectedScene.id)} aria-label="Delete scene">×</button>
					</div>

					<div class="detail-section">
						<span class="detail-label">Summary</span>
						<textarea
							class="detail-textarea"
							value={selectedScene.summary}
							oninput={(e) => onUpdateScene?.(selectedScene.id, { summary: e.currentTarget.value })}
							placeholder="Describe what happens in this scene..."
							rows="3"
						></textarea>
					</div>

					<div class="detail-section">
						<span class="detail-label">Word Count</span>
						<span class="detail-value">{selectedScene.wordCount > 0 ? selectedScene.wordCount.toLocaleString() : '—'}</span>
					</div>

					{#if selectedScene.povCharacterId}
						<div class="detail-section">
							<span class="detail-label">POV Character</span>
							<span class="detail-value">{selectedScene.povCharacterId}</span>
						</div>
					{/if}
				</div>
			{:else}
				<div class="chapter-overview">
					<h3>Chapter Overview</h3>
					<div class="overview-content">
						<p>{chapterScenes.length === 0 ? 'Add scenes to start shaping this chapter.' : 'Select a scene to view and edit its details.'}</p>
						<div class="chapter-metrics">
							<div class="metric">
								<span class="label">Scenes</span>
								<span class="value">{chapterScenes.length}</span>
							</div>
							<div class="metric">
								<span class="label">Word Count</span>
								<span class="value">{chapterScenes.reduce((sum: number, s: Scene) => sum + s.wordCount, 0).toLocaleString()}</span>
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

	.scene-sequence {
		--card-row-height: 148px;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.scenes {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.empty-scenes {
		text-align: center;
		padding: var(--space-6) var(--space-4);
		color: var(--color-text-secondary);
	}

	.empty-heading {
		font-size: var(--text-md);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2);
	}

	.empty-body {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
		max-width: 36ch;
		margin-inline: auto;
		line-height: 1.6;
	}

	.add-scene-btn {
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

	.add-scene-btn:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-sunken);
	}

	/* ── Context Panel ── */

	.chapter-context-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: 100%;
	}

	.scene-detail {
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
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	.delete-scene-btn {
		background: transparent;
		border: 1px solid transparent;
		color: var(--color-text-tertiary);
		font-size: var(--text-lg);
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		line-height: 1;
		transition: color 0.15s ease, background 0.15s ease;
	}

	.delete-scene-btn:hover {
		color: var(--color-danger, #ef4444);
		background: var(--color-surface-hover);
	}

	.detail-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.detail-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.detail-textarea {
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

	.detail-textarea:focus {
		border-color: var(--color-border-focus);
		outline: none;
	}

	.detail-value {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	/* ── Overview ── */

	.chapter-overview {
		background: var(--color-surface-raised);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	.chapter-overview h3 {
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

	.chapter-metrics {
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
