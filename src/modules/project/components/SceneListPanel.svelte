<script lang="ts">
	import type { Scene } from '$lib/db/types.js';
	import { goto } from '$app/navigation';
	import { EmptyStatePanel, GhostButton, SectionHeader, SurfaceCard } from '$lib/components/ui/index.js';

	interface Props {
		projectId: string;
		scenes: Scene[];
	}

	let { projectId, scenes }: Props = $props();

	function openScene(scene: Scene) {
		goto(`/projects/${projectId}/editor/${scene.id}`);
	}
</script>

<section class="scene-list" aria-label="Scenes in chapter">
	<SectionHeader
		title="Scenes"
		description="Open a scene to write or revise it in the editor."
	/>

	{#if scenes.length === 0}
		<EmptyStatePanel
			title="No scenes yet"
			description="Create a scene from the editor to start drafting prose."
		>
			{#snippet actions()}
				<GhostButton type="button" onclick={() => goto(`/projects/${projectId}/editor`)}>
					Open editor
				</GhostButton>
			{/snippet}
		</EmptyStatePanel>
	{:else}
		<ul class="scene-list__grid">
			{#each scenes as scene (scene.id)}
				<li>
					<SurfaceCard class="scene-card">
						<button
							class="scene-card__open"
							type="button"
							onclick={() => openScene(scene)}
							aria-label="Open scene {scene.title} in editor"
						>
							<h4 class="scene-card__title">{scene.title || 'Untitled scene'}</h4>
							{#if scene.summary}
								<p class="scene-card__summary">{scene.summary}</p>
							{/if}
							<p class="scene-card__meta">{scene.wordCount ?? 0} words</p>
						</button>
					</SurfaceCard>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.scene-list {
		display: grid;
		gap: var(--space-4);
	}

	.scene-list__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-3);
		list-style: none;
		padding: 0;
		margin: 0;
	}

	:global(.scene-card) {
		display: block;
	}

	.scene-card__open {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
		padding: var(--space-4);
	}

	.scene-card__open:focus-visible {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: 4px;
		border-radius: var(--radius-sm);
	}

	.scene-card__title {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2) 0;
	}

	.scene-card__summary {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-2) 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.scene-card__meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}
</style>
