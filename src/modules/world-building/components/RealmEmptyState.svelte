<script lang="ts">
	import { PrimaryButton } from '$lib/components/ui/index.js';
	import GenerateButton from './GenerateButton.svelte';
	import NarrativeLocationEmptyState from './NarrativeLocationEmptyState.svelte';

	let {
		onCreate,
		projectId = null,
	}: {
		onCreate: () => void;
		projectId?: string | null;
	} = $props();
</script>

<NarrativeLocationEmptyState
	title="No realms yet."
	description="Realms define the rules of existence: what is possible, what is dangerous, who holds power, and which tension never fully disappears."
>
	{#snippet actions()}
		<PrimaryButton size="sm" onclick={onCreate}>+ Add your first realm</PrimaryButton>
		{#if projectId}
			<GenerateButton {projectId} entityKind="realm" count={1} label="✦ Generate a realm" />
		{/if}
	{/snippet}
</NarrativeLocationEmptyState>
