<script lang="ts">
	import { GhostButton, PrimaryButton } from '$lib/components/ui/index.js';
	import NarrativeLocationEmptyState from './NarrativeLocationEmptyState.svelte';

	let {
		hasRealms,
		onCreate,
		openRealmsHref,
	}: {
		hasRealms: boolean;
		onCreate: () => void;
		openRealmsHref: string;
	} = $props();
</script>

<NarrativeLocationEmptyState
	title="No landmarks yet."
	description="Add specific high-impact sites where scenes actually happen. Realms define what can happen; landmarks define what does happen."
	note={hasRealms
		? ''
		: 'Create at least one realm first so every landmark belongs to a functioning narrative environment.'}
>
	{#snippet actions()}
		{#if hasRealms}
			<PrimaryButton size="sm" onclick={onCreate}>+ Add your first landmark</PrimaryButton>
		{:else}
			<GhostButton size="sm" href={openRealmsHref}>Open realms</GhostButton>
		{/if}
	{/snippet}
</NarrativeLocationEmptyState>
