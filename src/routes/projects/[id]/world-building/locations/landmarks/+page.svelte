<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Landmarks — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="locations"
	activeId="landmarks"
	breadcrumbHref={`/projects/${projectId}/world-building/locations`}
	breadcrumbLabel="Atlas"
	heading="Landmarks"
	emptyTitle="No landmarks yet"
	emptyDescription="Add specific high-impact sites, monuments, and critical waypoints in your world."
	subNavLabel="Atlas sections"
/>