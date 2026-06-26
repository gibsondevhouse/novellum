import { describe, expect, it } from 'vitest';
import {
	BrainstormParseError,
	buildBrainstormPrompt,
	getBrainstormResponseFormat,
	isBrainstormProposalCategory,
	parseBrainstormOutput
} from '../../src/lib/ai/brainstorm-agent.js';
import {
	BRAINSTORM_AGENT_RESPONSE_FORMAT,
	BRAINSTORM_AGENT_SCHEMA_VERSION,
	type AiContext,
	type BrainstormAgentRequest
} from '../../src/lib/ai/types.js';

const emptyCtx: AiContext = {
	policy: 'worldbuilding_scope',
	scene: null,
	adjacentScenes: [],
	chapter: null,
	beats: [],
	characters: [],
	locations: [],
	loreEntries: [],
	plotThreads: []
};

const request: BrainstormAgentRequest = {
	seedIdea: 'A cartographer notices the coastline changes whenever someone lies in court.',
	context: {
		projectId: 'project-1',
		projectTitle: 'False Coast',
		genre: 'fantasy mystery',
		tone: 'quiet dread',
		mustInclude: ['map archive'],
		avoid: ['chosen-one prophecy']
	},
	requestedCategories: ['premise_variant', 'protagonist_sketch'],
	maxProposalsPerCategory: 2
};

describe('BrainstormAgent prompt builder', () => {
	it('builds a five-section prompt grounded in the request', () => {
		const prompt = buildBrainstormPrompt(request, emptyCtx);

		expect(prompt).toContain('## ROLE');
		expect(prompt).toContain('## TASK');
		expect(prompt).toContain('## CONTEXT');
		expect(prompt).toContain('## CONSTRAINTS');
		expect(prompt).toContain('## OUTPUT FORMAT');
		expect(prompt).toContain('Novellum BrainstormAgent');
		expect(prompt).toContain(request.seedIdea);
		expect(prompt).toContain('fantasy mystery');
		expect(prompt).toContain('premiseVariants');
		expect(prompt).toContain('thematicThreads');
		expect(prompt).toContain('genreHooks');
		expect(prompt).toContain('protagonistSketches');
		expect(prompt).toContain(BRAINSTORM_AGENT_SCHEMA_VERSION);
	});

	it('references the strict BrainstormSession JSON schema and response format constant', () => {
		const prompt = buildBrainstormPrompt(request, emptyCtx);

		expect(prompt).toContain('BRAINSTORM_AGENT_RESPONSE_FORMAT');
		expect(prompt).toContain('"schemaVersion"');
		expect(prompt).toContain('"const": "1.0.0"');
		expect(getBrainstormResponseFormat()).toBe(BRAINSTORM_AGENT_RESPONSE_FORMAT);
	});

	it('includes compact worldbuilding context without manuscript prose', () => {
		const ctx: AiContext = {
			...emptyCtx,
			project: {
				id: 'project-1',
				title: 'False Coast',
				genre: 'fantasy',
				status: 'drafting',
				projectType: 'novel',
				targetWordCount: 90_000,
				logline: 'A court cartographer maps lies as geography.',
				synopsis: 'The city changes shape whenever officials rewrite the truth.',
				lastOpenedAt: '',
				stylePresetId: '',
				systemPrompt: '',
				negativePrompt: '',
				createdAt: '',
				updatedAt: ''
			},
			characters: [
				{
					id: 'char-1',
					projectId: 'project-1',
					name: 'Ilen',
					role: 'Cartographer',
					pronunciation: '',
					aliases: [],
					diasporaOrigin: '',
					photoUrl: '',
					bio: '',
					faction: '',
					anomalies: [],
					traits: ['observant'],
					goals: ['protect the archive'],
					flaws: [],
					arcs: [],
					notes: '',
					tags: [],
					createdAt: '',
					updatedAt: ''
				}
			],
			loreEntries: [
				{
					id: 'lore-1',
					projectId: 'project-1',
					title: 'Map Court',
					category: 'Institution',
					content: 'Judges maintain the official maps.',
					tags: [],
					createdAt: '',
					updatedAt: ''
				}
			]
		};

		const prompt = buildBrainstormPrompt(request, ctx);

		expect(prompt).toContain('False Coast');
		expect(prompt).toContain('Ilen');
		expect(prompt).toContain('Map Court');
		expect(prompt).not.toContain('ACTIVE SCENE');
		expect(prompt).not.toContain('Content:');
	});

	it('bounds very long seed ideas to the shared prompt limit', () => {
		const prompt = buildBrainstormPrompt(
			{
				...request,
				seedIdea: `A premise with special characters "quotes" and newlines\n${'x'.repeat(20_000)}`
			},
			emptyCtx
		);

		expect(prompt.length).toBeLessThanOrEqual(8_000);
		expect(prompt).toContain('[truncated]');
		expect(prompt).toContain('\\"quotes\\"');
	});
});

