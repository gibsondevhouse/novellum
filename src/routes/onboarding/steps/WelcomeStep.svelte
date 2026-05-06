<script lang="ts">
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	interface Props {
		onNext: () => void;
	}
	let { onNext }: Props = $props();
</script>

<div class="step">
	<h1 class="step-heading">Welcome to Novellum</h1>
	<p class="step-body">
		A writing workspace built for fiction authors. Your stories, your device, your words.
	</p>
	<div class="step-actions">
		<PrimaryButton onclick={onNext}>Get started</PrimaryButton>
	</div>
</div>

<style>
	.step {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.step-heading {
		font-size: var(--text-2xl);
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
	.step-actions {
		margin-top: var(--space-2);
	}
</style>
