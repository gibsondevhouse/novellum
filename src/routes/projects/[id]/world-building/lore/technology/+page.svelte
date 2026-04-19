<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Technology — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="lore"
	activeId="technology"
	breadcrumbHref={`/projects/${projectId}/world-building/lore`}
	breadcrumbLabel="The Archive"
	heading="Technology"
	emptyTitle="No technology records yet"
	emptyDescription="Document systems, devices, and speculative mechanics that shape your world's capabilities."
	subNavLabel="Archive sections"
/>