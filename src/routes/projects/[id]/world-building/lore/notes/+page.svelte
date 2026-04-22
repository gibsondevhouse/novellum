<script lang="ts">
	import { page } from '$app/state';
	import { translator } from '$lib/i18n';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.archive-notes.title')}</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	{projectId}
	topSection="lore"
	activeId="notes"
	breadcrumbHref={`/projects/${projectId}/world-building/lore`}
	breadcrumbLabel={$translator('worldbuilding.placeholder.archiveNotes.breadcrumb')}
	heading={$translator('worldbuilding.placeholder.archiveNotes.heading')}
	emptyTitle={$translator('worldbuilding.placeholder.archiveNotes.emptyTitle')}
	emptyDescription={$translator('worldbuilding.placeholder.archiveNotes.emptyDescription')}
	subNavLabel={$translator('worldbuilding.aria.archiveSections')}
/>
