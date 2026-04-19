<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Key Events — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="timeline"
	activeId="key-events"
	breadcrumbHref={`/projects/${projectId}/world-building/timeline`}
	breadcrumbLabel="Chronicles"
	heading="Key Events"
	emptyTitle="No key events yet"
	emptyDescription="Track turning points that redefine eras, alliances, and stakes across your timeline."
	subNavLabel="Chronicles sections"
/>