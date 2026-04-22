<script lang="ts">
	import { page } from '$app/state';
	import { translator } from '$lib/i18n';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.personal-histories.title')}</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	{projectId}
	topSection="timeline"
	activeId="personal-histories"
	breadcrumbHref={`/projects/${projectId}/world-building/timeline`}
	breadcrumbLabel={$translator('worldbuilding.placeholder.personalHistories.breadcrumb')}
	heading={$translator('worldbuilding.placeholder.personalHistories.heading')}
	emptyTitle={$translator('worldbuilding.placeholder.personalHistories.emptyTitle')}
	emptyDescription={$translator('worldbuilding.placeholder.personalHistories.emptyDescription')}
	subNavLabel={$translator('worldbuilding.aria.chroniclesSections')}
/>
