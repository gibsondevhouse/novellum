<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Archive Notes — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="lore"
	activeId="notes"
	breadcrumbHref={`/projects/${projectId}/world-building/lore`}
	breadcrumbLabel="The Archive"
	heading="Notes"
	emptyTitle="No archive notes yet"
	emptyDescription="Hold raw fragments of myth, tech, and tradition before formalizing them in The Archive."
	subNavLabel="Archive sections"
/>