const validSession = {
	schemaVersion: BRAINSTORM_AGENT_SCHEMA_VERSION,
	seedIdea: request.seedIdea,
	proposals: {
		premiseVariants: [
			{
				id: 'premise-1',
				category: 'premise_variant',
				title: 'Cartography of Lies',
				description: 'The protagonist discovers court transcripts rewriting the coastline.',
				rationale: 'Builds a premise from the seed without making it canon.',
				worldbuildSeedTarget: 'premise_note',
				tags: ['maps']
			}
		],
		thematicThreads: [
			{
				id: 'theme-1',
				category: 'thematic_thread',
				title: 'Truth As Infrastructure',
				description: 'The city can only stand while civic truth is maintained.',
				rationale: 'Turns the magical hook into a repeatable thematic pressure.',
				confidence: 'high'
			}
		],
		genreHooks: [
			{
				id: 'hook-1',
				category: 'genre_hook',
				title: 'Legal Cartography',
				description: 'A procedural mystery where every testimony changes physical geography.',
				rationale: 'Keeps the hook legible as fantasy mystery.'
			}
		],
		protagonistSketches: [
			{
				id: 'protagonist-1',
				category: 'protagonist_sketch',
				title: 'Court Surveyor',
				description: 'A junior surveyor compares official maps against forbidden field notes.',
				rationale: 'Creates a reviewable character seed tied to the premise.',
				worldbuildSeedTarget: 'character_seed',
				storyQuestion: 'What truth did they hide to keep their job?'
			}
		]
	}
};

describe('BrainstormAgent parser', () => {
	it('parses valid BrainstormSession JSON', () => {
		const parsed = parseBrainstormOutput(JSON.stringify(validSession));

		expect(parsed.schemaVersion).toBe(BRAINSTORM_AGENT_SCHEMA_VERSION);
		expect(parsed.proposals.premiseVariants[0]?.category).toBe('premise_variant');
		expect(parsed.proposals.protagonistSketches[0]?.worldbuildSeedTarget).toBe('character_seed');
	});

	it('extracts JSON when surrounded by provider prose', () => {
		const parsed = parseBrainstormOutput(`Here is the JSON:\n${JSON.stringify(validSession)}\nDone.`);

		expect(parsed.proposals.genreHooks).toHaveLength(1);
	});

	it('accepts empty proposal arrays', () => {
		const parsed = parseBrainstormOutput(
			JSON.stringify({
				...validSession,
				proposals: {
					premiseVariants: [],
					thematicThreads: [],
					genreHooks: [],
					protagonistSketches: []
				}
			})
		);

		expect(parsed.proposals.premiseVariants).toEqual([]);
		expect(parsed.proposals.protagonistSketches).toEqual([]);
	});

	it('strips unknown root and proposal fields', () => {
		const parsed = parseBrainstormOutput(
			JSON.stringify({
				...validSession,
				unexpectedRoot: true,
				proposals: {
					...validSession.proposals,
					premiseVariants: [
						{
							...validSession.proposals.premiseVariants[0],
							unexpectedProposalField: 'ignored'
						}
					]
				}
			})
		);

		expect('unexpectedRoot' in parsed).toBe(false);
		expect('unexpectedProposalField' in parsed.proposals.premiseVariants[0]!).toBe(false);
	});

	it('throws missing_json when no object is present', () => {
		expect(() => parseBrainstormOutput('No structured output here')).toThrow(BrainstormParseError);

		try {
			parseBrainstormOutput('No structured output here');
		} catch (error) {
			expect(error).toBeInstanceOf(BrainstormParseError);
			expect((error as BrainstormParseError).code).toBe('missing_json');
		}
	});

	it('throws invalid_json for malformed JSON', () => {
		expect(() => parseBrainstormOutput('{ "schemaVersion": }')).toThrow(BrainstormParseError);

		try {
			parseBrainstormOutput('{ "schemaVersion": }');
		} catch (error) {
			expect(error).toBeInstanceOf(BrainstormParseError);
			expect((error as BrainstormParseError).code).toBe('invalid_json');
		}
	});

	it('throws schema_validation_failed for missing required fields', () => {
		expect(() =>
			parseBrainstormOutput(JSON.stringify({ ...validSession, proposals: undefined }))
		).toThrow(BrainstormParseError);

		try {
			parseBrainstormOutput(JSON.stringify({ ...validSession, proposals: undefined }));
		} catch (error) {
			expect(error).toBeInstanceOf(BrainstormParseError);
			expect((error as BrainstormParseError).code).toBe('schema_validation_failed');
			expect((error as BrainstormParseError).details?.[0]).toContain('proposals');
		}
	});

	it('throws schema_validation_failed when a proposal is in the wrong group', () => {
		const wrongGroupPayload = JSON.stringify({
			...validSession,
			proposals: {
				...validSession.proposals,
				premiseVariants: [
					{
						...validSession.proposals.premiseVariants[0],
						category: 'genre_hook'
					}
				]
			}
		});

		expect(() => parseBrainstormOutput(wrongGroupPayload)).toThrow(BrainstormParseError);

		try {
			parseBrainstormOutput(wrongGroupPayload);
		} catch (error) {
			expect(error).toBeInstanceOf(BrainstormParseError);
			expect((error as BrainstormParseError).code).toBe('schema_validation_failed');
			expect((error as BrainstormParseError).details?.join('\n')).toContain('premiseVariants');
		}
	});

	it('identifies known brainstorm proposal categories', () => {
		expect(isBrainstormProposalCategory('genre_hook')).toBe(true);
		expect(isBrainstormProposalCategory('summary')).toBe(false);
	});
});
