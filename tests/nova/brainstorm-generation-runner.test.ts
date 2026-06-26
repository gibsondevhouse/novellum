import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
	BRAINSTORM_AGENT_SCHEMA_VERSION,
	type BrainstormSession,
} from '$lib/ai/types.js';
import {
	BRAINSTORM_GENERATION_ENDPOINT,
	requestBrainstormGeneration,
	runNovaBrainstormSession,
} from '$modules/nova/services/brainstorm-generation-runner.js';
import { novaSession } from '$modules/nova/stores/nova-session.svelte.js';

const session: BrainstormSession = {
	schemaVersion: BRAINSTORM_AGENT_SCHEMA_VERSION,
	seedIdea: 'A court cartographer notices the coastline changes whenever someone lies.',
	proposals: {
		premiseVariants: [
			{
				id: 'premise-1',
				category: 'premise_variant',
				title: 'False Coast',
				description: 'Each official lie redraws the shore.',
				rationale: 'Turns the seed into a reviewable premise.',
				worldbuildSeedTarget: 'premise_note',
			},
		],
		thematicThreads: [],
		genreHooks: [],
		protagonistSketches: [
			{
				id: 'protagonist-1',
				category: 'protagonist_sketch',
				title: 'Junior Surveyor',
				description: 'A careful mapmaker finds contradictions in court records.',
				rationale: 'Keeps the protagonist tied to the seed.',
				worldbuildSeedTarget: 'character_seed',
			},
		],
	},
};

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function parseLastBody(fetchMock: ReturnType<typeof vi.fn>): Record<string, unknown> {
	const calls = fetchMock.mock.calls as unknown as Array<[string, RequestInit]>;
	const init = calls.at(-1)?.[1];
	if (!init) throw new Error('Expected a fetch call.');
	return JSON.parse(String(init.body)) as Record<string, unknown>;
}

describe('requestBrainstormGeneration', () => {
	it('normalizes input and returns a validated BrainstormSession', async () => {
		const fetchMock = vi.fn(async () =>
			jsonResponse({
				session,
				model: 'openai/gpt-4o-mini',
				tokensUsed: 123,
				includedScopes: ['project', 'worldbuilding'],
				warnings: [],
				contextItemCount: 7,
			}),
		);

		const result = await requestBrainstormGeneration(
			{
				seedIdea: ` ${session.seedIdea} `,
				projectId: ' project-1 ',
				activeSceneId: ' scene-1 ',
				activeChapterId: ' chapter-1 ',
				maxProposalsPerCategory: 2,
			},
			{ fetch: fetchMock },
		);

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		expect(result.session.proposals.premiseVariants[0]?.title).toBe('False Coast');
		expect(result.model).toBe('openai/gpt-4o-mini');
		expect(result.tokensUsed).toBe(123);
		expect(result.contextItemCount).toBe(7);
		expect(fetchMock).toHaveBeenCalledWith(
			BRAINSTORM_GENERATION_ENDPOINT,
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		expect(parseLastBody(fetchMock)).toMatchObject({
			seedIdea: session.seedIdea,
			projectId: 'project-1',
			activeSceneId: 'scene-1',
			activeChapterId: 'chapter-1',
			maxProposalsPerCategory: 2,
		});
	});

	it('surfaces server errors as typed failures', async () => {
		const fetchMock = vi.fn(async () =>
			jsonResponse(
				{ error: { code: 'no_credentials', message: 'No AI provider credentials configured.' } },
				401,
			),
		);

		const result = await requestBrainstormGeneration({ seedIdea: 'seed' }, { fetch: fetchMock });

		expect(result.ok).toBe(false);
		expect(result.status).toBe('failed');
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('no_credentials');
		expect(result.error.status).toBe(401);
	});

	it('fails safely when success body contains a malformed session', async () => {
		const fetchMock = vi.fn(async () =>
			jsonResponse({
				session: { schemaVersion: BRAINSTORM_AGENT_SCHEMA_VERSION, seedIdea: 'seed' },
			}),
		);

		const result = await requestBrainstormGeneration({ seedIdea: 'seed' }, { fetch: fetchMock });

		expect(result.ok).toBe(false);
		expect(result.status).toBe('failed');
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('malformed_response');
	});

	it('rejects empty seed ideas before issuing a request', async () => {
		const fetchMock = vi.fn();

		const result = await requestBrainstormGeneration({ seedIdea: '   ' }, { fetch: fetchMock });

		expect(result.ok).toBe(false);
		expect(result.status).toBe('failed');
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('invalid_request');
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe('runNovaBrainstormSession', () => {
	beforeEach(() => {
		novaSession.clear();
	});

	it('appends a user turn and attaches a brainstorm artifact on success', async () => {
		const fetchMock = vi.fn(async () =>
			jsonResponse({
				session,
				model: 'mock',
				tokensUsed: 0,
				includedScopes: ['project', 'worldbuilding'],
				warnings: [],
				contextItemCount: 3,
			}),
		);

		const result = await runNovaBrainstormSession(
			{ seedIdea: session.seedIdea, projectId: 'project-1' },
			{ fetch: fetchMock },
		);

		expect(result.ok).toBe(true);
		expect(novaSession.isStreaming).toBe(false);
		expect(novaSession.messages).toHaveLength(2);
		expect(novaSession.messages[0]).toMatchObject({
			role: 'user',
			content: `Brainstorm: ${session.seedIdea}`,
		});
		expect(novaSession.messages[1]?.artifact).toMatchObject({
			kind: 'brainstorm-session',
			session: { seedIdea: session.seedIdea },
		});
		expect(novaSession.contextDisclosure).toMatchObject({
			scopes: ['project', 'worldbuilding'],
			itemCount: 3,
		});
	});

	it('marks the assistant turn as failed when generation fails', async () => {
		const fetchMock = vi.fn(async () =>
			jsonResponse({ error: { code: 'provider_error', message: 'Provider failed.' } }, 502),
		);

		const result = await runNovaBrainstormSession({ seedIdea: 'seed' }, { fetch: fetchMock });

		expect(result.ok).toBe(false);
		expect(novaSession.isStreaming).toBe(false);
		expect(novaSession.messages.at(-1)).toMatchObject({
			role: 'nova',
			status: 'error',
			error: 'Provider failed.',
		});
	});
});
