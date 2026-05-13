/**
 * plan-023 stage-005 phase-006 — Nova chat service tests.
 */
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const streamCompleteMock = vi.fn();

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
	buildRagContext: vi.fn().mockResolvedValue({
		aiContext: null,
		contextText: '',
		includedScopes: [],
		warnings: [],
	}),
}));

import { sendNovaChat } from '$modules/nova/services/chat-service.js';
import { novaSession } from '$modules/nova/stores/nova-session.svelte.js';
import { setNovaAgenticFlag } from '$modules/nova/services/feature-flags.js';
import {
	clearTools,
	listTools,
	registerTool,
} from '$modules/nova/services/tool-registry.js';

async function* yieldChunks(chunks: string[]): AsyncGenerator<string> {
	for (const chunk of chunks) yield chunk;
}

describe('sendNovaChat', () => {
	beforeEach(() => {
		streamCompleteMock.mockReset();
		novaSession.clear();
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

		it('attaches tools = listTools() when the agentic flag is on', async () => {
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
			expect(payload.tools).toHaveLength(listTools().length);
			const ids = (payload.tools as { id: string }[]).map((t) => t.id).sort();
			expect(ids).toEqual(['test.fake-tool']);
		});
	});
});

