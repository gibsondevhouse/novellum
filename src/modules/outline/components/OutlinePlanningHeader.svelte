<script lang="ts">
	import type { PacingMetrics } from '$modules/outline/services/pacing-telemetry.js';
	import PacingSignal from './PacingSignal.svelte';

	let { chapterCount, sceneCount, metrics } = $props<{
		chapterCount: number;
		sceneCount: number;
		metrics?: PacingMetrics;
	}>();
</script>

<div class="planning-header">
	<div class="header-left">
		<span class="header-label">Structure</span>
		{#if chapterCount > 0}
			<div class="stats" role="status" aria-live="polite">
				{#if metrics && metrics.actCount > 0}
					<span class="stat">
						<strong>{metrics.actCount}</strong>
						{metrics.actCount === 1 ? 'act' : 'acts'}
					</span>
					<span class="sep" aria-hidden="true">·</span>
				{/if}
				<span class="stat">
					<strong>{chapterCount}</strong>
					{chapterCount === 1 ? 'chapter' : 'chapters'}
				</span>
				<span class="sep" aria-hidden="true">·</span>
				<span class="stat">
					<strong>{sceneCount}</strong>
					{sceneCount === 1 ? 'scene' : 'scenes'}
				</span>
				{#if metrics && metrics.sparsity !== 'healthy'}
					<span class="sep" aria-hidden="true">·</span>
					<PacingSignal
						sparsity={metrics.sparsity}
						label={metrics.sparsity === 'very-sparse'
							? 'Very sparse — consider adding scenes'
							: 'Sparse — chapters could use more scenes'}
					/>
				{/if}
			</div>
		{:else}
			<span class="stat stat--empty" role="status">No chapters yet</span>
		{/if}
	</div>
</div>

<style>
	.planning-header {
		display: flex;
		align-items: center;
		padding-bottom: var(--space-5);
		margin-bottom: var(--space-5);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.header-left {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.header-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.stats {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.stat {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.stat strong {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.stat--empty {
		font-size: var(--text-sm);
		font-style: italic;
		color: var(--color-text-muted);
	}

	.sep {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}
</style>
