<script lang="ts">
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import GenerateButton from './GenerateButton.svelte';

	interface Props {
		/** When provided, a "✦ Generate" button is shown */
		projectId?: string | null;
	}

	let { projectId = null }: Props = $props();
</script>

<EmptyStatePanel
	title="Character Workspace"
	description="Select a character from the list to view their full profile, story function, voice, relationships, and continuity tracking. Or click new + to start a new one."
>
	{#snippet actions()}
		{#if projectId}
			<GenerateButton {projectId} entityKind="character" count={1} label="✦ Generate a character" />
		{/if}
	{/snippet}
</EmptyStatePanel>
