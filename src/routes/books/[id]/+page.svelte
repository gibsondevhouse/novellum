<script lang="ts">
	import ReaderExperience from '$modules/reader/components/ReaderExperience.svelte';

	let {
		data,
	}: {
		data: {
			project: {
				id: string;
				title: string;
				coverUrl?: string;
				genre: string;
				logline: string;
			};
			chapters: {
				id: string;
				title: string;
				order: number;
				scenes: {
					id: string;
					title: string;
					order: number;
					content: string;
				}[];
			}[];
		};
	} = $props();
</script>

<svelte:head>
	<title>{data.project.title} — Reader — Novellum</title>
</svelte:head>

<ReaderExperience project={data.project} chapters={data.chapters} />
