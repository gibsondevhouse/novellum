<script lang="ts">
	import { SurfacePanel } from '$lib/components/ui/index.js';

	let { currentWordCount, targetWordCount }: { currentWordCount: number; targetWordCount: number } =
		$props();

	const hasProgress = $derived(currentWordCount > 0);
	const hasTarget = $derived(targetWordCount > 0);
	const progressPercent = $derived(
		hasTarget ? Math.min(100, Math.round((currentWordCount / targetWordCount) * 100)) : 0,
	);

	function formatWords(n: number): string {
		return n.toLocaleString();
	}
</script>

<SurfacePanel class="hub-progress-card" aria-labelledby="mod-progress">
	<span class="hub-card__label" id="mod-progress">Progress</span>
	<span class="hub-card__value">
		{hasProgress ? formatWords(currentWordCount) : '0'}
	</span>
	<div
		class="progress-track"
		role="progressbar"
		aria-valuenow={hasProgress ? progressPercent : 0}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-label={hasProgress ? `${progressPercent}% of target word count` : 'No writing started yet'}
	>
		<div class="progress-fill" style:width="{hasProgress ? progressPercent : 0}%"></div>
	</div>
	<span class="hub-card__sub">
		{#if hasProgress && hasTarget}
			{progressPercent}% of {formatWords(targetWordCount)}
		{:else if hasTarget}
			Target: {formatWords(targetWordCount)}
		{:else if hasProgress}
			{formatWords(currentWordCount)} words
		{:else}
			No target set
		{/if}
	</span>
</SurfacePanel>

<style>
	:global(.hub-progress-card) {
		display: flex !important;
		flex-direction: column !important;
		gap: var(--space-2) !important;
		padding: var(--space-6) !important;
	}

	.hub-card__label {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.hub-card__value {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		line-height: 1;
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-tight);
	}

	.hub-card__sub {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.progress-track {
		height: 6px;
		background: var(--color-surface-elevated);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-nova-blue), var(--color-teal));
		border-radius: var(--radius-full);
		transition: width var(--duration-slow) var(--ease-decelerate);
		min-width: 0;
	}
</style>