<script lang="ts">
	import { featureFlags } from '$lib/feature-flags.svelte.js';
</script>

{#if featureFlags.labsEnabled}
	<p>Story Bible is in Labs preview.</p>
{:else}
	<p>Story Bible is coming in a future update. Enable Labs in Settings → AI to preview.</p>
{/if}
