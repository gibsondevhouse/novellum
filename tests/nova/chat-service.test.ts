/**
 * plan-023 stage-005 phase-006 — Nova chat service tests.
 */
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const streamCompleteMock = vi.fn();
const buildRagContextMock = vi.fn();
const outlineGenerateMock = vi.fn();

vi.mock('$lib/ai/openrouter.js', async () => {
	const actual = await vi.importActual<typeof import('$lib/ai/openrouter.js')>(
		'$lib/ai/openrouter.js',
	);
	class MockOpenRouterClient {
		streamComplete(...args: unknown[]) {
			return streamCompleteMock(...args);
		}
		complete() {
			return Promise.resolve({ text: '', model: '', tokensUsed: 0 });
		}
	}
	return {
		...actual,
		OpenRouterClient: MockOpenRouterClient,
	};
});

vi.mock('$lib/stores/model-selection.svelte.js', () => ({
	getSelectedModel: () => 'mock/model',
}));

vi.mock('$modules/nova/services/context-hooks.js', () => ({
	buildRagContext: (...args: unknown[]) => buildRagContextMock(...args),
}));

vi.mock('$modules/nova/stores/outline-generation-state.svelte.js', () => ({
	outlineGenerationState: {
		generate: (...args: unknown[]) => outlineGenerateMock(...args),
	},
}));

buildRagContextMock.mockResolvedValue({
		aiContext: null,
		contextText: '',
		includedScopes: [],
		warnings: [],
});

import { sendNovaChat } from '$modules/nova/services/chat-service.js';
import { novaSession } from '$modules/nova/stores/nova-session.svelte.js';
import { contextControl } from '$modules/nova/stores/context-control.svelte.js';
import { setNovaAgenticFlag } from '$modules/nova/services/feature-flags.js';
import {
	clearTools,
	listModelCallableTools,
	registerTool,
} from '$modules/nova/services/tool-registry.js';

async function* yieldChunks(chunks: string[]): AsyncGenerator<string> {
	for (const chunk of chunks) yield chunk;
}

