<script lang="ts">
	import type {
		BrainstormProposal,
		BrainstormProposalCategory,
		BrainstormWorldbuildSeedTarget,
	} from '$lib/ai/types.js';
	import { brainstormStaging } from '$lib/stores/brainstorm-staging.store.svelte.js';

	interface Props {
		proposal: BrainstormProposal;
		sessionSeedIdea?: string;
	}

	let { proposal, sessionSeedIdea = '' }: Props = $props();

	const categoryLabels: Record<BrainstormProposalCategory, string> = {
		premise_variant: 'Premise',
		thematic_thread: 'Theme',
		genre_hook: 'Hook',
		protagonist_sketch: 'Protagonist',
	};

	const targetLabels: Record<BrainstormWorldbuildSeedTarget, string> = {
		premise_note: 'Premise note',
		character_seed: 'Character seed',
		location_seed: 'Location seed',
		faction_seed: 'Faction seed',
		lore_seed: 'Lore seed',
		plot_thread_seed: 'Plot thread seed',
		theme_seed: 'Theme seed',
	};

	const categoryLabel = $derived(categoryLabels[proposal.category]);
	const targetLabel = $derived(
		proposal.worldbuildSeedTarget ? targetLabels[proposal.worldbuildSeedTarget] : null,
	);
	const decisionState = $derived(brainstormStaging.getDecision(proposal.id));
	const decisionLabel = $derived.by(() => {
		if (decisionState === 'accepted') return 'Accepted for worldbuilding';
		if (decisionState === 'rejected') return 'Discarded';
		return 'Ready for review';
	});

	function handleAccept(): void {
		brainstormStaging.addSeed(proposal, { sessionSeedIdea });
	}

	function handleReject(): void {
		brainstormStaging.rejectSeed(proposal.id);
	}

	function handleRemove(): void {
		brainstormStaging.removeSeed(proposal.id);
	}
</script>

<article
	class="proposal-card"
	class:proposal-card--accepted={decisionState === 'accepted'}
	class:proposal-card--rejected={decisionState === 'rejected'}
	aria-label="{categoryLabel} proposal: {proposal.title}"
	data-category={proposal.category}
	data-decision={decisionState}
	data-testid="nova-brainstorm-proposal-card"
>
	<header class="proposal-card__header">
		<span class="proposal-card__category">{categoryLabel}</span>
		<div class="proposal-card__badges">
			<span class="proposal-card__decision">{decisionLabel}</span>
			{#if proposal.confidence}
				<span class="proposal-card__confidence">{proposal.confidence}</span>
			{/if}
		</div>
	</header>

	<div class="proposal-card__body">
		<h4>{proposal.title}</h4>
		<p class="proposal-card__description">{proposal.description}</p>
		<p class="proposal-card__rationale">{proposal.rationale}</p>
	</div>

	{#if proposal.storyQuestion}
		<p class="proposal-card__question">
			<span>Question</span>
			{proposal.storyQuestion}
		</p>
	{/if}

	<footer class="proposal-card__footer">
		<div class="proposal-card__metadata">
			{#if targetLabel}
				<span class="proposal-card__target">{targetLabel}</span>
			{/if}
			{#if proposal.tags && proposal.tags.length > 0}
				<ul class="proposal-card__tags" aria-label="Proposal tags">
					{#each proposal.tags as tag (tag)}
						<li>{tag}</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div class="proposal-card__actions" aria-label="Proposal review actions">
			{#if decisionState === 'accepted'}
				<button
					type="button"
					class="proposal-card__action proposal-card__action--secondary"
					onclick={handleRemove}
					data-testid="nova-brainstorm-remove"
				>
					Remove
				</button>
			{:else}
				<button
					type="button"
					class="proposal-card__action proposal-card__action--primary"
					onclick={handleAccept}
					data-testid="nova-brainstorm-accept"
				>
					{decisionState === 'rejected' ? 'Restore' : 'Accept'}
				</button>
			{/if}
			<button
				type="button"
				class="proposal-card__action proposal-card__action--secondary"
				disabled={decisionState === 'rejected'}
				onclick={handleReject}
				data-testid="nova-brainstorm-reject"
			>
				Discard
			</button>
		</div>
	</footer>
</article>

<style>
	.proposal-card {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		min-width: 0;
	}

	.proposal-card--accepted {
		border-color: color-mix(in srgb, var(--color-success) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-success) 7%, var(--color-surface-overlay));
	}

	.proposal-card--rejected {
		opacity: 0.68;
	}

	.proposal-card__header,
	.proposal-card__footer,
	.proposal-card__badges,
	.proposal-card__metadata,
	.proposal-card__actions,
	.proposal-card__tags {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-wrap: wrap;
	}

	.proposal-card__header {
		justify-content: space-between;
	}

	.proposal-card__category,
	.proposal-card__decision,
	.proposal-card__confidence,
	.proposal-card__target,
	.proposal-card__tags li,
	.proposal-card__question span {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
	}

	.proposal-card__category,
	.proposal-card__target {
		color: var(--color-candle);
	}

	.proposal-card__decision {
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		background: var(--color-surface-ground);
		color: var(--color-text-muted);
	}

	.proposal-card--accepted .proposal-card__decision {
		border-color: color-mix(in srgb, var(--color-success) 45%, var(--color-border-subtle));
		color: var(--color-success-on-dark);
	}

	.proposal-card__confidence,
	.proposal-card__tags li {
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		background: var(--color-surface-ground);
		color: var(--color-text-secondary);
		text-transform: capitalize;
	}

	.proposal-card__body {
		display: grid;
		gap: var(--space-2);
		min-width: 0;
	}

	.proposal-card__body h4,
	.proposal-card__description,
	.proposal-card__rationale,
	.proposal-card__question {
		margin: 0;
	}

	.proposal-card__body h4 {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
		overflow-wrap: anywhere;
	}

	.proposal-card__description {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		line-height: var(--leading-normal);
		overflow-wrap: anywhere;
	}

	.proposal-card__rationale,
	.proposal-card__question {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
		overflow-wrap: anywhere;
	}

	.proposal-card__question {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: var(--color-surface-ground);
	}

	.proposal-card__question span {
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.proposal-card__footer {
		justify-content: space-between;
	}

	.proposal-card__metadata {
		min-width: 0;
	}

	.proposal-card__tags {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.proposal-card__actions {
		justify-content: flex-end;
		margin-left: auto;
	}

	.proposal-card__action {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		background: var(--color-surface-ground);
		color: var(--color-text-secondary);
		font: inherit;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
	}

	.proposal-card__action--primary {
		border-color: color-mix(in srgb, var(--color-candle) 45%, var(--color-border-subtle));
		color: var(--color-candle);
	}

	.proposal-card__action:hover:not(:disabled) {
		border-color: var(--color-border-default);
		color: var(--color-text-primary);
	}

	.proposal-card__action:disabled {
		opacity: 0.48;
		cursor: not-allowed;
	}
</style>
