<script lang="ts">
	import type { WorldbuildingDomainId } from '../worldbuilding-workflow.js';
	import {
		getState,
		getMissingContextReason,
		getGenerationFailureReason,
		resetState,
	} from '../stores/worldbuilding-generation-state.svelte.js';
	import { reviewGateStatusLabel } from '$lib/review-gate-labels.js';

	interface Props {
		domainId: WorldbuildingDomainId;
		onRetry?: (domainId: WorldbuildingDomainId) => void | Promise<unknown>;
		onReviewReady?: (domainId: WorldbuildingDomainId) => void | Promise<unknown>;
	}

	let { domainId, onRetry, onReviewReady }: Props = $props();

	const generationState = $derived(getState(domainId));
	const missingReason = $derived(getMissingContextReason(domainId));
	const failureReason = $derived(getGenerationFailureReason(domainId));

	let retrying = $state(false);

	async function handleRetry(): Promise<void> {
		if (retrying) return;
		if (!onRetry) {
			resetState(domainId);
			return;
		}

		retrying = true;
		try {
			await onRetry(domainId);
		} finally {
			retrying = false;
		}
	}

	async function handleReviewReady(): Promise<void> {
		await onReviewReady?.(domainId);
	}
</script>

{#if generationState === 'running' || generationState === 'queued'}
	<div class="gen-status gen-status--running" role="status" aria-live="polite">
		<span class="gen-status__spinner" aria-hidden="true"></span>
		<span>{generationState === 'queued' ? 'Queued…' : 'Generating…'}</span>
	</div>
{:else if generationState === 'review-ready'}
	<div class="gen-status gen-status--review" role="status">
		<span class="gen-status__dot" aria-hidden="true"></span>
		<span>{reviewGateStatusLabel('review-ready')}</span>
		{#if onReviewReady}
			<button
				type="button"
				class="gen-status__action"
				onclick={() => void handleReviewReady()}
			>Review draft</button>
		{/if}
	</div>
{:else if generationState === 'missing-context'}
	<div class="gen-status gen-status--warn" role="status">
		<span class="gen-status__icon" aria-hidden="true">⚠</span>
		<span>{missingReason ?? 'Missing required context'}</span>
	</div>
{:else if generationState === 'failed'}
	<div class="gen-status gen-status--error" role="alert">
		<span class="gen-status__icon" aria-hidden="true">✕</span>
		<span>{failureReason ?? 'Generation failed. Please try again.'}</span>
		<button
			type="button"
			class="gen-status__action"
			disabled={retrying}
			onclick={() => void handleRetry()}
		>{retrying ? 'Retrying...' : 'Retry'}</button>
	</div>
{:else if generationState === 'accepted'}
	<div class="gen-status gen-status--accepted" role="status">
		<span class="gen-status__icon" aria-hidden="true">✓</span>
		<span>{reviewGateStatusLabel('accepted')}</span>
	</div>
{:else if generationState === 'rejected'}
	<div class="gen-status gen-status--rejected" role="status">
		<span>{reviewGateStatusLabel('rejected')}</span>
		<button
			type="button"
			class="gen-status__action"
			onclick={() => resetState(domainId)}
		>Reset</button>
	</div>
{/if}

<style>
	.gen-status {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--text-xs);
		border-radius: var(--radius-sm);
		padding: 2px var(--space-2);
		max-width: 100%;
		flex-wrap: wrap;
	}

	.gen-status--running {
		color: var(--color-nova-blue);
	}

	.gen-status--review {
		color: var(--color-brass);
	}

	.gen-status--warn {
		color: var(--color-text-muted);
	}

	.gen-status--error {
		color: var(--color-error);
	}

	.gen-status--accepted {
		color: var(--color-success);
	}

	.gen-status--rejected {
		color: var(--color-text-muted);
	}

	.gen-status__spinner {
		display: inline-block;
		width: 10px;
		height: 10px;
		border: 1.5px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin var(--duration-spinner) linear infinite;
		flex-shrink: 0;
	}

	.gen-status__dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
		flex-shrink: 0;
	}

	.gen-status__icon {
		flex-shrink: 0;
	}

	.gen-status__action {
		background: transparent;
		border: 1px solid currentColor;
		border-radius: var(--radius-sm);
		color: inherit;
		cursor: pointer;
		font-size: var(--text-xs);
		padding: 0 var(--space-1);
		line-height: 1.4;
	}

	.gen-status__action:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.gen-status__action:hover {
		opacity: 0.8;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
