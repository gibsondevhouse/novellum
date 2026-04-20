<script lang="ts">
	import WorldBuildingTopSectionLanding from '$modules/bible/components/WorldBuildingTopSectionLanding.svelte';

	let { data }: { data: { projectId: string } } = $props();

	const links = $derived([
		{
			id: 'individuals',
			label: 'Individuals',
			tagline: 'Specific voices with leverage and flaws',
			description:
				'Define protagonist and supporting actors with motive, contradiction, and pressure-sensitive traits.',
			href: `/projects/${data.projectId}/world-building/characters/individuals`,
		},
		{
			id: 'factions',
			label: 'Factions',
			tagline: 'Collective actors that institutionalize conflict',
			description:
				'Map group identity, social incentives, and power structures that shape decisions beyond individuals.',
			href: `/projects/${data.projectId}/world-building/factions`,
		},
		{
			id: 'lineages',
			label: 'Lineages',
			tagline: 'Inherited identity and social consequence',
			description:
				'Track bloodlines, legacy, and inherited expectation that alter status, obligation, and risk.',
			href: `/projects/${data.projectId}/world-building/species`,
		},
		{
			id: 'notes',
			label: 'Notes',
			tagline: 'Unsorted personae fragments',
			description:
				'Capture incomplete ideas and unresolved relationships before promoting them into canon records.',
			href: `/projects/${data.projectId}/world-building/characters/notes`,
		},
	]);
</script>

<svelte:head>
	<title>Personae — Novellum</title>
</svelte:head>

<WorldBuildingTopSectionLanding
	projectId={data.projectId}
	topSection="characters"
	ariaLabel="Personae sections"
	title="Personae"
	description="Use this landing to orient your social world before diving into records. Personae tracks agency: who can act, who is constrained, and what identity costs to maintain."
	orientationTitle="Personae Orientation"
	orientation="Start by defining individual motives, then map collective pressures and inherited identity layers. Keep each record tied to story consequence, not just lore completeness."
	{links}
/>
