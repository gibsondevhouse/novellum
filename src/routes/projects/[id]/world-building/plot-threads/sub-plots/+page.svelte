<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Sub-plots — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="plot-threads"
	activeId="sub-plots"
	breadcrumbHref={`/projects/${projectId}/world-building/plot-threads`}
	breadcrumbLabel="Threads"
	heading="Sub-plots"
	emptyTitle="No sub-plots yet"
	emptyDescription="Track secondary narrative movements that enrich or challenge your major arcs."
	subNavLabel="Threads sections"
/>