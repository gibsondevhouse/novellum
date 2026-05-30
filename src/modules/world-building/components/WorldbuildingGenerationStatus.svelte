<script lang="ts">
	import type { WorldbuildingDomainId } from '../worldbuilding-workflow.js';
	import {
		getState,
		getMissingContextReason,
		resetState,
	} from '../stores/worldbuilding-generation-state.svelte.js';

	interface Props {
		domainId: WorldbuildingDomainId;
	}

	let { domainId }: Props = $props();

	const state = $derived(getState(domainId));
	const missingReason = $derived(getMissingContextReason(domainId));
</script>

{#if state === 'running' || state === 'queued'}
	<div class="gen-status gen-status--running" role="status" aria-live="polite">
		<span class="gen-status__spinner" aria-hidden="true"></span>
		<span>{state === 'queued' ? 'Queued…' : 'Generating…'}</span>
	</div>
{:else if state === 'review-ready'}
	<div class="gen-status gen-status--review" role="status">
		<span class="gen-status__dot" aria-hidden="true"></span>
		<span>Review ready</span>
	</div>
{:else if state === 'missing-context'}
	<div class="gen-status gen-status--warn" role="status">
		<span class="gen-status__icon" aria-hidden="true">⚠</span>
		<span>{missingReason ?? 'Missing required context'}</span>
	</div>
{:else if state === 'failed'}
	<div class="gen-status gen-status--error" role="alert">
		<span class="gen-status__icon" aria-hidden="true">✕</span>
		<span>Generation failed</span>
		<button
			type="button"
			class="gen-status__retry"
			onclick={() => resetState(domainId)}
		>Retry</button>
	</div>
{:else if state === 'accepted'}
	<div class="gen-status gen-status--accepted" role="status">
		<span class="gen-status__icon" aria-hidden="true">✓</span>
		<span>Accepted</span>
	</div>
{:else if state === 'rejected'}
	<div class="gen-status gen-status--rejected" role="status">
		<span>Rejected</span>
		<button
			type="button"
			class="gen-status__retry"
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

	.gen-status__retry {
		background: transparent;
		border: 1px solid currentColor;
		border-radius: var(--radius-sm);
		color: inherit;
		cursor: pointer;
		font-size: var(--text-xs);
		padding: 0 var(--space-1);
		line-height: 1.4;
	}

	.gen-status__retry:hover {
		opacity: 0.8;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
