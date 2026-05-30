<script lang="ts">
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import GenerateButton from './GenerateButton.svelte';

	interface Props {
		projectId?: string | null;
	}

	let { projectId = null }: Props = $props();
</script>

<EmptyStatePanel
	title="No lineage selected."
	description="Create a lineage to define bloodlines, houses, clans, or inherited traditions within your world."
>
	{#snippet actions()}
		{#if projectId}
			<GenerateButton {projectId} entityKind="lineage" count={1} label="✦ Generate a lineage" />
		{/if}
	{/snippet}
</EmptyStatePanel>
