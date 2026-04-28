<script lang="ts">
	import { page } from '$app/state';
	import { WorkspaceShell, WorkspaceHero } from '$lib/components/ui/index.js';
	import ArcListPanel from '$modules/project/components/ArcListPanel.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Arcs — Novellum</title>
</svelte:head>

<WorkspaceShell mainLabel="Story arcs workspace">
	{#snippet hero()}
		<WorkspaceHero
			eyebrow="Story Arcs"
			title="Arcs"
			description="Plan, sequence, and track the major arcs of your story."
		/>
	{/snippet}

	{#snippet main()}
		<ArcListPanel projectId={page.params.id ?? ''} arcs={data.arcs} acts={data.acts} />
	{/snippet}
</WorkspaceShell>
