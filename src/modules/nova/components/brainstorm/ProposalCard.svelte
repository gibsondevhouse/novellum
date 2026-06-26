<script lang="ts">
	import type {
		BrainstormProposal,
		BrainstormProposalCategory,
		BrainstormWorldbuildSeedTarget
	} from '$lib/ai/types.js';

	interface Props {
		proposal: BrainstormProposal;
	}

	let { proposal }: Props = $props();

	const categoryLabels: Record<BrainstormProposalCategory, string> = {
		premise_variant: 'Premise',
		thematic_thread: 'Theme',
		genre_hook: 'Hook',
		protagonist_sketch: 'Protagonist'
	};

	const targetLabels: Record<BrainstormWorldbuildSeedTarget, string> = {
		premise_note: 'Premise note',
		character_seed: 'Character seed',
		location_seed: 'Location seed',
		faction_seed: 'Faction seed',
		lore_seed: 'Lore seed',
		plot_thread_seed: 'Plot thread seed',
		theme_seed: 'Theme seed'
	};

	const categoryLabel = $derived(categoryLabels[proposal.category]);
	const targetLabel = $derived(
		proposal.worldbuildSeedTarget ? targetLabels[proposal.worldbuildSeedTarget] : null
	);
</script>

<article
	class="proposal-card"
	aria-label="{categoryLabel} proposal: {proposal.title}"
	data-category={proposal.category}
	data-testid="nova-brainstorm-proposal-card"
>
	<header class="proposal-card__header">
		<span class="proposal-card__category">{categoryLabel}</span>
		{#if proposal.confidence}
			<span class="proposal-card__confidence">{proposal.confidence}</span>
		{/if}
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

	.proposal-card__header,
	.proposal-card__footer,
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

	.proposal-card__tags {
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
