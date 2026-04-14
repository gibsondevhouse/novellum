<script lang="ts">
	import ChatInterface from '$modules/ai/components/ChatInterface.svelte';
</script>

<svelte:head>
	<title>Nova — Novellum</title>
</svelte:head>

<div class="nova-layout">
	<div class="nova-container">
		<ChatInterface />
	</div>
</div>

<style>
	.nova-layout {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--color-surface-base);
	}

	.nova-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		flex: 1;
		overflow: hidden;
	}
</style>
