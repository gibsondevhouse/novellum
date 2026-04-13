<script lang="ts">
	import ConsistencyPanel from '$modules/consistency/components/ConsistencyPanel.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Consistency — Novellum</title>
</svelte:head>

<ConsistencyPanel projectId={data.projectId} />
