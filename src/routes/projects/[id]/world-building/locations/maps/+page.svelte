<script lang="ts">
	import { page } from '$app/state';
	import { translator } from '$lib/i18n';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.maps.title')}</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	{projectId}
	topSection="locations"
	activeId="maps"
	breadcrumbHref={`/projects/${projectId}/world-building/locations`}
	breadcrumbLabel={$translator('worldbuilding.placeholder.maps.breadcrumb')}
	heading={$translator('worldbuilding.placeholder.maps.heading')}
	emptyTitle={$translator('worldbuilding.placeholder.maps.emptyTitle')}
	emptyDescription={$translator('worldbuilding.placeholder.maps.emptyDescription')}
	subNavLabel={$translator('worldbuilding.aria.atlasSections')}
/>
