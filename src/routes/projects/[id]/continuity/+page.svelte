<script lang="ts">
	import ConsistencyPanel from '$modules/consistency/components/ConsistencyPanel.svelte';

	let { data } = $props<{ data: { projectId: string } }>();

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
			class="tab tab--locked"
			class:active={activeTab === 'styles'}
			onclick={() => (activeTab = 'styles')}
		>
			Writing Styles <span class="tab-badge">Soon</span>
		</button>
		<button
			class="tab tab--locked"
			class:active={activeTab === 'prompts'}
			onclick={() => (activeTab = 'prompts')}
		>
			Prompts <span class="tab-badge">Soon</span>
		</button>
	</nav>

	{#if activeTab === 'issues'}
		<ConsistencyPanel projectId={data.projectId} />
	{:else if activeTab === 'styles'}
		<div class="continuity-stub">
			<h3 class="continuity-stub__title">Writing Styles</h3>
			<p class="continuity-stub__description">
				Define tone, voice, and POV constraints for this project. Styles will be available to
				writing agents and consistency checks.
			</p>
			<span class="continuity-stub__badge">Coming soon</span>
		</div>
	{:else}
		<div class="continuity-stub">
			<div class="continuity-stub__grid">
				<div class="continuity-stub__card">
					<h4 class="continuity-stub__card-title">System Prompt</h4>
					<p class="continuity-stub__card-desc">
						Project-level context injected into all AI operations.
					</p>
				</div>
				<div class="continuity-stub__card">
					<h4 class="continuity-stub__card-title">Negative Prompt</h4>
					<p class="continuity-stub__card-desc">
						Content and style restrictions for all AI generations.
					</p>
				</div>
			</div>
			<span class="continuity-stub__badge">Coming soon</span>
		</div>
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
	.tab--locked {
		opacity: 0.6;
	}
	.tab-badge {
		font-size: var(--text-xs);
		padding: 1px var(--space-2);
		background: var(--color-surface-overlay);
		border-radius: var(--radius-full);
		color: var(--color-text-muted);
		margin-left: var(--space-1);
	}
	.continuity-stub {
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
	.continuity-stub__title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		margin: 0;
	}
	.continuity-stub__description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		max-width: 400px;
		margin: 0;
	}
	.continuity-stub__badge {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-3);
		background: var(--color-surface-overlay);
		border-radius: var(--radius-full);
		color: var(--color-text-muted);
	}
	.continuity-stub__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
		width: 100%;
		max-width: 500px;
	}
	.continuity-stub__card {
		padding: var(--space-5);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		text-align: left;
	}
	.continuity-stub__card-title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		margin: 0 0 var(--space-2);
	}
	.continuity-stub__card-desc {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}
</style>
