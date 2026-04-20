<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import IndividualsWorkspaceShell from '$modules/bible/components/IndividualsWorkspaceShell.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Maps — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav
		projectId={projectId}
		topSection="locations"
		activeId="maps"
		ariaLabel="Atlas sections"
	/>
	<IndividualsWorkspaceShell
		characterOptions={[]}
		selectedCharacterId={null}
		onSelectCharacter={() => {}}
		onCreateCharacter={() => {}}
		hasSelection={false}
		listAriaLabel="Maps"
		createLabel="new +"
	>
		{#snippet empty()}
			<div class="entity-empty">
				<p>Store spatial references, local-first map assets, and geographic overlays for Atlas navigation.</p>
			</div>
		{/snippet}
	</IndividualsWorkspaceShell>
</div>

<style>
	.entity-empty {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		color: var(--color-text-muted);
		text-align: center;
	}
</style>
