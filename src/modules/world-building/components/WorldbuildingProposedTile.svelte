<script lang="ts">
	import type { WorldbuildingDomainId } from '../worldbuilding-workflow.js';
	import {
		getSuggestionsByCategory,
		getIsLoadingSuggestions,
		getSuggestionLoadError,
	} from '../stores/worldbuild-suggestion-state.svelte.js';
	import WorldbuildingProposalCard from './WorldbuildingProposalCard.svelte';

	interface Props {
		categoryId: WorldbuildingDomainId;
		onAccept?: (proposalId: string) => void;
		onReject?: (proposalId: string, reason: string) => void;
	}

	let { categoryId, onAccept, onReject }: Props = $props();

	const proposals = $derived(getSuggestionsByCategory(categoryId));
	const isLoading = $derived(getIsLoadingSuggestions());
	const loadError = $derived(getSuggestionLoadError());

	const pending = $derived(proposals.filter((p) => p.status === 'pending_review'));
	const reviewed = $derived(proposals.filter((p) => p.status !== 'pending_review'));
</script>

{#if isLoading}
	<div class="proposed-tile proposed-tile--loading" role="status" aria-label="Loading suggestions">
		<span class="proposed-tile__spinner" aria-hidden="true"></span>
		<span>Loading suggestions…</span>
	</div>
{:else if loadError}
	<div class="proposed-tile proposed-tile--error" role="alert">
		<span class="proposed-tile__icon" aria-hidden="true">⚠</span>
		<span>Could not load suggestions.</span>
	</div>
{:else if proposals.length === 0}
	<div class="proposed-tile proposed-tile--empty">
		<p class="proposed-tile__empty-text">No suggestions for this domain yet.</p>
		<p class="proposed-tile__empty-hint">Run a scan to generate suggestions for review.</p>
	</div>
{:else}
	<div class="proposed-tile proposed-tile--has-proposals">
		{#if pending.length > 0}
			<section class="proposed-tile__section" aria-label="Pending suggestions">
				<header class="proposed-tile__section-header">
					<h3 class="proposed-tile__section-heading">
						{pending.length} suggestion{pending.length === 1 ? '' : 's'} pending your review
					</h3>
					<p class="proposed-tile__section-note">
						None of these are part of your canon until you explicitly accept them.
					</p>
				</header>
				<div class="proposed-tile__list">
					{#each pending as proposal (proposal.proposalId)}
						<WorldbuildingProposalCard
							{proposal}
							{onAccept}
							{onReject}
						/>
					{/each}
				</div>
			</section>
		{/if}

		{#if reviewed.length > 0}
			<section class="proposed-tile__section proposed-tile__section--reviewed" aria-label="Reviewed suggestions">
				<h3 class="proposed-tile__section-heading proposed-tile__section-heading--muted">
					{reviewed.length} reviewed
				</h3>
				<div class="proposed-tile__list">
					{#each reviewed as proposal (proposal.proposalId)}
						<WorldbuildingProposalCard
							{proposal}
							{onAccept}
							{onReject}
						/>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}

<style>
	.proposed-tile {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		font-size: var(--text-sm);
	}

	.proposed-tile--loading,
	.proposed-tile--error {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface-overlay);
	}

	.proposed-tile--loading {
		color: var(--color-text-muted);
	}

	.proposed-tile--error {
		color: var(--color-error);
		border-color: color-mix(in srgb, var(--color-error) 25%, var(--color-border-subtle));
	}

	.proposed-tile--empty {
		padding: var(--space-6) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px dashed var(--color-border-default);
		text-align: center;
	}

	.proposed-tile__empty-text {
		margin: 0;
		color: var(--color-text-secondary);
		font-weight: var(--font-weight-medium);
	}

	.proposed-tile__empty-hint {
		margin: var(--space-1) 0 0;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}

	.proposed-tile__spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 1.5px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin var(--duration-spinner) linear infinite;
		flex-shrink: 0;
	}

	.proposed-tile__icon {
		flex-shrink: 0;
	}

	.proposed-tile__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.proposed-tile__section--reviewed {
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border-subtle);
	}

	.proposed-tile__section-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.proposed-tile__section-heading {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.proposed-tile__section-heading--muted {
		color: var(--color-text-muted);
	}

	.proposed-tile__section-note {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-style: italic;
	}

	.proposed-tile__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
