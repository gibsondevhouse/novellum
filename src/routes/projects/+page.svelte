<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		getProjects,
		getLoading,
		loadProjects,
		openReader,
	} from '$modules/project/stores/project-hub.svelte.js';
	import HomeLibraryShell from '$modules/project/components/HomeLibraryShell.svelte';
	import ProjectCreateCard from '$modules/project/components/ProjectCreateCard.svelte';

	const showCreateProject = $derived(page.url.searchParams.has('create'));

	onMount(async () => {
		await loadProjects();
	});

	function closeCreateProject(): void {
		void goto('/projects', { replaceState: true, noScroll: true });
	}

	const projects = $derived(getProjects());

	function normalizeStatus(value: string | undefined): string {
		return (value ?? '').trim().toLowerCase();
	}

	function byRecent(a: { lastOpenedAt?: string }, b: { lastOpenedAt?: string }): number {
		const dateA = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
		const dateB = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
		return dateB - dateA;
	}

	const storyProjects = $derived(projects.filter((p) => p.projectType === 'story').toSorted(byRecent));
	const bookProjects = $derived(projects.filter((p) => p.projectType !== 'story').toSorted(byRecent));

	const planningStories = $derived(storyProjects.filter((p) => normalizeStatus(p.status) === 'planning'));
	const draftingStories = $derived(
		storyProjects.filter((p) => {
			const status = normalizeStatus(p.status);
			return status === 'drafting' || status === 'revising';
		}),
	);
	const publishedStories = $derived(
		storyProjects.filter((p) => {
			const status = normalizeStatus(p.status);
			return status === 'completed' || status === 'published';
		}),
	);
	const uncategorizedStories = $derived(
		storyProjects.filter((p) => {
			const status = normalizeStatus(p.status);
			return (
				status !== 'planning' &&
				status !== 'drafting' &&
				status !== 'revising' &&
				status !== 'completed' &&
				status !== 'published'
			);
		}),
	);

	const planningBooks = $derived(bookProjects.filter((p) => normalizeStatus(p.status) === 'planning'));
	const draftingBooks = $derived(
		bookProjects.filter((p) => {
			const status = normalizeStatus(p.status);
			return status === 'drafting' || status === 'revising';
		}),
	);
	const publishedBooks = $derived(
		bookProjects.filter((p) => {
			const status = normalizeStatus(p.status);
			return status === 'completed' || status === 'published';
		}),
	);
	const uncategorizedBooks = $derived(
		bookProjects.filter((p) => {
			const status = normalizeStatus(p.status);
			return (
				status !== 'planning' &&
				status !== 'drafting' &&
				status !== 'revising' &&
				status !== 'completed' &&
				status !== 'published'
			);
		}),
	);

	const recentlyRead = $derived(
		[...projects]
			.sort((a, b) => {
				const dateA = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
				const dateB = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
				return dateB - dateA;
			})
			.slice(0, 5),
	);

	const mostRecent = $derived(recentlyRead.length > 0 ? recentlyRead[0] : null);
	const completedWorks = $derived(projects.filter((p) => p.status === 'completed'));
	const worksInProgress = $derived(projects.filter((p) => p.status !== 'completed'));

	const groupedCollections = $derived(
		[
			{
				title: 'Story Projects',
				rows: [
					{ title: 'Planning', projects: planningStories },
					{ title: 'Drafting', projects: draftingStories },
					{ title: 'Published', projects: publishedStories },
					{ title: 'Uncategorized', projects: uncategorizedStories },
				],
			},
			{
				title: 'Book Projects',
				rows: [
					{ title: 'Planning', projects: planningBooks },
					{ title: 'Drafting', projects: draftingBooks },
					{ title: 'Published', projects: publishedBooks },
					{ title: 'Uncategorized', projects: uncategorizedBooks },
				],
			},
		]
			.map((group) => ({
				...group,
				rows: group.rows.filter((row) => row.projects.length > 0),
			}))
			.filter((group) => group.rows.length > 0),
	);
</script>

<svelte:head>
	<title>Projects — Novellum</title>
</svelte:head>

<HomeLibraryShell
	loading={getLoading()}
	totalCount={projects.length}
	{mostRecent}
	{recentlyRead}
	{worksInProgress}
	{completedWorks}
	{groupedCollections}
	showHero={false}
	cardDestination="hub"
	onOpenMostRecent={() => mostRecent && openReader(mostRecent)}
/>

{#if showCreateProject}
	<ProjectCreateCard oncancel={closeCreateProject} />
{/if}
