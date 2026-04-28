<script lang="ts">
	import type { Chapter } from '$lib/db/types.js';
	import { GhostButton, WorkspaceHero } from '$lib/components/ui/index.js';

	interface Props {
		chapter: Chapter;
		projectId: string;
		arcSegment: string;
		actSegment: string;
	}

	let { chapter, projectId, arcSegment, actSegment }: Props = $props();
</script>

<WorkspaceHero
	eyebrow="CHAPTER"
	title={chapter.title || 'Untitled chapter'}
	description={chapter.summary || 'Open a scene in the editor to draft prose.'}
>
	{#snippet actions()}
		<GhostButton type="button" onclick={() => history.back()} aria-label="Back to act detail">
			← Back
		</GhostButton>
		<a class="hero-link" href={`/projects/${projectId}/arcs/${arcSegment}/acts/${actSegment}`}>
			Act detail
		</a>
		<a class="hero-link" href={`/projects/${projectId}/arcs/${arcSegment}`}>Arc detail</a>
	{/snippet}
</WorkspaceHero>

<style>
	.hero-link {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		text-decoration: none;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		transition: background-color var(--duration-fast) var(--ease-standard);
	}

	.hero-link:hover {
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, transparent);
		color: var(--color-text-primary);
	}
</style>
