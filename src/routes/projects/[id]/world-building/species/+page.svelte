<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Lineages — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="characters"
	activeId="lineages"
	breadcrumbHref={`/projects/${projectId}/world-building/characters`}
	breadcrumbLabel="Personae"
	heading="Lineages"
	emptyTitle="No lineages yet"
	emptyDescription="Lineage records capture ancestry and inherited identity threads."
	subNavLabel="Personae sections"
/>