<script lang="ts">
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	interface Props {
		onNext: () => void;
	}
	let { onNext }: Props = $props();
</script>

<div class="step">
	<h2 class="step-heading">Your stories live on your device</h2>
	<p class="step-body">
		Nothing is sent to our servers. Novellum stores all your work locally in a SQLite database on
		your machine.
	</p>
	<ul class="step-list">
		<li>Private by default — no account required</li>
		<li>No internet connection needed to write</li>
		<li>You own your files and can move them freely</li>
	</ul>
	<div class="step-actions">
		<PrimaryButton onclick={onNext}>Got it</PrimaryButton>
	</div>
</div>

<style>
	.step {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.step-heading {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}
	.step-body {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
	}
	.step-list {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		padding-left: var(--space-5);
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.step-actions {
		margin-top: var(--space-2);
	}
</style>
