<script lang="ts">
	import { page } from '$app/state';
	import { translator } from '$lib/i18n';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.atlas-notes.title')}</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	{projectId}
	topSection="locations"
	activeId="notes"
	breadcrumbHref={`/projects/${projectId}/world-building/locations`}
	breadcrumbLabel={$translator('worldbuilding.placeholder.atlasNotes.breadcrumb')}
	heading={$translator('worldbuilding.placeholder.atlasNotes.heading')}
	emptyTitle={$translator('worldbuilding.placeholder.atlasNotes.emptyTitle')}
	emptyDescription={$translator('worldbuilding.placeholder.atlasNotes.emptyDescription')}
	subNavLabel={$translator('worldbuilding.aria.atlasSections')}
/>
