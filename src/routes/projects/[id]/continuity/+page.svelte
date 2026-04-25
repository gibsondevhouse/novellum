<script lang="ts">
	import ConsistencyPanel from '$modules/consistency/components/ConsistencyPanel.svelte';
	import PromptEditor from '$modules/continuity/components/PromptEditor.svelte';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import SurfacePanel from '$lib/components/ui/SurfacePanel.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { getOpenCount } from '$modules/consistency/stores/consistency-store.svelte.js';
	import type { Project } from '$lib/db/types';

	let { data } = $props<{ data: { projectId: string; project: Project } }>();

	let activeTab = $state<'issues' | 'styles' | 'prompts'>('issues');

	const activeTabLabel = $derived.by(() => {
		switch (activeTab) {
			case 'issues':
				return 'Issue Triage';
			case 'styles':
				return 'Writing Styles';
			case 'prompts':
				return 'Prompt Settings';
		}
	});
</script>

<svelte:head>
	<title>Continuity — Novellum</title>
</svelte:head>

<div class="continuity">
	<PageHeader
		eyebrow="Continuity Command"
		title="Narrative Triage Center"
		description="Review structural issues, tune project-level constraints, and keep interventions grounded in verified context."
	>
		{#snippet meta()}
			<SurfacePanel>
				<div class="continuity-hero__metrics" aria-label="Continuity snapshot">
					<div>
						<span class="metric-label">Open Issues</span>
						<strong>{getOpenCount()}</strong>
					</div>
					<div>
						<span class="metric-label">Active View</span>
						<strong>{activeTabLabel}</strong>
					</div>
				</div>
			</SurfacePanel>
		{/snippet}
	</PageHeader>

	<div class="tab-bar" aria-label="Continuity sections">
		<button
			class="tab"
			class:active={activeTab === 'issues'}
			type="button"
			aria-current={activeTab === 'issues' ? 'true' : undefined}
			onclick={() => (activeTab = 'issues')}
		>
			Issues
		</button>
		<button
			class="tab"
			class:active={activeTab === 'styles'}
			type="button"
			aria-current={activeTab === 'styles' ? 'true' : undefined}
			onclick={() => (activeTab = 'styles')}
		>
			Writing Styles
		</button>
		<button
			class="tab"
			class:active={activeTab === 'prompts'}
			type="button"
			aria-current={activeTab === 'prompts' ? 'true' : undefined}
			onclick={() => (activeTab = 'prompts')}
		>
			Prompts
		</button>
	</div>

	{#if activeTab === 'issues'}
		<section id="continuity-panel-issues" aria-label="Issue triage">
			<ConsistencyPanel projectId={data.projectId} />
		</section>
	{:else if activeTab === 'styles'}
		<section id="continuity-panel-styles" aria-label="Writing styles">
			<SurfacePanel>
				<div class="styles-panel">
					<h2>Writing Styles</h2>
					<p>
						Style sets will let you pin tone, POV, and cadence constraints per project and per scene lane.
					</p>
					<EmptyStatePanel
						title="Style Profiles Are Coming"
						description="Use Prompt Settings for now to encode tone rules and forbidden patterns until style profiles are enabled."
					/>
				</div>
			</SurfacePanel>
		</section>
	{:else if activeTab === 'prompts'}
		<section id="continuity-panel-prompts" aria-label="Prompt settings">
			<PromptEditor project={data.project} />
		</section>
	{/if}
</div>

<style>
	.continuity {
		padding: var(--space-5) 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.continuity-hero__metrics {
		display: grid;
		gap: var(--space-3);
		height: 100%;
	}

	.metric-label {
		display: block;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.continuity-hero__metrics strong {
		font-size: var(--text-lg);
	}

	.styles-panel {
		display: grid;
		gap: var(--space-4);
	}

	.styles-panel h2,
	.styles-panel p {
		margin: 0;
	}

	.styles-panel p {
		color: var(--color-text-secondary);
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

	.tab:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.tab.active {
		color: var(--color-text-primary);
		border-bottom-color: var(--color-teal);
	}
</style>
