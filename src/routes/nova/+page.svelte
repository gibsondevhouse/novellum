<script lang="ts">
	import ChatInterface from '$modules/ai/components/ChatInterface.svelte';
</script>

<svelte:head>
	<title>Nova — Novellum</title>
</svelte:head>

<div class="nova-layout">
	<header class="nova-header">
		<div class="nova-header__icon" aria-hidden="true">★</div>
		<h1 class="nova-header__title">Nova Assistant</h1>
	</header>
	
	<main class="nova-content">
		<ChatInterface />
	</main>
</div>

<style>
	.nova-layout {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-height: 100vh;
		background-color: var(--color-surface-base);
	}

	.nova-header {
		display: flex;
		align-items: center;
		padding: var(--space-4) var(--space-6);
		gap: var(--space-3);
		border-bottom: 1px solid var(--color-border-subtle);
		background-color: var(--color-surface-overlay);
	}

	.nova-header__icon {
		color: var(--color-text-brand);
		font-size: var(--text-xl);
	}

	.nova-header__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.nova-content {
		flex: 1;
		padding: var(--space-6);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
</style>
