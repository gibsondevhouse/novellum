<script lang="ts">
	import type { Chapter, Scene } from '$lib/db/domain-types';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';

	type OutcomeType = 'win' | 'loss' | 'partial' | 'reversal' | '';

	type SceneDefinition = {
		sceneGoal: string;
		immediateObstacle: string;
		tensionSource: string;
		turningPoint: string;
		outcome: OutcomeType;
		startState: string;
		endState: string;
		draftStatus: string;
		lengthEstimate: string;
	};

	const EMPTY_DEFINITION: SceneDefinition = {
		sceneGoal: '',
		immediateObstacle: '',
		tensionSource: '',
		turningPoint: '',
		outcome: '',
		startState: '',
		endState: '',
		draftStatus: '',
		lengthEstimate: '',
	};

	interface Props {
		scenes: Scene[];
		chapters: Chapter[];
		activeSceneId: string | null;
		activeContent: string;
		activeSceneDefinition: SceneDefinition;
		onSceneSelect: (sceneId: string) => void;
	}

	let {
		scenes,
		chapters,
		activeSceneId,
		activeContent,
		activeSceneDefinition,
		onSceneSelect,
	}: Props = $props();

	function countWords(text: string): number {
		const normalized = text.replace(/<[^>]+>/g, ' ').trim();
		if (!normalized) return 0;
		return normalized.split(/\s+/).length;
	}

	function getScenePreviewMeta(scene: Scene): SceneDefinition {
		if (activeSceneId === scene.id) return activeSceneDefinition;
		return { ...EMPTY_DEFINITION };
	}
</script>

<aside class="doc-list" aria-label="Scene navigator">
	<div class="doc-list-header">
		<div class="doc-list-title">Draft Queue</div>
		<div class="doc-list-meta">{scenes.length} scenes · {chapters.length} chapters</div>
	</div>
	{#if scenes.length === 0}
		<EmptyStatePanel title="No scenes yet." />
	{:else}
		<ul class="scene-list">
			{#each scenes as scene (scene.id)}
				{@const sceneMeta = getScenePreviewMeta(scene)}
				{@const chapter = chapters.find((item: Chapter) => item.id === scene.chapterId)}
				{@const words = countWords(
					scene.id === activeSceneId ? activeContent : scene.content ?? '',
				)}
				<li>
					<button
						class="scene-item"
						class:active={activeSceneId === scene.id}
						onclick={() => onSceneSelect(scene.id)}
						aria-label={`Open scene ${scene.title}`}
					>
						<span class="scene-item-title">{scene.title}</span>
						<span class="scene-item-meta"
							>{chapter?.title ?? 'Unassigned chapter'} · {words} words</span
						>
						<span class="scene-item-tags">
							{#if sceneMeta.draftStatus}
								<span class="chip">{sceneMeta.draftStatus}</span>
							{/if}
							{#if sceneMeta.outcome}
								<span class="chip">{sceneMeta.outcome}</span>
							{/if}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</aside>

<style>
	.doc-list {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: var(--space-3);
		border-right: 1px solid var(--color-border-subtle);
		background: var(--color-surface-ground);
		min-width: 0;
	}

	.doc-list-header {
		padding: var(--space-2) 0 var(--space-3);
		margin-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.doc-list-title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.doc-list-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-1);
	}

	.scene-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.scene-item {
		width: 100%;
		text-align: left;
		background: none;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-2);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		transition:
			background-color 0.1s ease,
			color 0.1s ease;
	}

	.scene-item-title {
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.scene-item-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.scene-item-tags {
		display: flex;
		gap: var(--space-1);
		flex-wrap: wrap;
	}

	.chip {
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 999px;
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
	}

	.scene-item:hover {
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.scene-item.active {
		background-color: color-mix(in srgb, var(--color-teal) 10%, transparent);
		color: var(--color-teal);
		border-color: color-mix(in srgb, var(--color-teal) 30%, transparent);
	}
</style>
