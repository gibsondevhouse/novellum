<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Chronicle Notes — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="timeline"
	activeId="notes"
	breadcrumbHref={`/projects/${projectId}/world-building/timeline`}
	breadcrumbLabel="Chronicles"
	heading="Notes"
	emptyTitle="No chronicle notes yet"
	emptyDescription="Capture temporal fragments before assigning them to eras, key events, or personal histories."
	subNavLabel="Chronicles sections"
/>