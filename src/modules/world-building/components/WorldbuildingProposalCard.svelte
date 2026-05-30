<script lang="ts">
	import type { WorldbuildDomainCheckpointRecord } from '$lib/ai/pipeline/checkpoint-contract.js';
	import type { CheckpointLifecycle } from '$lib/ai/pipeline/checkpoint-contract.js';

	interface Props {
		proposal: WorldbuildDomainCheckpointRecord;
		onAccept?: (proposalId: string) => void;
		onReject?: (proposalId: string, reason: string) => void;
	}

	let { proposal, onAccept, onReject }: Props = $props();

	const domainLabel = $derived(
		proposal.taskKey.split('.').pop()?.replace(/-/g, ' ') ?? 'Domain',
	);

	function formatDate(iso: string): string {
		try {
			return new Intl.DateTimeFormat(undefined, {
				dateStyle: 'medium',
				timeStyle: 'short',
			}).format(new Date(iso));
		} catch {
			return iso;
		}
	}

	function lifecycleVariant(lc: CheckpointLifecycle): string {
		switch (lc) {
			case 'draft': return 'draft';
			case 'review': return 'review';
			case 'accepted': return 'accepted';
			case 'rejected': return 'rejected';
			default: return 'draft';
		}
	}

	let rejecting = $state(false);
	let rejectReason = $state('');

	function handleAccept(): void {
		onAccept?.(proposal.id);
	}

	function handleRejectSubmit(): void {
		const reason = rejectReason.trim();
		if (reason) {
			onReject?.(proposal.id, reason);
			rejecting = false;
			rejectReason = '';
		}
	}
</script>

<div class="proposal-card">
	<div class="proposal-card__header">
		<div class="proposal-card__meta">
			<span class="proposal-card__domain">{domainLabel}</span>
			<span class="proposal-card__badge proposal-card__badge--{lifecycleVariant(proposal.lifecycle)}">
				{proposal.lifecycle}
			</span>
		</div>
		<time class="proposal-card__time" datetime={proposal.createdAt}>
			{formatDate(proposal.createdAt)}
		</time>
	</div>

	{#if proposal.artifact?.payload}
		<p class="proposal-card__preview">
			Proposal generated — {Object.keys(proposal.artifact.payload).length} field group(s) in payload.
		</p>
	{/if}

	{#if proposal.lifecycle === 'draft' || proposal.lifecycle === 'review'}
		<div class="proposal-card__actions">
			{#if !rejecting}
				<button
					type="button"
					class="proposal-card__btn proposal-card__btn--accept"
					onclick={handleAccept}
					aria-label="Accept proposal for {domainLabel}"
				>Accept</button>
				<button
					type="button"
					class="proposal-card__btn proposal-card__btn--reject"
					onclick={() => (rejecting = true)}
					aria-label="Reject proposal for {domainLabel}"
				>Reject</button>
			{:else}
				<div class="proposal-card__reject-form">
					<input
						class="proposal-card__reject-input"
						type="text"
						bind:value={rejectReason}
						placeholder="Reason for rejection…"
						aria-label="Rejection reason"
					/>
					<button
						type="button"
						class="proposal-card__btn proposal-card__btn--reject"
						disabled={!rejectReason.trim()}
						onclick={handleRejectSubmit}
					>Confirm reject</button>
					<button
						type="button"
						class="proposal-card__btn proposal-card__btn--cancel"
						onclick={() => { rejecting = false; rejectReason = ''; }}
					>Cancel</button>
				</div>
			{/if}
		</div>
	{:else if proposal.lifecycle === 'accepted'}
		<p class="proposal-card__outcome proposal-card__outcome--accepted">
			Accepted — projected to canon
			{#if proposal.acceptance?.acceptedAt}on {formatDate(proposal.acceptance.acceptedAt)}{/if}
		</p>
	{:else if proposal.lifecycle === 'rejected'}
		<p class="proposal-card__outcome proposal-card__outcome--rejected">
			Rejected{#if proposal.rejection?.reason}: {proposal.rejection.reason}{/if}
		</p>
	{/if}
</div>

<style>
	.proposal-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-raised);
	}

	.proposal-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.proposal-card__meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.proposal-card__domain {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		text-transform: capitalize;
	}

	.proposal-card__badge {
		display: inline-flex;
		align-items: center;
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.proposal-card__badge--draft,
	.proposal-card__badge--review {
		background: color-mix(in srgb, var(--color-brass) 15%, transparent);
		color: var(--color-brass);
		border: 1px solid color-mix(in srgb, var(--color-brass) 30%, transparent);
	}

	.proposal-card__badge--accepted {
		background: color-mix(in srgb, var(--color-success) 15%, transparent);
		color: var(--color-success);
		border: 1px solid color-mix(in srgb, var(--color-success) 30%, transparent);
	}

	.proposal-card__badge--rejected {
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
		color: var(--color-error);
		border: 1px solid color-mix(in srgb, var(--color-error) 25%, transparent);
	}

	.proposal-card__time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.proposal-card__preview {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}

	.proposal-card__actions {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		flex-wrap: wrap;
	}

	.proposal-card__reject-form {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		flex-wrap: wrap;
		width: 100%;
	}

	.proposal-card__reject-input {
		flex: 1;
		min-width: 0;
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-base);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
	}

	.proposal-card__reject-input:focus {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 1px;
	}

	.proposal-card__btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition:
			background var(--duration-fast) var(--ease-standard),
			opacity var(--duration-fast) var(--ease-standard);
	}

	.proposal-card__btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.proposal-card__btn--accept {
		background: color-mix(in srgb, var(--color-success) 20%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-success) 40%, transparent);
		color: var(--color-success);
	}

	.proposal-card__btn--accept:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-success) 30%, transparent);
	}

	.proposal-card__btn--reject {
		background: color-mix(in srgb, var(--color-error) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
		color: var(--color-error);
	}

	.proposal-card__btn--reject:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-error) 20%, transparent);
	}

	.proposal-card__btn--cancel {
		background: transparent;
		border: 1px solid var(--color-border-default);
		color: var(--color-text-secondary);
	}

	.proposal-card__btn--cancel:hover {
		background: var(--color-surface-overlay);
	}

	.proposal-card__outcome {
		margin: 0;
		font-size: var(--text-xs);
		font-style: italic;
	}

	.proposal-card__outcome--accepted {
		color: var(--color-success);
	}

	.proposal-card__outcome--rejected {
		color: var(--color-error);
	}
</style>
