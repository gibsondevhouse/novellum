<script lang="ts">
	import { page } from '$app/state';
	import { translator } from '$lib/i18n';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.thread-notes.title')}</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	{projectId}
	topSection="plot-threads"
	activeId="notes"
	breadcrumbHref={`/projects/${projectId}/world-building/plot-threads`}
	breadcrumbLabel={$translator('worldbuilding.placeholder.threadNotes.breadcrumb')}
	heading={$translator('worldbuilding.placeholder.threadNotes.heading')}
	emptyTitle={$translator('worldbuilding.placeholder.threadNotes.emptyTitle')}
	emptyDescription={$translator('worldbuilding.placeholder.threadNotes.emptyDescription')}
	subNavLabel={$translator('worldbuilding.aria.threadsSections')}
/>
