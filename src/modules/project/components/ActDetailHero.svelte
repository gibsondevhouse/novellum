<script lang="ts">
	import type { Act } from '$lib/db/domain-types';
	import { GhostButton, WorkspaceHero } from '$lib/components/ui/index.js';

	interface Props {
		act: Act;
		projectId: string;
		arcSegment: string;
	}

	let { act, projectId, arcSegment }: Props = $props();
</script>

<WorkspaceHero
	eyebrow="ACT"
	title={act.title || 'Untitled act'}
	description={act.planningNotes || 'Plan chapters and beats inside this act.'}
>
	{#snippet actions()}
		<GhostButton type="button" onclick={() => history.back()} aria-label="Back to arc detail">
			← Back
		</GhostButton>
		<a class="hero-link" href={`/projects/${projectId}/arcs/${arcSegment}`}>Arc detail</a>
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
