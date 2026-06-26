import { describe, expect, expectTypeOf, it } from 'vitest';
import {
	BRAINSTORM_AGENT_JSON_SCHEMA,
	BRAINSTORM_AGENT_RESPONSE_FORMAT,
	BRAINSTORM_AGENT_SCHEMA_VERSION,
	BRAINSTORM_PROPOSAL_CATEGORIES,
	BRAINSTORM_WORLD_BUILD_SEED_TARGETS,
	type BrainstormAgentRequest,
	type BrainstormProposal,
	type BrainstormProposalCategory,
	type BrainstormSession
} from '../../src/lib/ai/types.js';

function asRecord(value: unknown): Record<string, unknown> {
	expect(value).toBeTypeOf('object');
	expect(value).not.toBeNull();
	return value as Record<string, unknown>;
}

function propertiesOf(value: unknown): Record<string, unknown> {
	return asRecord(asRecord(value).properties);
}

describe('BrainstormAgent schema contract', () => {
	it('defines request and session types for the four proposal groups', () => {
		const request: BrainstormAgentRequest = {
			seedIdea: 'A cartographer discovers that maps are changing overnight.',
			context: {
				projectId: 'project-1',
				projectTitle: 'The Rewritten Coast',
				genre: 'fantasy mystery',
				tone: 'wonder with dread',
				mustInclude: ['coastal city'],
				avoid: ['chosen-one prophecy']
			},
			requestedCategories: ['premise_variant', 'thematic_thread'],
			maxProposalsPerCategory: 2
		};

		const session: BrainstormSession = {
			schemaVersion: BRAINSTORM_AGENT_SCHEMA_VERSION,
			seedIdea: request.seedIdea,
			proposals: {
				premiseVariants: [
					{
						id: 'premise-1',
						category: 'premise_variant',
						title: 'The Moving Harbor',
						description: 'Each map revision predicts a missing district before the tide erases it.',
						rationale: 'Keeps the premise focused on map changes and author-controlled stakes.',
						worldbuildSeedTarget: 'premise_note',
						tags: ['maps', 'coast']
					}
				],
				thematicThreads: [
					{
						id: 'theme-1',
						category: 'thematic_thread',
						title: 'Memory Against Infrastructure',
						description: 'Public records deny what older residents still remember.',
						rationale: 'Gives the story a recurring pressure without inventing canon.',
						worldbuildSeedTarget: 'theme_seed',
						confidence: 'medium'
					}
				],
				genreHooks: [],
				protagonistSketches: [
					{
						id: 'protagonist-1',
						category: 'protagonist_sketch',
						title: 'Apprentice Surveyor',
						description: 'A junior surveyor notices the map archive contradicts her field notes.',
						rationale: 'Creates a protagonist seed that can prefill a later character draft.',
						worldbuildSeedTarget: 'character_seed',
						storyQuestion: 'What did she lose the first time the map changed?'
					}
				]
			}
		};

		const flattened: BrainstormProposal[] = [
			...session.proposals.premiseVariants,
			...session.proposals.thematicThreads,
			...session.proposals.genreHooks,
			...session.proposals.protagonistSketches
		];

		expectTypeOf(request).toMatchTypeOf<BrainstormAgentRequest>();
		expectTypeOf(session).toMatchTypeOf<BrainstormSession>();
		expectTypeOf(flattened[0]?.category).toMatchTypeOf<BrainstormProposalCategory | undefined>();
		expect(flattened).toHaveLength(3);
	});

	it('exposes stable category and worldbuilding seed target constants', () => {
		expect(BRAINSTORM_PROPOSAL_CATEGORIES).toEqual([
			'premise_variant',
			'thematic_thread',
			'genre_hook',
			'protagonist_sketch'
		]);
		expect(BRAINSTORM_WORLD_BUILD_SEED_TARGETS).toContain('character_seed');
		expect(BRAINSTORM_WORLD_BUILD_SEED_TARGETS).toContain('premise_note');
	});

	it('provides a strict JSON schema grouped by proposal category', () => {
		const root = asRecord(BRAINSTORM_AGENT_JSON_SCHEMA);
		const rootProperties = propertiesOf(root);
		const proposals = asRecord(rootProperties.proposals);
		const proposalProperties = propertiesOf(proposals);

		expect(root.additionalProperties).toBe(false);
		expect(root.required).toEqual(['schemaVersion', 'seedIdea', 'proposals']);
		expect(proposals.additionalProperties).toBe(false);
		expect(proposals.required).toEqual([
			'premiseVariants',
			'thematicThreads',
			'genreHooks',
			'protagonistSketches'
		]);

		for (const key of ['premiseVariants', 'thematicThreads', 'genreHooks', 'protagonistSketches']) {
			const group = asRecord(proposalProperties[key]);
			const item = asRecord(group.items);
			expect(group.type).toBe('array');
			expect(item.additionalProperties).toBe(false);
			expect(item.required).toEqual(['id', 'category', 'title', 'description', 'rationale']);
		}
	});

	it('exports an OpenRouter-compatible response_format wrapper', () => {
		expect(BRAINSTORM_AGENT_RESPONSE_FORMAT).toEqual({
			type: 'json_schema',
			jsonSchema: {
				name: 'brainstorm_agent_session',
				strict: true,
				schema: BRAINSTORM_AGENT_JSON_SCHEMA
			}
		});
	});
});
