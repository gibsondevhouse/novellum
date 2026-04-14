<script lang="ts">
	import ConsistencyPanel from '$modules/consistency/components/ConsistencyPanel.svelte';
	import PromptEditor from '$modules/continuity/components/PromptEditor.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { Project } from '$lib/db/types';

	let { data } = $props<{ data: { projectId: string; project: Project } }>();

	let activeTab = $state<'issues' | 'styles' | 'prompts'>('issues');
</script>

<svelte:head>
	<title>Continuity — Novellum</title>
</svelte:head>

<div class="continuity">
	<nav class="tab-bar" aria-label="Continuity sections">
		<button class="tab" class:active={activeTab === 'issues'} onclick={() => (activeTab = 'issues')}
			>Issues</button
		>
		<button
			class="tab"
			class:active={activeTab === 'styles'}
			onclick={() => (activeTab = 'styles')}
		>
			Writing Styles
		</button>
		<button
			class="tab"
			class:active={activeTab === 'prompts'}
			onclick={() => (activeTab = 'prompts')}
		>
			Prompts
		</button>
	</nav>

	{#if activeTab === 'issues'}
		<ConsistencyPanel projectId={data.projectId} />
	{:else if activeTab === 'styles'}
		<EmptyState
			title="Writing Styles"
			description="Define tone, voice, and POV constraints for this project. Styles will be available to writing agents and consistency checks in future updates."
		/>
	{:else if activeTab === 'prompts'}
		<PromptEditor project={data.project} />
	{/if}
</div>

<style>
	.continuity {
		padding: var(--space-4) 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.tab-bar {
		display: flex;
		gap: var(--space-1);
		border-bottom: 1px solid var(--color-border-default);
	}
	.tab {
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: var(--transition-color);
	}
	.tab:hover {
		color: var(--color-text-primary);
	}
	.tab.active {
		color: var(--color-text-primary);
		border-bottom-color: var(--color-teal);
	}
</style>
