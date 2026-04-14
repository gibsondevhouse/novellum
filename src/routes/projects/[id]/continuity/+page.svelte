<script lang="ts">
	import ConsistencyPanel from '$modules/consistency/components/ConsistencyPanel.svelte';
	import PromptEditor from '$modules/continuity/components/PromptEditor.svelte';
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
		<div class="continuity-empty">
			<h3 class="continuity-empty__title">Writing Styles</h3>
			<p class="continuity-empty__description">
				Define tone, voice, and POV constraints for this project. Styles will be available to
				writing agents and consistency checks in future updates.
			</p>
		</div>
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
	.continuity-empty {
		padding: var(--space-8);
		background: var(--color-surface-raised);
		border-radius: var(--radius-md);
		opacity: 0.6;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		text-align: center;
	}
	.continuity-empty__title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		margin: 0;
	}
	.continuity-empty__description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		max-width: 400px;
		margin: 0;
	}
</style>
