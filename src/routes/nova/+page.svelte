<script lang="ts">
	import ChatInterface from '$modules/ai/components/ChatInterface.svelte';
</script>

<svelte:head>
	<title>Nova — Novellum</title>
</svelte:head>

<div class="nova-agent-page">
	<ChatInterface />
</div>

<style>
	.nova-agent-page {
		height: 100%;
		min-height: 0;
		display: flex;
		flex-direction: column;
		background: var(--color-surface-base);
	}
</style>
