<script lang="ts">
	import { featureFlags } from '$lib/feature-flags.svelte.js';
</script>

{#if featureFlags.labsEnabled}
	<p>Story Bible is in Labs preview.</p>
{/if}
