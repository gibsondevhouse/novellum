<script lang="ts">
	import ChatInterface from '$modules/ai/components/ChatInterface.svelte';
</script>

<svelte:head>
	<title>Nova — Novellum</title>
</svelte:head>

<div class="nova-layout">
	<section class="nova-hero" aria-labelledby="nova-title">
		<div>
			<p class="nova-hero__eyebrow">Nova Console</p>
			<h1 id="nova-title">AI Writing Stage</h1>
			<p>Use Nova for drafting, revision prompts, and focused narrative problem-solving without leaving the production shell.</p>
		</div>
	</section>
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

	.nova-hero {
		padding: var(--space-5);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		background:
			radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--color-nova-blue) 12%, transparent), transparent 38%),
			linear-gradient(165deg, var(--color-surface-overlay), var(--color-surface-ground));
	}

	.nova-hero__eyebrow,
	.nova-hero h1,
	.nova-hero p {
		margin: 0;
	}

	.nova-hero__eyebrow {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.nova-hero h1 {
		margin-top: var(--space-1);
		font-size: var(--text-2xl);
	}

	.nova-hero p {
		margin-top: var(--space-2);
		max-width: 62ch;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
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
