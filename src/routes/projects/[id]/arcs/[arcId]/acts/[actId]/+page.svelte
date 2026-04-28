<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { WorkspaceShell } from '$lib/components/ui/index.js';
	import ActDetailHero from '$modules/project/components/ActDetailHero.svelte';
	import ChapterListPanel from '$modules/project/components/ChapterListPanel.svelte';
	import HierarchyBreadcrumb from '$modules/project/components/HierarchyBreadcrumb.svelte';
	import { selectArc, selectAct } from '$modules/project/stores/hierarchy-store.svelte.js';

	let { data } = $props();

	const projectId = $derived(page.params.id ?? '');

	const crumbs = $derived([
		{ label: 'Arcs', href: `/projects/${projectId}/arcs` },
		{
			label: data.arc?.title ?? 'Unassigned',
			href: `/projects/${projectId}/arcs/${data.arcSegment}`,
		},
		{ label: data.act.title || 'Untitled act' },
	]);

	onMount(() => {
		if (projectId) {
			selectArc(projectId, data.act.arcId ?? null);
			selectAct(projectId, data.act.id);
		}
	});
</script>

<svelte:head>
	<title>{data.act.title || 'Untitled act'} — Novellum</title>
</svelte:head>

<WorkspaceShell mainLabel="Act detail workspace">
	{#snippet hero()}
		<ActDetailHero act={data.act} {projectId} arcSegment={data.arcSegment} />
	{/snippet}

	{#snippet main()}
		<HierarchyBreadcrumb {crumbs} />
		<ChapterListPanel
			{projectId}
			actId={data.act.id}
			arcSegment={data.arcSegment}
			chapters={data.chapters}
			scenes={data.scenes}
		/>
	{/snippet}
</WorkspaceShell>
