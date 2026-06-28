import { beforeEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import type { BrainstormProposal } from '$lib/ai/types.js';
import ProposalCard from '$modules/nova/components/brainstorm/ProposalCard.svelte';
import { brainstormStaging } from '$lib/stores/brainstorm-staging.store.svelte.js';

const proposal: BrainstormProposal = {
	id: 'protagonist-1',
	category: 'protagonist_sketch',
	title: 'Junior Surveyor',
	description: 'A careful mapmaker finds contradictions in court records.',
	rationale: 'Keeps the protagonist tied to the seed.',
	worldbuildSeedTarget: 'character_seed',
};

describe('ProposalCard brainstorm actions', () => {
	beforeEach(() => {
		brainstormStaging.clear();
	});

	it('accepts, removes, discards, and restores a proposal in the staging store', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		const cmp = mount(ProposalCard, {
			target,
			props: {
				proposal,
				sessionSeedIdea: 'A court cartographer seed.',
			},
		});
		flushSync();

		target.querySelector<HTMLButtonElement>('[data-testid="nova-brainstorm-accept"]')?.click();
		flushSync();
		expect(brainstormStaging.getDecision(proposal.id)).toBe('accepted');
		expect(target.textContent).toContain('Accepted for worldbuilding');

		target.querySelector<HTMLButtonElement>('[data-testid="nova-brainstorm-remove"]')?.click();
		flushSync();
		expect(brainstormStaging.getDecision(proposal.id)).toBe('idle');

		target.querySelector<HTMLButtonElement>('[data-testid="nova-brainstorm-reject"]')?.click();
		flushSync();
		expect(brainstormStaging.getDecision(proposal.id)).toBe('rejected');
		expect(target.textContent).toContain('Discarded');

		target.querySelector<HTMLButtonElement>('[data-testid="nova-brainstorm-accept"]')?.click();
		flushSync();
		expect(brainstormStaging.getDecision(proposal.id)).toBe('accepted');

		unmount(cmp);
		target.remove();
	});
});
