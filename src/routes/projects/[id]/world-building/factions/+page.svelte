<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Factions — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="characters"
	activeId="factions"
	breadcrumbHref={`/projects/${projectId}/world-building/characters`}
	breadcrumbLabel="Personae"
	heading="Factions"
	emptyTitle="No factions yet"
	emptyDescription="Faction records define social and political bodies within Personae."
	subNavLabel="Personae sections"
/>