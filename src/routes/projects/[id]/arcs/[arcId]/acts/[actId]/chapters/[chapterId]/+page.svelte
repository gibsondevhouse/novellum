<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { WorkspaceShell } from '$lib/components/ui/index.js';
	import ChapterDetailHero from '$modules/project/components/ChapterDetailHero.svelte';
	import SceneListPanel from '$modules/project/components/SceneListPanel.svelte';
	import HierarchyBreadcrumb from '$modules/project/components/HierarchyBreadcrumb.svelte';
	import {
		selectArc,
		selectAct,
		selectChapter,
	} from '$modules/project/stores/hierarchy-store.svelte.js';

	let { data } = $props();

	const projectId = $derived(page.params.id ?? '');

	const crumbs = $derived([
		{ label: 'Arcs', href: `/projects/${projectId}/arcs` },
		{
			label: data.arc?.title ?? 'Unassigned',
			href: `/projects/${projectId}/arcs/${data.arcSegment}`,
		},
		{
			label: data.act?.title ?? 'Unassigned act',
			href: `/projects/${projectId}/arcs/${data.arcSegment}/acts/${data.actSegment}`,
		},
		{ label: data.chapter.title || 'Untitled chapter' },
	]);

	onMount(() => {
		if (projectId) {
			selectArc(projectId, data.act?.arcId ?? null);
			selectAct(projectId, data.chapter.actId ?? null);
			selectChapter(projectId, data.chapter.id);
		}
	});
</script>

<svelte:head>
	<title>{data.chapter.title || 'Untitled chapter'} — Novellum</title>
</svelte:head>

<WorkspaceShell mainLabel="Chapter detail workspace">
	{#snippet hero()}
		<ChapterDetailHero
			chapter={data.chapter}
			{projectId}
			arcSegment={data.arcSegment}
			actSegment={data.actSegment}
		/>
	{/snippet}

	{#snippet main()}
		<HierarchyBreadcrumb {crumbs} />
		<SceneListPanel {projectId} scenes={data.scenes} />
	{/snippet}
</WorkspaceShell>
