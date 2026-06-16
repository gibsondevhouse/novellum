<script lang="ts">
	import type { WorldbuildProposalRecord } from '$lib/ai/pipeline/worldbuild-proposal-schema.js';
	import {
		WORLDBUILDING_DOMAIN_SEQUENCE,
		type WorldbuildingDomainConfig,
	} from '../worldbuilding-workflow.js';
	import {
		getSuggestionsByCategory,
		getIsLoadingSuggestions,
		getSuggestionLoadError,
	} from '../stores/worldbuild-suggestion-state.svelte.js';
	import {
		acceptWorldbuildProposalForReview,
		rejectWorldbuildProposalForReview,
		type WorldbuildProposalActionResult,
	} from '../services/worldbuild-proposal-actions.js';
	import WorldbuildingProposedTile from './WorldbuildingProposedTile.svelte';

	type DomainProposalSection = {
		domain: WorldbuildingDomainConfig;
		proposals: WorldbuildProposalRecord[];
	};

	interface Props {
		title?: string;
		showEmpty?: boolean;
		onAccept?: (proposalId: string, projectId: string) => void | Promise<void>;
		onReject?: (proposalId: string, reason: string, projectId: string) => void | Promise<void>;
	}

	let {
		title = 'Suggested worldbuilding changes',
		showEmpty = false,
		onAccept,
		onReject,
	}: Props = $props();

	const isLoading = $derived(getIsLoadingSuggestions());
	const loadError = $derived(getSuggestionLoadError());
	const sections = $derived<DomainProposalSection[]>(
		WORLDBUILDING_DOMAIN_SEQUENCE.map((domain) => ({
			domain,
			proposals: getSuggestionsByCategory(domain.id),
		})),
	);
	const visibleSections = $derived(sections.filter((section) => section.proposals.length > 0));
	const shouldRender = $derived(
		isLoading || loadError !== null || visibleSections.length > 0 || showEmpty,
	);

	let activeProposalId = $state<string | null>(null);
	let actionMessage = $state<string | null>(null);
	let actionError = $state<string | null>(null);

	function suggestionSummary(count: number): string {
		return `${count} suggestion${count === 1 ? '' : 's'} ready for review`;
	}

	function applyActionResult(result: WorldbuildProposalActionResult): void {
		if (result.ok) {
			actionMessage = result.message;
			actionError = null;
			return;
		}

		actionMessage = null;
		actionError =
			result.kind === 'conflict'
				? `Review conflict: ${result.error}`
				: `Review action failed: ${result.error}`;
	}

	async function handleAccept(proposalId: string, projectId: string): Promise<void> {
		if (activeProposalId) return;
		activeProposalId = proposalId;
		actionMessage = null;
		actionError = null;
		try {
			if (onAccept) {
				await onAccept(proposalId, projectId);
				actionMessage = 'Suggestion accepted and projected to canon.';
			} else {
				applyActionResult(await acceptWorldbuildProposalForReview(projectId, proposalId));
			}
		} finally {
			activeProposalId = null;
		}
	}

	async function handleReject(
		proposalId: string,
		reason: string,
		projectId: string,
	): Promise<void> {
		if (activeProposalId) return;
		activeProposalId = proposalId;
		actionMessage = null;
		actionError = null;
		try {
			if (onReject) {
				await onReject(proposalId, reason, projectId);
				actionMessage = 'Suggestion rejected.';
			} else {
				applyActionResult(await rejectWorldbuildProposalForReview(projectId, proposalId, reason));
			}
		} finally {
			activeProposalId = null;
		}
	}
</script>

{#if shouldRender}
	<section class="proposal-review" aria-labelledby="worldbuilding-proposal-review-title">
		<header class="proposal-review__header">
			<div>
				<p class="proposal-review__eyebrow">Review gate</p>
				<h2 id="worldbuilding-proposal-review-title">{title}</h2>
			</div>
			<p>
				Generated ideas stay out of canon until you explicitly accept them.
			</p>
		</header>

		{#if actionMessage}
			<p class="proposal-review__action-status" role="status">{actionMessage}</p>
		{/if}

		{#if actionError}
			<p class="proposal-review__action-status proposal-review__action-status--error" role="alert">
				{actionError}
			</p>
		{/if}

		{#if isLoading || loadError}
			<WorldbuildingProposedTile
				categoryId={WORLDBUILDING_DOMAIN_SEQUENCE[0].id}
				onAccept={handleAccept}
				onReject={handleReject}
				{activeProposalId}
			/>
		{:else if visibleSections.length === 0}
			<div class="proposal-review__empty">
				<p>No pending worldbuilding suggestions.</p>
				<span>Run a scan to create reviewable suggestions for this project.</span>
			</div>
		{:else}
			<div class="proposal-review__domains">
				{#each visibleSections as section (section.domain.id)}
					<section
						class="proposal-review__domain"
						aria-labelledby={`worldbuilding-proposal-review-${section.domain.id}`}
					>
						<header class="proposal-review__domain-header">
							<div>
								<p class="proposal-review__domain-eyebrow">
									{suggestionSummary(section.proposals.length)}
								</p>
								<h3 id={`worldbuilding-proposal-review-${section.domain.id}`}>
									{section.domain.label}
								</h3>
							</div>
							<span class="proposal-review__domain-count">
								{section.proposals.length}
							</span>
						</header>
						<WorldbuildingProposedTile
							categoryId={section.domain.id}
							onAccept={handleAccept}
							onReject={handleReject}
							{activeProposalId}
						/>
					</section>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	.proposal-review {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding: var(--space-6) 0;
		border-block: 1px solid var(--color-border-subtle);
	}

	.proposal-review__header {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		align-items: start;
	}

	.proposal-review__header h2,
	.proposal-review__domain-header h3,
	.proposal-review__header p,
	.proposal-review__domain-eyebrow,
	.proposal-review__empty p,
	.proposal-review__empty span {
		margin: 0;
	}

	.proposal-review__header h2 {
		font-size: var(--text-2xl);
	}

	.proposal-review__header > p {
		max-width: 36ch;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	.proposal-review__eyebrow,
	.proposal-review__domain-eyebrow {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.proposal-review__domains {
		display: grid;
		gap: var(--space-4);
	}

	.proposal-review__action-status {
		margin: 0;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid color-mix(in srgb, var(--color-success) 28%, var(--color-border-subtle));
		background: color-mix(in srgb, var(--color-success) 10%, var(--color-surface-overlay));
		color: var(--color-success);
		font-size: var(--text-sm);
	}

	.proposal-review__action-status--error {
		border-color: color-mix(in srgb, var(--color-error) 28%, var(--color-border-subtle));
		background: color-mix(in srgb, var(--color-error) 10%, var(--color-surface-overlay));
		color: var(--color-error);
	}

	.proposal-review__domain {
		display: grid;
		gap: var(--space-3);
	}

	.proposal-review__domain-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.proposal-review__domain-header h3 {
		font-size: var(--text-lg);
	}

	.proposal-review__domain-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--space-6);
		height: var(--space-6);
		padding: 0 var(--space-2);
		border-radius: var(--radius-full);
		border: 1px solid color-mix(in srgb, var(--color-brass) 38%, transparent);
		background: color-mix(in srgb, var(--color-brass) 16%, transparent);
		color: var(--color-brass);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}

	.proposal-review__empty {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-4);
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
	}

	.proposal-review__empty span {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	@media (max-width: 640px) {
		.proposal-review__header {
			flex-direction: column;
		}
	}
</style>
