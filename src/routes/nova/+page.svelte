<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import ChatInterface from '$modules/ai/components/ChatInterface.svelte';
</script>

<svelte:head>
	<title>Nova — Novellum</title>
</svelte:head>

<div class="nova-layout">
	<PageHeader
		eyebrow="Nova Console"
		title="AI Writing Stage"
		description="Use Nova for drafting, revision prompts, and focused narrative problem-solving without leaving the production shell."
	/>
	<div class="nova-container">
		<ChatInterface />
	</div>
</div>

<style>
	.nova-layout {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: var(--space-4);
		padding: var(--space-5) 0 var(--space-8);
		background-color: var(--color-surface-base);
	}

	.nova-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		flex: 1;
		overflow: hidden;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		background: linear-gradient(180deg, var(--color-surface-overlay), var(--color-surface-ground));
	}
</style>
