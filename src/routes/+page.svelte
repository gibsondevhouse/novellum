<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getProjects,
		getLoading,
		loadProjects,
		openReader
	} from '../modules/project/stores/project-hub.svelte.js';
	import HomeLibraryShell from '../modules/project/components/HomeLibraryShell.svelte';

	onMount(async () => {
		await loadProjects();
	});

	const novels = $derived(getProjects().filter(p => p.projectType === 'novel' || !p.projectType));

	const recentlyRead = $derived(
		[...novels].sort((a, b) => {
			const dateA = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
			const dateB = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
			return dateB - dateA;
		}).slice(0, 5)
	);

	const mostRecent = $derived(recentlyRead.length > 0 ? recentlyRead[0] : null);

	// Status can be drafting, planning, revising, completed, archived. We just do simpler filters:
	const completedWorks = $derived(novels.filter(p => p.status === 'completed'));
	const worksInProgress = $derived(novels.filter(p => p.status !== 'completed'));
</script>

<svelte:head>
	<title>Library — Novellum</title>
</svelte:head>

<HomeLibraryShell
	loading={getLoading()}
	totalCount={novels.length}
	{mostRecent}
	{recentlyRead}
	{worksInProgress}
	{completedWorks}
	onOpenMostRecent={() => mostRecent && openReader(mostRecent)}
/>
