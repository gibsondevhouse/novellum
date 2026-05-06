<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WorldBuildingEmptyStatePage from './WorldBuildingEmptyStatePage.svelte';

	const { Story } = defineMeta({
		title: 'Worldbuilding/PlaceholderPage',
		component: WorldBuildingEmptyStatePage,
		tags: ['autodocs'],
	});
</script>

<Story
	name="Timeline Key Events"
	args={{
		projectId: 'storybook-project',
		topSection: 'timeline',
		activeId: 'key-events',
		breadcrumbHref: '/projects/storybook-project/world-building/timeline',
		breadcrumbLabel: 'Chronicles Overview',
		heading: 'Key Events',
		emptyTitle: 'No key events yet.',
		emptyDescription: 'Track turning points that redefine eras, alliances, and stakes across your timeline.',
		subNavLabel: 'Chronicles sections'
	}}
/>
