<script lang="ts">
	import WorldBuildingTopSectionLanding from '$modules/world-building/components/WorldBuildingTopSectionLanding.svelte';
	import { buildWorldBuildingLandingProps } from '$modules/world-building/worldbuilding-navigation.js';

	let { data }: { data: { projectId: string } } = $props();

	const landing = $derived.by(() => buildWorldBuildingLandingProps('locations', data.projectId));
</script>

<svelte:head>
	<title>{landing.title} — Novellum</title>
</svelte:head>

<WorldBuildingTopSectionLanding
	projectId={data.projectId}
	topSection="locations"
	ariaLabel={landing.ariaLabel}
	title={landing.title}
	description={landing.description}
	orientationTitle={landing.orientationTitle}
	orientation={landing.orientation}
	links={landing.links}
/>
