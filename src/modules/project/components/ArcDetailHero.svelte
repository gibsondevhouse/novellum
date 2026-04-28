<script lang="ts">
	import type { Arc } from '$lib/db/domain-types';
	import { GhostButton, WorkspaceHero } from '$lib/components/ui/index.js';

	interface Props {
		arc: Arc;
		projectId: string;
	}

	let { arc, projectId }: Props = $props();
</script>

<WorkspaceHero
	eyebrow={arc.arcType ? arc.arcType.replace(/^custom:/, '').toUpperCase() : 'STORY ARC'}
	title={arc.title || 'Untitled arc'}
	description={arc.purpose || arc.description || ''}
>
	{#snippet actions()}
		<GhostButton type="button" onclick={() => history.back()} aria-label="Back to arcs index">
			← All arcs
		</GhostButton>
		<a class="hero-link" href={`/projects/${projectId}/arcs`}>Arcs index</a>
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
