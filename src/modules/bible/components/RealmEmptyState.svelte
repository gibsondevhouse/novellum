<script lang="ts">
	import NarrativeLocationEmptyState from './NarrativeLocationEmptyState.svelte';

	let { onCreate }: { onCreate: () => void } = $props();
</script>

<NarrativeLocationEmptyState
	title="No realms yet."
	description="Realms define the rules of existence: what is possible, what is dangerous, who holds power, and which tension never fully disappears."
>
	{#snippet actions()}
		<button class="bible-btn-sm" onclick={onCreate}>+ Add your first realm</button>
	{/snippet}
</NarrativeLocationEmptyState>