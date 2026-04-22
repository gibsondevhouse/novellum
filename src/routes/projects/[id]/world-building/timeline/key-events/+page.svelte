<script lang="ts">
	import { page } from '$app/state';
	import { translator } from '$lib/i18n';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.key-events.title')}</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	{projectId}
	topSection="timeline"
	activeId="key-events"
	breadcrumbHref={`/projects/${projectId}/world-building/timeline`}
	breadcrumbLabel={$translator('worldbuilding.placeholder.keyEvents.breadcrumb')}
	heading={$translator('worldbuilding.placeholder.keyEvents.heading')}
	emptyTitle={$translator('worldbuilding.placeholder.keyEvents.emptyTitle')}
	emptyDescription={$translator('worldbuilding.placeholder.keyEvents.emptyDescription')}
	subNavLabel={$translator('worldbuilding.aria.chroniclesSections')}
/>
