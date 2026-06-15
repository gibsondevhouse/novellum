<script lang="ts">
	import type {
		WorldbuildProposalRecord,
		WorldbuildProposalStatus,
	} from '$lib/ai/pipeline/worldbuild-proposal-schema.js';
	import { reviewGateStatusLabel } from '$lib/review-gate-labels.js';
	import WorldbuildingProposalDiffView from './WorldbuildingProposalDiffView.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import DestructiveButton from '$lib/components/ui/DestructiveButton.svelte';
	import SecondaryButton from '$lib/components/ui/SecondaryButton.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	interface Props {
		proposal: WorldbuildProposalRecord;
		onAccept?: (proposalId: string, projectId: string) => void;
		onReject?: (proposalId: string, reason: string, projectId: string) => void;
	}

	let { proposal, onAccept, onReject }: Props = $props();

	const domainLabel = $derived(
		proposal.categoryId.replace(/-/g, ' '),
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

	function statusVariant(status: WorldbuildProposalStatus): string {
		switch (status) {
			case 'pending_review': return 'review';
			case 'accepted': return 'accepted';
			case 'rejected': return 'rejected';
			case 'failed_validation': return 'rejected';
		}
	}

	let rejecting = $state(false);
	let rejectReason = $state('');

	function handleAccept(): void {
		onAccept?.(proposal.proposalId, proposal.projectId);
	}

	function handleRejectSubmit(): void {
		const reason = rejectReason.trim();
		if (reason) {
			onReject?.(proposal.proposalId, reason, proposal.projectId);
			rejecting = false;
			rejectReason = '';
		}
	}
</script>

<div class="proposal-card">
	<div class="proposal-card__header">
		<div class="proposal-card__meta">
			<span class="proposal-card__domain">{domainLabel}</span>
			<span class="proposal-card__badge proposal-card__badge--{statusVariant(proposal.status)}">
				{reviewGateStatusLabel(proposal.status)}
			</span>
		</div>
		<time class="proposal-card__time" datetime={proposal.generatedAt}>
			{formatDate(proposal.generatedAt)}
		</time>
	</div>

	<p class="proposal-card__preview">
		{proposal.reasoningSummary} {Object.keys(proposal.payload).length} field(s) available for review.
	</p>

	<dl class="proposal-card__provenance">
		<div class="proposal-card__provenance-row">
			<dt>Source</dt>
			<dd>{proposal.sourceContext.title}</dd>
		</div>
		<div class="proposal-card__provenance-row">
			<dt>Confidence</dt>
			<dd>{Math.round(proposal.confidence * 100)}%</dd>
		</div>
		{#if proposal.sourceContext.logline}
			<div class="proposal-card__provenance-row">
				<dt>Context</dt>
				<dd>{proposal.sourceContext.logline}</dd>
			</div>
		{/if}
	</dl>

	<WorldbuildingProposalDiffView {proposal} maxPayloadFields={4} />

	{#if proposal.status === 'pending_review'}
		<div class="proposal-card__actions">
			{#if !rejecting}
				<PrimaryButton
					size="sm"
					onclick={handleAccept}
					aria-label="Accept proposal for {domainLabel}"
				>Accept</PrimaryButton>
				<DestructiveButton
					size="sm"
					onclick={() => (rejecting = true)}
					aria-label="Reject proposal for {domainLabel}"
				>Reject</DestructiveButton>
			{:else}
				<div class="proposal-card__reject-form">
					<Input
						class="proposal-card__reject-input"
						type="text"
						bind:value={rejectReason}
						placeholder="Reason for rejection…"
						aria-label="Rejection reason"
					/>
					<DestructiveButton
						size="sm"
						disabled={!rejectReason.trim()}
						onclick={handleRejectSubmit}
					>Confirm reject</DestructiveButton>
					<SecondaryButton
						size="sm"
						onclick={() => { rejecting = false; rejectReason = ''; }}
					>Cancel</SecondaryButton>
				</div>
			{/if}
		</div>
	{:else if proposal.status === 'accepted'}
		<p class="proposal-card__outcome proposal-card__outcome--accepted">
			Accepted — projected to canon
			{#if proposal.acceptance?.acceptedAt}on {formatDate(proposal.acceptance.acceptedAt)}{/if}
		</p>
	{:else if proposal.status === 'rejected'}
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

	.proposal-card__provenance {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-subtle);
	}

	.proposal-card__provenance-row {
		display: flex;
		gap: var(--space-2);
		align-items: baseline;
		font-size: var(--text-xs);
	}

	.proposal-card__provenance-row dt {
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
		flex-shrink: 0;
	}

	.proposal-card__provenance-row dd {
		margin: 0;
		color: var(--color-text-secondary);
		word-break: break-word;
	}
</style>
