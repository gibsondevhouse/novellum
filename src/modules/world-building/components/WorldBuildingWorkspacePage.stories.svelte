<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WorldBuildingWorkspacePage from './WorldBuildingWorkspacePage.svelte';
	import WorldBuildingWorkspaceEmptyState from './WorldBuildingWorkspaceEmptyState.svelte';

	const { Story } = defineMeta({
		title: 'Worldbuilding/WorkspacePage',
		component: WorldBuildingWorkspacePage,
		tags: ['autodocs'],
	});

	const options = [
		{ id: 'arc-1', name: 'Major Arc A', subtitle: 'Major Arc', meta: 'Drafted' },
		{ id: 'arc-2', name: 'Major Arc B', subtitle: 'Major Arc', meta: 'No details yet' }
	];
</script>

<Story name="With Selection">
	<WorldBuildingWorkspacePage
		projectId="storybook-project"
		topSection="plot-threads"
		activeId="major-arcs"
		ariaLabel="Threads sections"
		{options}
		selectedId="arc-1"
		onSelect={() => {}}
		onCreate={() => {}}
		hasSelection={true}
		listAriaLabel="Major Arcs"
		createLabel="new +"
	>
		{#snippet dossier()}
			<section style="padding:var(--space-6);display:grid;gap:var(--space-3);">
				<h2 style="margin:0;font-size:var(--text-xl);">Major Arc A</h2>
				<p style="margin:0;color:var(--color-text-secondary);">Causality spine for the primary narrative pressure.</p>
			</section>
		{/snippet}
		{#snippet empty()}
			<WorldBuildingWorkspaceEmptyState title="No entries yet." description="Add records to begin." />
		{/snippet}
	</WorldBuildingWorkspacePage>
</Story>

<Story name="Empty">
	<WorldBuildingWorkspacePage
		projectId="storybook-project"
		topSection="plot-threads"
		activeId="major-arcs"
		ariaLabel="Threads sections"
		options={[]}
		selectedId={null}
		onSelect={() => {}}
		onCreate={() => {}}
		hasSelection={false}
		listAriaLabel="Major Arcs"
		createLabel="new +"
	>
		{#snippet dossier()}{/snippet}
		{#snippet empty()}
			<WorldBuildingWorkspaceEmptyState
				title="No major arcs yet."
				description="Start with 1-3 primary causal chains."
				actionLabel="+ Add your first arc"
				onAction={() => {}}
			/>
		{/snippet}
	</WorldBuildingWorkspacePage>
</Story>
