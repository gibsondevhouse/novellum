<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Personae Notes — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="characters"
	activeId="notes"
	breadcrumbHref={`/projects/${projectId}/world-building/characters`}
	breadcrumbLabel="Personae"
	heading="Notes"
	emptyTitle="No personae notes yet"
	emptyDescription="Capture unsorted character ideas before assigning them to individuals, factions, or lineages."
	subNavLabel="Personae sections"
/>