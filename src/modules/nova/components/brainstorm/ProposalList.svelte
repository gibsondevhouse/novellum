<script lang="ts">
	import type { BrainstormSession } from '$lib/ai/types.js';
	import ProposalCard from './ProposalCard.svelte';

	interface Props {
		session?: BrainstormSession | null;
		ariaLabel?: string;
	}

	let { session = null, ariaLabel = 'Brainstorm proposals' }: Props = $props();

	const premiseVariants = $derived(session?.proposals.premiseVariants ?? []);
	const thematicThreads = $derived(session?.proposals.thematicThreads ?? []);
	const genreHooks = $derived(session?.proposals.genreHooks ?? []);
	const protagonistSketches = $derived(session?.proposals.protagonistSketches ?? []);
	const totalCount = $derived(
		premiseVariants.length +
			thematicThreads.length +
			genreHooks.length +
			protagonistSketches.length,
	);
</script>

<section class="proposal-list" aria-label={ariaLabel} data-testid="nova-brainstorm-proposals">
	<header class="proposal-list__header">
		<div>
			<p class="proposal-list__eyebrow">Review surface</p>
			<h3>Generated seeds</h3>
		</div>
		<span class="proposal-list__count" data-testid="nova-brainstorm-proposal-count">
			{totalCount} total
		</span>
	</header>

	{#if !session}
		<div class="proposal-list__empty" role="status">
			<h4>No brainstorm run yet</h4>
			<p>Submit a seed idea to generate categorized proposals.</p>
		</div>
	{:else if totalCount === 0}
		<div class="proposal-list__empty" role="status">
			<h4>No useful seeds returned</h4>
			<p>Try a more specific premise, conflict, image, or character prompt.</p>
		</div>
	{:else}
		<div class="proposal-list__sections">
			<section class="proposal-list__section" aria-labelledby="brainstorm-premise-heading">
				<header>
					<h4 id="brainstorm-premise-heading">Premise variants</h4>
					<span>{premiseVariants.length}</span>
				</header>
				<div class="proposal-list__grid">
					{#each premiseVariants as proposal (proposal.id)}
						<ProposalCard {proposal} sessionSeedIdea={session.seedIdea} />
					{/each}
				</div>
			</section>

			<section class="proposal-list__section" aria-labelledby="brainstorm-theme-heading">
				<header>
					<h4 id="brainstorm-theme-heading">Thematic threads</h4>
					<span>{thematicThreads.length}</span>
				</header>
				<div class="proposal-list__grid">
					{#each thematicThreads as proposal (proposal.id)}
						<ProposalCard {proposal} sessionSeedIdea={session.seedIdea} />
					{/each}
				</div>
			</section>

			<section class="proposal-list__section" aria-labelledby="brainstorm-hooks-heading">
				<header>
					<h4 id="brainstorm-hooks-heading">Genre hooks</h4>
					<span>{genreHooks.length}</span>
				</header>
				<div class="proposal-list__grid">
					{#each genreHooks as proposal (proposal.id)}
						<ProposalCard {proposal} sessionSeedIdea={session.seedIdea} />
					{/each}
				</div>
			</section>

			<section class="proposal-list__section" aria-labelledby="brainstorm-protagonist-heading">
				<header>
					<h4 id="brainstorm-protagonist-heading">Protagonist sketches</h4>
					<span>{protagonistSketches.length}</span>
				</header>
				<div class="proposal-list__grid">
					{#each protagonistSketches as proposal (proposal.id)}
						<ProposalCard {proposal} sessionSeedIdea={session.seedIdea} />
					{/each}
				</div>
			</section>
		</div>
	{/if}
</section>

<style>
	.proposal-list {
		display: grid;
		gap: var(--space-3);
		color: var(--color-text-primary);
	}

	.proposal-list__header,
	.proposal-list__section header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.proposal-list__header h3,
	.proposal-list__header p,
	.proposal-list__section h4,
	.proposal-list__empty h4,
	.proposal-list__empty p {
		margin: 0;
	}

	.proposal-list__eyebrow {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.proposal-list__header h3 {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}

	.proposal-list__count,
	.proposal-list__section header span {
		flex-shrink: 0;
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		background: var(--color-surface-ground);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
	}

	.proposal-list__sections,
	.proposal-list__section {
		display: grid;
		gap: var(--space-3);
	}

	.proposal-list__section {
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-raised);
	}

	.proposal-list__section h4 {
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.proposal-list__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, calc(var(--space-16) * 4)), 1fr));
		gap: var(--space-2);
	}

	.proposal-list__grid:empty::before {
		content: 'No proposals in this category.';
		display: block;
		padding: var(--space-3);
		border: 1px dashed var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}

	.proposal-list__empty {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-4);
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-raised);
	}

	.proposal-list__empty h4 {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}

	.proposal-list__empty p {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
	}
</style>