describe('sendNovaChat', () => {
	beforeEach(() => {
		streamCompleteMock.mockReset();
		buildRagContextMock.mockReset();
		outlineGenerateMock.mockReset();
		buildRagContextMock.mockResolvedValue({
			aiContext: null,
			contextText: '',
			includedScopes: [],
			warnings: [],
		});
		outlineGenerateMock.mockResolvedValue({
			ok: true,
			status: 'succeeded',
			checkpointId: 'outline-checkpoint-1',
		});
		novaSession.clear();
		contextControl.unbind();
	});

	it('appends user message + streams assistant content to completion', async () => {
		streamCompleteMock.mockReturnValueOnce(yieldChunks(['Hello, ', 'world.']));

		await sendNovaChat({
			prompt: 'Continue',
			projectId: 'p1',
			activeSceneId: 's1',
			activeChapterId: 'c1',
		});

		expect(novaSession.messages).toHaveLength(2);
		expect(novaSession.messages[0]).toMatchObject({
			role: 'user',
			content: 'Continue',
			status: 'complete',
		});
		expect(novaSession.messages[1]).toMatchObject({
			role: 'nova',
			content: 'Hello, world.',
			status: 'complete',
		});
		expect(novaSession.isStreaming).toBe(false);
		expect(streamCompleteMock).toHaveBeenCalledTimes(1);
		const [payload, opts] = streamCompleteMock.mock.calls[0];
		expect(payload.model).toBe('mock/model');
		expect(payload.messages[0].role).toBe('system');
		expect(payload.messages[1]).toEqual({ role: 'user', content: 'Continue' });
		expect(opts?.signal).toBeInstanceOf(AbortSignal);
	});

	it('skips empty prompts', async () => {
		await sendNovaChat({
			prompt: '   ',
			projectId: 'p1',
			activeSceneId: 's1',
			activeChapterId: null,
		});
		expect(novaSession.messages).toHaveLength(0);
		expect(streamCompleteMock).not.toHaveBeenCalled();
	});

	it('skips when a stream is already active', async () => {
		novaSession.beginStream('nova');
		await sendNovaChat({
			prompt: 'New prompt',
			projectId: 'p1',
			activeSceneId: 's1',
			activeChapterId: null,
		});
		// No new user message appended because store was already streaming.
		expect(novaSession.messages.some((m) => m.role === 'user')).toBe(false);
	});

	it('flips assistant message to error on transport failure', async () => {
		streamCompleteMock.mockImplementationOnce(async function* () {
			throw new Error('Network down');
			yield '';
		});

		await sendNovaChat({
			prompt: 'test',
			projectId: 'p1',
			activeSceneId: 's1',
			activeChapterId: null,
		});

		const last = novaSession.messages.at(-1);
		expect(last?.role).toBe('nova');
		expect(last?.status).toBe('error');
		expect(last?.error).toContain('Network down');
		// User message preserved.
		expect(novaSession.messages.some((m) => m.role === 'user' && m.content === 'test')).toBe(true);
	});

	it('preserves partial content when aborted mid-stream', async () => {
		streamCompleteMock.mockImplementationOnce(async function* (
			_payload: unknown,
			opts: { signal?: AbortSignal } = {},
		) {
			yield 'Once upon';
			// Trigger an abort after the first chunk; the next yield must
			// surface as an AbortError so the chat-service catches it.
			const id = novaSession.activeStreamId;
			if (id) novaSession.abort(id);
			if (opts.signal?.aborted) {
				const err = new Error('aborted');
				err.name = 'AbortError';
				throw err;
			}
		});

		await sendNovaChat({
			prompt: 'go',
			projectId: 'p1',
			activeSceneId: 's1',
			activeChapterId: null,
		});

		const last = novaSession.messages.at(-1);
		expect(last?.role).toBe('nova');
		expect(last?.status).toBe('aborted');
		expect(last?.content).toBe('Once upon');
	});

	it('routes to the chat task when sending a Nova message', async () => {
		// 2026-05-13: Nova is a chat-first surface. Sending a message must
		// route through the dedicated `chat` task (conversational role,
		// plain-text output) rather than `continue` (narrative-continuation
		// role, prose output), otherwise the model hallucinates manuscript
		// text in response to brainstorming prompts.
		streamCompleteMock.mockReturnValueOnce(yieldChunks(['ok']));

		await sendNovaChat({
			prompt: 'plan',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
		});

		expect(streamCompleteMock).toHaveBeenCalledTimes(1);
		const [payload] = streamCompleteMock.mock.calls[0];
		const systemPrompt = payload.messages[0].content.toLowerCase();
		expect(systemPrompt).toContain('working conversation');
		expect(systemPrompt).not.toContain('narrative continuation');
	});

	it('injects project baseline context into chat prompts when no scene is active', async () => {
		buildRagContextMock.mockResolvedValueOnce({
			aiContext: {
				policy: 'project_summary',
				scene: null,
				adjacentScenes: [],
				chapter: null,
				beats: [],
				characters: [],
				locations: [],
				loreEntries: [],
				plotThreads: [],
				project: {
					id: 'p1',
					title: 'Signal Fire',
					genre: 'fantasy',
					logline: 'A scout races a civil war to save her brother.',
					synopsis: 'A full synopsis goes here.',
					targetWordCount: 100000,
					status: 'drafting',
					projectType: 'novel',
					lastOpenedAt: '',
					stylePresetId: 'preset-cinematic',
					systemPrompt: '',
					negativePrompt: '',
					createdAt: '',
					updatedAt: '2026-05-27T22:00:00.000Z',
				},
			},
			contextText: '',
			includedScopes: ['project', 'project-summary'],
			warnings: [],
		});
		streamCompleteMock.mockReturnValueOnce(yieldChunks(['Grounded answer']));

		await sendNovaChat({
			prompt: 'What is this novel about?',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
		});

		expect(buildRagContextMock).toHaveBeenCalledWith({
			projectId: 'p1',
			activeSceneId: null,
			policy: 'worldbuilding_scope',
		});

		const [payload] = streamCompleteMock.mock.calls[0];
		const systemPrompt = payload.messages[0].content;
		expect(systemPrompt).toContain('PROJECT: "Signal Fire"');
		expect(systemPrompt).toContain('Logline: A scout races a civil war to save her brother.');
		expect(systemPrompt).toContain('Synopsis: A full synopsis goes here.');
		expect(systemPrompt).toContain('working conversation');
	});

	it('applies context control overrides to the chat prompt', async () => {
		contextControl.registerEntities([
			{
				id: 'char-pin',
				kind: 'character',
				label: 'Pinned Cartographer',
				summary: 'Knows which maps are forged.',
			},
		]);
		contextControl.hydrate({
			pinnedEntityIds: ['char-pin'],
			excludedEntityIds: ['char-exclude'],
		});
		buildRagContextMock.mockResolvedValueOnce({
			aiContext: {
				policy: 'worldbuilding_scope',
				scene: null,
				adjacentScenes: [],
				chapter: null,
				beats: [],
				characters: [
					{
						id: 'char-keep',
						projectId: 'p1',
						name: 'Kept Character',
						role: 'ally',
						traits: ['steady'],
						bio: '',
						goals: '',
						arc: '',
						createdAt: '',
						updatedAt: '',
					},
					{
						id: 'char-exclude',
						projectId: 'p1',
						name: 'Do Not Use',
						role: 'rival',
						traits: ['stale'],
						bio: '',
						goals: '',
						arc: '',
						createdAt: '',
						updatedAt: '',
					},
				],
				locations: [],
				loreEntries: [],
				plotThreads: [],
				project: null,
			},
			contextText: '',
			includedScopes: ['characters'],
			warnings: [],
		});
		streamCompleteMock.mockReturnValueOnce(yieldChunks(['ok']));

		await sendNovaChat({
			prompt: 'Use the pinned context.',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
		});

		const [payload] = streamCompleteMock.mock.calls[0];
		const systemPrompt = payload.messages[0].content;
		expect(systemPrompt).toContain('Kept Character');
		expect(systemPrompt).not.toContain('Do Not Use');
		expect(systemPrompt).toContain('# User Context Overrides');
		expect(systemPrompt).toContain('[Character:char-pin] Pinned Cartographer');
		expect(systemPrompt).toContain('Explicitly excluded entity IDs: char-exclude');
	});

	it('blocks project-dependent generation when no project is open', async () => {
		await sendNovaChat({
			prompt: 'Draft the first chapter',
			projectId: null,
			activeSceneId: null,
			activeChapterId: null,
		});

		expect(streamCompleteMock).not.toHaveBeenCalled();
		expect(novaSession.messages).toHaveLength(2);
		expect(novaSession.messages[0]).toMatchObject({ role: 'user', content: 'Draft the first chapter' });
		expect(novaSession.messages[1]).toMatchObject({
			role: 'nova',
			status: 'error',
		});
		expect(novaSession.messages[1].content).toContain('Open a project');
	});

	it('routes write-mode outline builds to checkpoint generation', async () => {
		await sendNovaChat({
			prompt: 'Generate a story outline from the worldbuilding notes.',
			mode: 'write',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
		});

		expect(outlineGenerateMock).toHaveBeenCalledWith(
			'p1',
			'Generate a story outline from the worldbuilding notes.',
		);
		expect(streamCompleteMock).not.toHaveBeenCalled();
		expect(novaSession.messages).toHaveLength(2);
		expect(novaSession.messages[1]).toMatchObject({
			role: 'nova',
			status: 'complete',
		});
		expect(novaSession.messages[1].content).toContain('outline-checkpoint-1');
		expect(novaSession.messages[1].artifact).toBeUndefined();
	});

	it('blocks generation when project baseline fields are missing', async () => {
		buildRagContextMock.mockResolvedValueOnce({
			aiContext: {
				policy: 'project_summary',
				scene: null,
				adjacentScenes: [],
				chapter: null,
				beats: [],
				characters: [],
				locations: [],
				loreEntries: [],
				plotThreads: [],
				project: {
					id: 'p1',
					title: 'Untitled',
					genre: '',
					logline: '',
					synopsis: '',
					targetWordCount: 0,
					status: 'drafting',
					projectType: 'novel',
					lastOpenedAt: '',
					stylePresetId: '',
					systemPrompt: '',
					negativePrompt: '',
					createdAt: '',
					updatedAt: '',
				},
			},
			contextText: '',
			includedScopes: ['project', 'project-summary'],
			warnings: ['Project context is missing: logline, synopsis.'],
		});

		await sendNovaChat({
			prompt: 'Create a chapter outline',
			projectId: 'p1',
			activeSceneId: null,
			activeChapterId: null,
		});

		expect(streamCompleteMock).not.toHaveBeenCalled();
		expect(novaSession.messages).toHaveLength(2);
		expect(novaSession.messages[1]).toMatchObject({ role: 'nova', status: 'complete' });
		expect(novaSession.messages[1].content).toContain('missing logline and synopsis');
	});

	describe('agentic flag — tools field on the OpenRouter payload', () => {
		beforeEach(() => {
			clearTools();
			// plan-025: the four agentic stub tools were cut. Register a
			// fake tool inline so we can still assert the `tools` field is
			// populated when the agentic flag is on.
			registerTool(
				{
					id: 'test.fake-tool',
					description: 'Inline tool used only by this test.',
					capability: 'read_only',
					inputSchema: { type: 'object', properties: {} },
				},
				async () => ({ status: 'success', output: null }),
			);
			registerTool(
				{
					id: 'authorDraft.accept_checkpoint',
					description: 'Mutation command used only by this test.',
					capability: 'mutation_command',
					inputSchema: { type: 'object', properties: {} },
				},
				async () => ({ status: 'success', output: null }),
			);
			setNovaAgenticFlag(null);
		});

		afterAll(() => {
			setNovaAgenticFlag(null);
			clearTools();
		});

		it('omits the tools field when the agentic flag is off (default)', async () => {
			streamCompleteMock.mockReturnValueOnce(yieldChunks(['ok']));
			await sendNovaChat({
				prompt: 'hello',
				projectId: 'p1',
				activeSceneId: 's1',
				activeChapterId: null,
			});
			const [payload] = streamCompleteMock.mock.calls[0];
			expect(payload.tools).toBeUndefined();
		});

		it('attaches model-callable tools when the agentic flag is on', async () => {
			setNovaAgenticFlag(true);
			streamCompleteMock.mockReturnValueOnce(yieldChunks(['ok']));
			await sendNovaChat({
				prompt: 'hello',
				projectId: 'p1',
				activeSceneId: 's1',
				activeChapterId: null,
			});
			const [payload] = streamCompleteMock.mock.calls[0];
			expect(Array.isArray(payload.tools)).toBe(true);
			expect(payload.tools).toHaveLength(listModelCallableTools().length);
			const ids = (payload.tools as { id: string }[]).map((t) => t.id).sort();
			expect(ids).toEqual(['test.fake-tool']);
			expect(ids).not.toContain('authorDraft.accept_checkpoint');
		});
	});
});
