<!--
	Plan-038 — Author Draft Engine v1 (Outline → Scene Drafts → Explicit Apply)

	Client-orchestrated chapter runner:
	- Loops ordered scenes in the active chapter.
	- Generates one persisted author-draft checkpoint per scene (review artifact only).
	- Never writes to scenes.content without explicit Accept on a checkpoint card.
-->
<script lang="ts">
	import type { Scene } from '$lib/db/domain-types.js';
	import type { AuthorDraftCheckpoint } from '$lib/ai/pipeline/author-draft-contract.js';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import { toast } from '$lib/stores/toast.svelte.js';
	import {
		fetchScenesForChapter,
		generateSceneDraftCheckpoint,
		listAuthorDraftCheckpoints,
	} from '../services/author-draft-api.js';
	import NovaAuthorDraftCheckpointCard from './NovaAuthorDraftCheckpointCard.svelte';
	import NovaOutlineGenerationPanel from './NovaOutlineGenerationPanel.svelte';

	interface Props {
		projectId?: string | null;
		activeChapterId?: string | null;
	}

	let { projectId = null, activeChapterId = null }: Props = $props();

	type RunnerState = 'idle' | 'generating' | 'aborted' | 'failed' | 'done';

	let scenes = $state<Scene[]>([]);
	let checkpoints = $state<AuthorDraftCheckpoint[]>([]);
	let loading = $state(false);
	let loadError = $state<string | null>(null);

	let runnerState = $state<RunnerState>('idle');
	let runnerError = $state<string | null>(null);
	let regenerateExisting = $state(false);
	let activeIndex = $state(0);
	let generatedCount = $state(0);
	let totalToGenerate = $state(0);
	let abortController = $state<AbortController | null>(null);

	const orderedScenes = $derived.by(() => {
		return [...scenes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	});

	function upsertCheckpoint(next: AuthorDraftCheckpoint): void {
		const existingIndex = checkpoints.findIndex((c) => c.id === next.id);
		if (existingIndex >= 0) {
			checkpoints[existingIndex] = next;
			return;
		}
		checkpoints = [next, ...checkpoints];
	}

	function bestCheckpointForScene(sceneId: string): AuthorDraftCheckpoint | null {
		const candidates = checkpoints.filter((c) => c.sceneId === sceneId);
		if (candidates.length === 0) return null;

		const rank: Record<AuthorDraftCheckpoint['lifecycle'], number> = {
			review: 0,
			accepted: 1,
			rejected: 2,
		};

		return candidates
			.slice()
			.sort((a, b) => {
				const rankDiff = (rank[a.lifecycle] ?? 9) - (rank[b.lifecycle] ?? 9);
				if (rankDiff !== 0) return rankDiff;
				return b.updatedAt.localeCompare(a.updatedAt);
			})[0]!;
	}

	async function refresh(signal?: AbortSignal): Promise<void> {
		if (!projectId || !activeChapterId) {
			scenes = [];
			checkpoints = [];
			loadError = null;
			return;
		}

		loading = true;
		loadError = null;
		try {
			const [nextScenes, nextCheckpoints] = await Promise.all([
				fetchScenesForChapter(projectId, activeChapterId, signal),
				listAuthorDraftCheckpoints(projectId, { chapterId: activeChapterId }, signal),
			]);
			scenes = nextScenes;
			checkpoints = nextCheckpoints;
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load draft engine data.';
			loadError = message;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		const controller = new AbortController();
		void refresh(controller.signal);
		return () => controller.abort();
	});

	function abortRun(): void {
		abortController?.abort();
		abortController = null;
		if (runnerState === 'generating') runnerState = 'aborted';
	}

	async function runChapterDraft(): Promise<void> {
		if (!projectId) {
			toast('Open a project before drafting scenes.', 'error');
			return;
		}
		if (!activeChapterId) {
			toast('Select a chapter with scenes before running Draft chapter.', 'error');
			return;
		}

		runnerError = null;
		runnerState = 'generating';
		generatedCount = 0;

		const controller = new AbortController();
		abortController = controller;

		try {
			if (orderedScenes.length === 0) {
				await refresh(controller.signal);
			}
			if (orderedScenes.length === 0) {
				runnerState = 'failed';
				runnerError = 'No scenes found for this chapter.';
				return;
			}

			const scenesToGenerate = regenerateExisting
				? orderedScenes
				: orderedScenes.filter((s) => {
						const existing = bestCheckpointForScene(s.id);
						return !(existing && existing.lifecycle === 'review');
					});

			totalToGenerate = scenesToGenerate.length;

			for (let i = 0; i < scenesToGenerate.length; i++) {
				if (controller.signal.aborted) {
					runnerState = 'aborted';
					return;
				}

				activeIndex = i;
				const scene = scenesToGenerate[i]!;

				const result = await generateSceneDraftCheckpoint(projectId, scene.id, {
					forceRegenerate: regenerateExisting,
					signal: controller.signal,
				});
				upsertCheckpoint(result.checkpoint);
				generatedCount = i + 1;
			}

			runnerState = controller.signal.aborted ? 'aborted' : 'done';
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Scene drafting failed.';
			runnerState = 'failed';
			runnerError = message;
		} finally {
			abortController = null;
			void refresh(); // refresh ordering + superseded checkpoint states
		}
	}

	async function handleRegenerate(sceneId: string): Promise<void> {
		if (!projectId) return;
		try {
			const { checkpoint } = await generateSceneDraftCheckpoint(projectId, sceneId, {
				forceRegenerate: true,
			});
			upsertCheckpoint(checkpoint);
			toast('Regenerated draft checkpoint.', 'success');
			void refresh();
		} catch (err) {
			toast(err instanceof Error ? err.message : 'Regeneration failed.', 'error');
		}
	}
</script>

<section class="author-draft-engine" aria-label="Draft engine" data-testid="author-draft-engine">
	<NovaOutlineGenerationPanel {projectId} />

	<header class="engine-header">
		<div class="engine-title">
			<p class="engine-eyebrow">Draft engine</p>
			<p class="engine-subtitle">Outline → scene drafts → explicit apply</p>
		</div>

		<div class="engine-controls">
			<label class="engine-checkbox">
				<input type="checkbox" bind:checked={regenerateExisting} disabled={runnerState === 'generating'} />
				<span>Regenerate</span>
			</label>

			{#if runnerState === 'generating'}
				<button type="button" class="engine-btn engine-btn-secondary" onclick={abortRun}>
					Abort
				</button>
			{:else}
				<button
					type="button"
					class="engine-btn engine-btn-primary"
					disabled={!projectId || !activeChapterId || loading}
					onclick={() => void runChapterDraft()}
				>
					Draft chapter
				</button>
			{/if}
		</div>
	</header>

	{#if !projectId}
		<EmptyStatePanel title="Open a project to draft scenes." description="Draft engine requires an active project and chapter." />
	{:else if !activeChapterId}
		<EmptyStatePanel title="Select a chapter to draft." description="Pick a chapter that contains outlined scenes." />
	{:else if loading}
		<p class="engine-muted">Loading…</p>
	{:else if loadError}
		<p class="engine-error">{loadError}</p>
	{:else if orderedScenes.length === 0}
		<EmptyStatePanel title="No scenes in this chapter." description="Add scenes in Outline, then retry Draft chapter." />
	{:else}
		{#if runnerState === 'generating'}
			<p class="engine-muted" aria-live="polite">
				Generating {generatedCount + 1} of {totalToGenerate}…
			</p>
		{:else if runnerState === 'aborted'}
			<p class="engine-muted" aria-live="polite">Aborted. Saved drafts remain available below.</p>
		{:else if runnerState === 'failed' && runnerError}
			<p class="engine-error" aria-live="polite">{runnerError}</p>
		{:else if runnerState === 'done'}
			<p class="engine-muted" aria-live="polite">Draft run complete. Review and apply below.</p>
		{/if}

		<div class="engine-list" aria-label="Scene drafts">
			{#each orderedScenes as scene (scene.id)}
				<NovaAuthorDraftCheckpointCard
					{scene}
					projectId={projectId}
					checkpoint={bestCheckpointForScene(scene.id)}
					isGenerating={runnerState === 'generating' && orderedScenes[activeIndex]?.id === scene.id}
					onRegenerate={() => void handleRegenerate(scene.id)}
					onCheckpointUpdated={(cp) => upsertCheckpoint(cp)}
				/>
			{/each}
		</div>
	{/if}
</section>

<style>
	.author-draft-engine {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-2) 0;
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-default) 86%, transparent);
	}

	.engine-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.engine-title {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.engine-eyebrow {
		margin: 0;
		font-size: 11px;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--color-text-muted) 82%, var(--color-candle));
	}

	.engine-subtitle {
		margin: 0;
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.engine-controls {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.engine-checkbox {
		display: inline-flex;
		gap: 6px;
		align-items: center;
		font-size: 12px;
		color: var(--color-text-secondary);
		user-select: none;
	}

	.engine-btn {
		font: inherit;
		padding: 6px 10px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.engine-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.engine-btn-primary {
		border-color: color-mix(in srgb, var(--color-candle) 72%, var(--color-border-default));
	}

	.engine-btn-secondary {
		border-color: color-mix(in srgb, var(--color-error) 64%, var(--color-border-default));
	}

	.engine-muted {
		margin: 0;
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.engine-error {
		margin: 0;
		font-size: 12px;
		color: var(--color-error);
	}

	.engine-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-bottom: var(--space-2);
	}
</style>
