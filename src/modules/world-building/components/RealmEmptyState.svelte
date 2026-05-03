<script lang="ts">
	import { PrimaryButton } from '$lib/components/ui/index.js';
	import NarrativeLocationEmptyState from './NarrativeLocationEmptyState.svelte';

	let { onCreate }: { onCreate: () => void } = $props();
</script>

<NarrativeLocationEmptyState
	title="No realms yet."
	description="Realms define the rules of existence: what is possible, what is dangerous, who holds power, and which tension never fully disappears."
>
	{#snippet actions()}
		<PrimaryButton size="sm" onclick={onCreate}>+ Add your first realm</PrimaryButton>
	{/snippet}
</NarrativeLocationEmptyState>
