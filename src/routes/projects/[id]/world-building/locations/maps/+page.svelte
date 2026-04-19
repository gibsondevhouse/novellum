<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Maps — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="locations"
	activeId="maps"
	breadcrumbHref={`/projects/${projectId}/world-building/locations`}
	breadcrumbLabel="Atlas"
	heading="Maps"
	emptyTitle="No maps yet"
	emptyDescription="Store spatial references, local-first map assets, and geographic overlays for Atlas navigation."
	subNavLabel="Atlas sections"
/>