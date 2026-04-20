<script lang="ts">
	import WorldBuildingTopSectionLanding from '$modules/bible/components/WorldBuildingTopSectionLanding.svelte';
	import { buildWorldBuildingLandingProps } from '$modules/bible/worldbuilding-navigation.js';

	let { data }: { data: { projectId: string } } = $props();

	const landing = $derived.by(() => buildWorldBuildingLandingProps('plot-threads', data.projectId));
</script>

<svelte:head>
	<title>Threads — Novellum</title>
</svelte:head>

<WorldBuildingTopSectionLanding
	projectId={data.projectId}
	topSection="plot-threads"
	ariaLabel={landing.ariaLabel}
	title={landing.title}
	description={landing.description}
	orientationTitle={landing.orientationTitle}
	orientation={landing.orientation}
	links={landing.links}
/>
