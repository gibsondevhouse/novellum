<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Personal Histories — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="timeline"
	activeId="personal-histories"
	breadcrumbHref={`/projects/${projectId}/world-building/timeline`}
	breadcrumbLabel="Chronicles"
	heading="Personal Histories"
	emptyTitle="No personal histories yet"
	emptyDescription="Capture character-level timelines that may diverge from official era records."
	subNavLabel="Chronicles sections"
/>