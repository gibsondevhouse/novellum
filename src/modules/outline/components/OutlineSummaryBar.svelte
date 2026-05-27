<script lang="ts">
	type ScopeReadiness = 'empty' | 'partial' | 'ready';

	let {
		currentLayerLabel,
		readiness,
		pathSegments,
		showStageActions = false,
		stageTitle,
		stageRunButtonLabel = 'Run Stage Pipeline',
		stageRunDisabled = false,
		stageRunDisabledReason,
		onStageAction,
	}: {
		currentLayerLabel: string;
		readiness: ScopeReadiness;
		pathSegments: string[];
		showStageActions?: boolean;
		stageTitle?: string;
		stageRunButtonLabel?: string;
		stageRunDisabled?: boolean;
		stageRunDisabledReason?: string | null;
		onStageAction?: () => void;
	} = $props();

	const readinessLabel = $derived.by(() => {
		if (readiness === 'ready') return 'Ready';
		if (readiness === 'partial') return 'Partial';
		return 'Empty';
	});

	const pathLabel = $derived(pathSegments.length > 0 ? pathSegments.join(' / ') : 'No active hierarchy path');
</script>

<section class="scope-summary" aria-label="Pipeline scope summary">
	<div class="scope-summary__row">
		<div class="scope-summary__labels">
			<span class="scope-summary__layer">Current Layer: {currentLayerLabel}</span>
			<span class="scope-summary__path" title={pathLabel}>{pathLabel}</span>
		</div>
		<span class="scope-summary__status" data-readiness={readiness}>{readinessLabel}</span>
	</div>

	{#if showStageActions}
		<div class="scope-summary__actions" data-testid="stage-action-region">
			<button
				type="button"
				class="scope-summary__run"
				class:scope-summary__run--disabled={stageRunDisabled}
				disabled={stageRunDisabled}
				onclick={() => onStageAction?.()}
				aria-label="Run stage orchestration"
				title={stageRunDisabledReason ?? undefined}
			>
				{stageRunButtonLabel}
			</button>
			<span class="scope-summary__action-note">
				{#if stageRunDisabledReason}
					{stageRunDisabledReason}
				{:else}
					{stageTitle ? `Stage selected: ${stageTitle}` : 'Stage selected'}
				{/if}
			</span>
		</div>
	{/if}
</section>

<style>
	.scope-summary {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 84%, transparent);
	}

	.scope-summary__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.scope-summary__labels {
		display: grid;
		gap: 0.1rem;
		min-width: 0;
	}

	.scope-summary__layer {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.scope-summary__path {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.scope-summary__status {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		border-radius: var(--radius-full, 9999px);
		padding: 0 var(--space-2);
		line-height: 1.7;
		border: 1px solid var(--color-border-subtle);
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-bg-elevated) 72%, transparent);
	}

	.scope-summary__status[data-readiness='ready'] {
		color: color-mix(in srgb, var(--color-teal) 76%, var(--color-text-primary));
		border-color: color-mix(in srgb, var(--color-teal) 48%, var(--color-border-subtle));
	}

	.scope-summary__status[data-readiness='partial'] {
		color: color-mix(in srgb, var(--color-candle) 72%, var(--color-text-primary));
		border-color: color-mix(in srgb, var(--color-candle) 42%, var(--color-border-subtle));
	}

	.scope-summary__actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-top: var(--space-2);
		border-top: 1px dashed var(--color-border-subtle);
	}

	.scope-summary__run {
		border: 1px solid color-mix(in srgb, var(--color-teal) 55%, var(--color-border-default));
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		background: color-mix(in srgb, var(--color-teal) 18%, transparent);
		cursor: pointer;
	}

	.scope-summary__run:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-teal) 28%, transparent);
	}

	.scope-summary__run--disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.scope-summary__action-note {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}
</style>
