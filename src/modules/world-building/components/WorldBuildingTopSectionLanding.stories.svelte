<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WorldBuildingTopSectionLanding from './WorldBuildingTopSectionLanding.svelte';

	const { Story } = defineMeta({
		title: 'Worldbuilding/TopSectionLanding',
		component: WorldBuildingTopSectionLanding,
		tags: ['autodocs'],
	});
</script>

<Story
	name="Characters Landing"
	args={{
		projectId: 'storybook-project',
		topSection: 'characters',
		ariaLabel: 'Personae sections',
		title: 'Personae',
		description: 'Orient social actors and identity pressures before building specific records.',
		orientationTitle: 'Personae Orientation',
		orientation: 'Start with individuals, then map factions and inherited identity consequences.',
		links: [
			{
				id: 'individuals',
				label: 'Individuals',
				tagline: 'Specific voices with leverage and flaws',
				description: 'Define protagonist and supporting actors.',
				href: '/projects/storybook-project/world-building/characters/individuals'
			},
			{
				id: 'factions',
				label: 'Factions',
				tagline: 'Collective actors that institutionalize conflict',
				description: 'Map group identity and social incentives.',
				href: '/projects/storybook-project/world-building/factions'
			}
		]
	}}
/>
