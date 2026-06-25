<script lang="ts">
	import StoryBibleWorkspacePage from './StoryBibleWorkspacePage.svelte';

	let { projectId }: { projectId: string } = $props();
</script>

<StoryBibleWorkspacePage {projectId} />
