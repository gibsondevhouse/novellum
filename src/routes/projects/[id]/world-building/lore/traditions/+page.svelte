<script lang="ts">
	import { page } from '$app/state';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Traditions — Novellum</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	projectId={projectId}
	topSection="lore"
	activeId="traditions"
	breadcrumbHref={`/projects/${projectId}/world-building/lore`}
	breadcrumbLabel="The Archive"
	heading="Traditions"
	emptyTitle="No traditions yet"
	emptyDescription="Track rituals, inherited customs, and displaced cultural memory preserved across generations."
	subNavLabel="Archive sections"
/>