<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Atlas Notes — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="locations"
	activeId="notes"
	breadcrumbHref={`/projects/${projectId}/world-building/locations`}
	breadcrumbLabel="Atlas"
	heading="Notes"
	emptyTitle="No atlas notes yet"
	emptyDescription="Capture rough spatial ideas before sorting them into realms, landmarks, or map assets."
	subNavLabel="Atlas sections"
/>