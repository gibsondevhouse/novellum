<script lang="ts">
	import { page } from '$app/state';
	import { translator } from '$lib/i18n';
	import WorldBuildingPlaceholderPage from '$modules/bible/components/WorldBuildingPlaceholderPage.svelte';

	const projectId = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>{$translator('worldbuilding.page.personae-notes.title')}</title>
</svelte:head>

<WorldBuildingPlaceholderPage
	{projectId}
	topSection="characters"
	activeId="notes"
	breadcrumbHref={`/projects/${projectId}/world-building/characters`}
	breadcrumbLabel={$translator('worldbuilding.placeholder.personaeNotes.breadcrumb')}
	heading={$translator('worldbuilding.placeholder.personaeNotes.heading')}
	emptyTitle={$translator('worldbuilding.placeholder.personaeNotes.emptyTitle')}
	emptyDescription={$translator('worldbuilding.placeholder.personaeNotes.emptyDescription')}
	subNavLabel={$translator('worldbuilding.aria.personaeSections')}
/>
