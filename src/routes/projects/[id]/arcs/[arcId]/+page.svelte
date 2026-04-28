<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { WorkspaceShell, WorkspaceHero } from '$lib/components/ui/index.js';
	import ArcDetailHero from '$modules/project/components/ArcDetailHero.svelte';
	import ActListPanel from '$modules/project/components/ActListPanel.svelte';
	import { selectArc } from '$modules/project/stores/hierarchy-store.svelte.js';

	let { data } = $props();

	const projectId = $derived(page.params.id ?? '');

	onMount(() => {
		if (projectId) selectArc(projectId, data.arcId ?? null);
	});
</script>

<svelte:head>
	<title>{data.arc?.title ?? 'Unassigned acts'} — Arcs — Novellum</title>
</svelte:head>

<WorkspaceShell mainLabel="Arc detail workspace">
	{#snippet hero()}
		{#if data.arc}
			<ArcDetailHero arc={data.arc} {projectId} />
		{:else}
			<WorkspaceHero
				eyebrow="STORY ARCS"
				title="Unassigned acts"
				description="Acts that don't yet belong to an arc."
			/>
		{/if}
	{/snippet}

	{#snippet main()}
		<ActListPanel {projectId} arcId={data.arcId} acts={data.acts} chapters={data.chapters} />
	{/snippet}
</WorkspaceShell>
