<script lang="ts">
	import { page } from '$app/state';
	import { translator } from '$lib/i18n';
	import WorldBuildingEmptyStatePage from '$modules/world-building/components/WorldBuildingEmptyStatePage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.chronicle-notes.title')}</title>
</svelte:head>

<WorldBuildingEmptyStatePage
	{projectId}
	topSection="timeline"
	activeId="notes"
	breadcrumbHref={`/projects/${projectId}/world-building/timeline`}
	breadcrumbLabel={$translator('worldbuilding.placeholder.chronicleNotes.breadcrumb')}
	heading={$translator('worldbuilding.placeholder.chronicleNotes.heading')}
	emptyTitle={$translator('worldbuilding.placeholder.chronicleNotes.emptyTitle')}
	emptyDescription={$translator('worldbuilding.placeholder.chronicleNotes.emptyDescription')}
	subNavLabel={$translator('worldbuilding.aria.chroniclesSections')}
/>
