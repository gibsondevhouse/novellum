<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Thread Notes — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="plot-threads"
	activeId="notes"
	breadcrumbHref={`/projects/${projectId}/world-building/plot-threads`}
	breadcrumbLabel="Threads"
	heading="Notes"
	emptyTitle="No thread notes yet"
	emptyDescription="Capture unsorted plot fragments before assigning them to major arcs, sub-plots, or motivations."
	subNavLabel="Threads sections"
/>