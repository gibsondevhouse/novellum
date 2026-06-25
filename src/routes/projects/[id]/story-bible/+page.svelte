<script lang="ts">
	import { StoryBiblePlaceholder } from '$modules/story-bible';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Story Bible — Novellum</title>
</svelte:head>

<StoryBiblePlaceholder projectId={data.projectId} />
