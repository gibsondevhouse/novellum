<script lang="ts">
	import ChatInterface from '$modules/ai/components/ChatInterface.svelte';
</script>

<svelte:head>
	<title>Nova — Novellum</title>
</svelte:head>

<div class="nova-agent-page">
	<section class="nova-route-notice" data-testid="nova-route-notice" aria-label="Nova route status">
		<p class="nova-route-notice__eyebrow">Nova workspace</p>
		<p class="nova-route-notice__body">
			Use this focused workspace for exploratory chat. Project-aware writing actions remain in
			the editor sidepanel where scene and chapter context are available.
		</p>
	</section>
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

	.nova-route-notice {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border-default);
		background: var(--color-surface-ground);
	}

	.nova-route-notice__eyebrow {
		margin: 0;
		font-size: 0.625rem;
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.nova-route-notice__body {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}
</style>
