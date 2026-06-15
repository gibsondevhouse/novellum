<script lang="ts">
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import GenerateButton from './GenerateButton.svelte';

	interface Props {
		projectId?: string | null;
	}

	let { projectId = null }: Props = $props();
</script>

<EmptyStatePanel
	title="No faction selected"
	description="Create a faction from the left rail to start building its dossier, relationships, and notable members."
>
	{#snippet actions()}
		{#if projectId}
			<GenerateButton {projectId} entityKind="faction" count={1} label="✦ Generate a faction" />
		{/if}
	{/snippet}
</EmptyStatePanel>
