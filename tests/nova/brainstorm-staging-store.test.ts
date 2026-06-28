import { beforeEach, describe, expect, it } from 'vitest';
import type { BrainstormProposal } from '$lib/ai/types.js';
import { brainstormStaging } from '$lib/stores/brainstorm-staging.store.svelte.js';

const characterSeed: BrainstormProposal = {
	id: 'character-seed-1',
	category: 'protagonist_sketch',
	title: 'The Tide Surveyor',
	description: 'A mapmaker who notices coastlines changing after official lies.',
	rationale: 'Turns the seed into a reviewable protagonist concept.',
	worldbuildSeedTarget: 'character_seed',
	storyQuestion: 'What truth are they afraid to map?',
};

const realmSeed: BrainstormProposal = {
	id: 'realm-seed-1',
	category: 'premise_variant',
	title: 'False Coast',
	description: 'A coastline that shifts whenever the court revises history.',
	rationale: 'Gives the premise a concrete setting pressure.',
	worldbuildSeedTarget: 'location_seed',
};

describe('brainstormStaging', () => {
	beforeEach(() => {
		brainstormStaging.clear();
	});

	it('tracks accept, reject, remove, and clear decisions without persistence', () => {
		brainstormStaging.addSeed(characterSeed, {
			sessionSeedIdea: 'A lying court redraws maps.',
			acceptedAt: '2026-06-28T13:22:00.000Z',
		});

		expect(brainstormStaging.getDecision(characterSeed.id)).toBe('accepted');
		expect(brainstormStaging.acceptedSeeds).toHaveLength(1);
		expect(brainstormStaging.acceptedSeeds[0]).toMatchObject({
			entityKind: 'character',
			seedTarget: 'character_seed',
			sessionSeedIdea: 'A lying court redraws maps.',
		});

		brainstormStaging.rejectSeed(characterSeed.id);
		expect(brainstormStaging.getDecision(characterSeed.id)).toBe('rejected');
		expect(brainstormStaging.acceptedSeeds).toHaveLength(0);

		brainstormStaging.addSeed(characterSeed);
		expect(brainstormStaging.getDecision(characterSeed.id)).toBe('accepted');
		expect(brainstormStaging.rejectedProposalIds).toHaveLength(0);

		brainstormStaging.removeSeed(characterSeed.id);
		expect(brainstormStaging.getDecision(characterSeed.id)).toBe('idle');

		brainstormStaging.addSeed(characterSeed);
		brainstormStaging.clear();
		expect(brainstormStaging.acceptedSeeds).toHaveLength(0);
		expect(brainstormStaging.rejectedProposalIds).toHaveLength(0);
	});

	it('builds generation context from accepted seeds for the matching worldbuilding entity kind', () => {
		brainstormStaging.addSeed(characterSeed);
		brainstormStaging.addSeed(realmSeed);

		expect(brainstormStaging.getSeedsForEntityKind('character')).toHaveLength(1);
		expect(brainstormStaging.getSeedsForEntityKind('realm')).toHaveLength(1);
		expect(brainstormStaging.getDuplicateTitlesForEntityKind('realm', ['False Coast'])).toEqual([
			'False Coast',
		]);

		const context = brainstormStaging.buildGenerationContext('realm');
		expect(context?.note).toContain('Accepted Brainstorm seeds are staged context only');
		expect(context?.note).toContain('False Coast');
		expect(context?.hints).toEqual([
			{
				name: 'False Coast',
				intent: 'target',
				source: 'brainstorm',
			},
		]);
	});
});
