<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Motivations — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="plot-threads"
	activeId="motivations"
	breadcrumbHref={`/projects/${projectId}/world-building/plot-threads`}
	breadcrumbLabel="Threads"
	heading="Motivations"
	emptyTitle="No motivations yet"
	emptyDescription="Log the why behind character and faction actions so threads remain coherent over time."
	subNavLabel="Threads sections"
/>