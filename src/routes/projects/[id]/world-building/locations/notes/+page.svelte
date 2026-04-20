<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import IndividualsWorkspaceShell from '$modules/bible/components/IndividualsWorkspaceShell.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Atlas Notes — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav
		projectId={projectId}
		topSection="locations"
		activeId="notes"
		ariaLabel="Atlas sections"
	/>
	<IndividualsWorkspaceShell
		characterOptions={[]}
		selectedCharacterId={null}
		onSelectCharacter={() => {}}
		onCreateCharacter={() => {}}
		hasSelection={false}
		listAriaLabel="Atlas Notes"
		createLabel="new +"
	>
		{#snippet empty()}
			<div class="entity-empty">
				<p>Capture rough spatial ideas before sorting them into realms, landmarks, or map assets.</p>
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
